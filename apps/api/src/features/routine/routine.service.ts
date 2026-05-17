import { getAIClient } from '../../lib/ai.js'
import { AI_PROVIDERS, TASK_CATEGORIES } from '../../constants/index.js'
import { User, IUser } from '../user/user.model.js'
import { getEventsForDay } from '../calendar/calendar.service.js'
import { findRoutineByDate, saveRoutine, updateTaskStatus, addMeetingToRoutine, endMeetingEarly } from './routine.repository.js'
import { IRoutine, IRoutineTask } from './routine.model.js'
import { NotFoundError, ValidationError } from '../../lib/errors.js'
import { Types } from 'mongoose'
import { scheduleNotificationsForRoutine, scheduleMorningCheckinReminder } from '../notifications/notification.service.js'
import { computeUserActivityForToday } from '../groups/groups.service.js'

// ─── Types ────────────────────────────────────────────────────────────────────

interface AITask {
  time: string
  durationMinutes: number
  category: string
  title: string
  description: string
}

// ─── Prompt builder ───────────────────────────────────────────────────────────

function buildPrompt(
  user: IUser,
  dayEvents: Awaited<ReturnType<typeof getEventsForDay>>,
  checkin: { energyLevel: string; mood: string; anythingDifferentToday?: string },
  medicineAnchors: string[]
): string {
  const profile = user.profile
  const workStart = profile?.commute?.homeToOfficeTime ?? '09:00'
  const workEnd = profile?.commute?.officeToHomeTime ?? '18:00'
  const peakWindow = profile?.focus?.peakWindow ?? 'morning'
  const role = profile?.role ?? 'professional'
  const workMode = profile?.workMode ?? 'office'

  const calendarBlock =
    dayEvents.events.length > 0
      ? dayEvents.events
          .map((e) => {
            const start = new Date(e.startTime).toTimeString().slice(0, 5)
            const end = new Date(e.endTime).toTimeString().slice(0, 5)
            return `  - ${start}–${end}: ${e.title}`
          })
          .join('\n')
      : '  (No meetings today)'

  const anchorsBlock =
    medicineAnchors.length > 0
      ? medicineAnchors.map((a) => `  - ${a}`).join('\n')
      : '  (None)'

  // NOTE: medicine names are deliberately excluded from this prompt
  return `You are WellPath, an AI that creates warm, realistic daily routines for busy people.

User profile:
  Name: ${user.name}
  Role: ${role}
  Work mode: ${workMode}
  Peak energy window: ${peakWindow}
  Work hours: ${workStart} – ${workEnd}

Today (${dayEvents.date}):
  Energy: ${checkin.energyLevel}
  Mood: ${checkin.mood}
  Day type: ${dayEvents.dayType} (${dayEvents.totalMeetingMinutes} min in meetings, ${dayEvents.totalFreeMinutes} min free)
${checkin.anythingDifferentToday ? `  Note: ${checkin.anythingDifferentToday}` : ''}

Calendar today:
${calendarBlock}

Fixed anchors — include these exactly as-is (do not change their time or category):
${anchorsBlock}

Generate a complete, realistic daily routine as a JSON array. Each object must have:
  time           "HH:MM" 24-hour format
  durationMinutes  number
  category       one of: ${TASK_CATEGORIES.join(', ')}
  title          short, human task name (max 6 words)
  description    warm, encouraging 1-2 sentence description

Rules:
1. Never schedule tasks during calendar events
2. Include fixed anchors at their exact times with category "medicine"
3. Match energy level: low → shorter focus blocks, lighter tasks; high → longer deep work
4. Always include: morning hydration, lunch, at least one break, wind-down before end of day
5. Keep commmute tasks if work mode is office or hybrid
6. Respond with ONLY a valid JSON array — no explanation, no markdown fences`
}

// ─── AI call + parse ──────────────────────────────────────────────────────────

async function generateTasksFromAI(prompt: string): Promise<AITask[]> {
  const ai = getAIClient()
  const raw = await ai.chat(prompt)

  // Strip possible markdown code fences
  const cleaned = raw.replace(/^```(?:json)?\n?/m, '').replace(/\n?```$/m, '').trim()

  try {
    const parsed = JSON.parse(cleaned) as unknown
    if (!Array.isArray(parsed)) return []
    return parsed.filter(
      (t): t is AITask =>
        typeof t === 'object' &&
        t !== null &&
        typeof (t as AITask).time === 'string' &&
        typeof (t as AITask).durationMinutes === 'number' &&
        typeof (t as AITask).title === 'string'
    )
  } catch {
    console.error('[routine] Failed to parse AI output:', raw.slice(0, 200))
    return []
  }
}

// ─── Medicine anchors ─────────────────────────────────────────────────────────

function buildMedicineAnchors(user: IUser): { anchors: string[]; tasks: AITask[] } {
  const medicines = user.profile?.health?.medicines ?? []
  const anchors: string[] = []
  const tasks: AITask[] = []

  for (const med of medicines) {
    if (!med.reminderEnabled) continue
    for (const timing of med.timings) {
      anchors.push(`medicine_reminder at ${timing}`)
      tasks.push({
        time: timing,
        durationMinutes: 5,
        category: 'medicine',
        // Deliberately generic — medicine name is never in the routine
        title: 'Medicine reminder',
        description: "Time for your medicine. A small habit that keeps you at your best.",
      })
    }
  }

  return { anchors, tasks }
}

// ─── Merge + sort ─────────────────────────────────────────────────────────────

function mergeTasks(aiTasks: AITask[], medicineTasks: AITask[]): IRoutineTask[] {
  // Remove any AI-generated medicine tasks (AI shouldn't generate these)
  const filtered = aiTasks.filter((t) => t.category !== 'medicine')

  // Merge and sort by time
  const all = [...filtered, ...medicineTasks].sort((a, b) => a.time.localeCompare(b.time))

  return all.map((t) => ({
    _id: new Types.ObjectId(),
    time: t.time,
    durationMinutes: t.durationMinutes,
    category: t.category as IRoutineTask['category'],
    title: t.title,
    description: t.description,
    status: 'pending' as const,
  }))
}

// ─── Fallback routine ─────────────────────────────────────────────────────────

function buildFallbackTasks(
  user: IUser,
  workStart: string,
  workEnd: string,
  _medicineTasks: AITask[]
): AITask[] {
  const base: AITask[] = [
    { time: '07:30', durationMinutes: 5, category: 'hydration', title: 'Morning water', description: 'Start the day with a glass of water. Your body will thank you.' },
    { time: workStart, durationMinutes: 25, category: 'focus_work', title: 'Morning focus block', description: 'Tackle your most important task while your energy is fresh.' },
    { time: '13:00', durationMinutes: 30, category: 'nutrition', title: 'Lunch break', description: "Step away from your screen and have a proper meal — you've earned it." },
    { time: '15:30', durationMinutes: 10, category: 'hydration', title: 'Afternoon water', description: 'Keep the momentum going with some water.' },
    { time: workEnd, durationMinutes: 15, category: 'wind_down', title: 'Wrap up the day', description: "Close your tabs, check tomorrow's priorities, and call it a day." },
  ]
  return base
}

// ─── Public API ───────────────────────────────────────────────────────────────

export async function generateRoutine(userId: string, date: string): Promise<IRoutine> {
  const user = await User.findById(userId)
  if (!user) throw new NotFoundError('User not found')

  const dayEvents = await getEventsForDay(userId, date).catch(() => ({
    date,
    dayType: 'light' as const,
    totalMeetingMinutes: 0,
    totalFreeMinutes: 480,
    events: [],
  }))

  const routine = await findRoutineByDate(userId, date)
  const checkin = routine?.morningCheckin ?? { energyLevel: 'medium', mood: 'okay' }

  const { anchors, tasks: medicineTasks } = buildMedicineAnchors(user)

  const workStart = user.profile?.commute?.homeToOfficeTime ?? '09:00'
  const workEnd = user.profile?.commute?.officeToHomeTime ?? '18:00'

  const isAIConfigured =
    process.env.USE_LOCAL_AI === 'true'
      ? !!process.env.OLLAMA_BASE_URL
      : !!process.env.GEMINI_API_KEY

  let aiTasks: AITask[] = []

  if (isAIConfigured) {
    try {
      const prompt = buildPrompt(user, dayEvents, checkin, anchors)
      aiTasks = await generateTasksFromAI(prompt)
    } catch (err) {
      console.error('[routine] AI generation failed, using fallback:', err)
    }
  }

  if (aiTasks.length === 0) {
    aiTasks = buildFallbackTasks(user, workStart, workEnd, medicineTasks)
  }

  const tasks = mergeTasks(aiTasks, medicineTasks)

  // Build prompt snapshot — exclude all medicine/medical data
  const safeSnapshot = isAIConfigured
    ? buildPrompt(user, dayEvents, checkin, anchors)
    : 'fallback_routine'

  const savedRoutine = await saveRoutine(userId, date, {
    dayType: dayEvents.dayType,
    totalMeetingMinutes: dayEvents.totalMeetingMinutes,
    totalFreeMinutes: dayEvents.totalFreeMinutes,
    tasks,
    generatedBy: process.env.USE_LOCAL_AI === 'true' ? AI_PROVIDERS.OLLAMA : AI_PROVIDERS.GEMINI,
    generationPromptSnapshot: safeSnapshot,
    generatedAt: new Date(),
  })

  // Schedule push notifications — fire-and-forget so AI latency is not affected
  scheduleNotificationsForRoutine(savedRoutine).catch((err) =>
    console.error('[routine] notification scheduling failed:', err)
  )

  scheduleMorningCheckinReminder(userId, String(savedRoutine._id), date, workStart).catch((err) =>
    console.error('[routine] morning checkin reminder failed:', err)
  )

  return savedRoutine
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function addMinutes(time: string, minutes: number): string {
  const [h, m] = time.split(':').map(Number)
  const total = h * 60 + m + minutes
  return `${String(Math.floor(total / 60) % 24).padStart(2, '0')}:${String(total % 60).padStart(2, '0')}`
}

function diffMinutes(from: string, to: string): number {
  const [fh, fm] = from.split(':').map(Number)
  const [th, tm] = to.split(':').map(Number)
  return (th * 60 + tm) - (fh * 60 + fm)
}

// ─── Ad-hoc meetings ──────────────────────────────────────────────────────────

export async function addAdHocMeeting(
  userId: string,
  routineId: string,
  dto: { title: string; startTime: string; durationMinutes: number }
): Promise<IRoutine> {
  const routine = await findRoutineByDate(userId, new Date().toISOString().slice(0, 10))
  if (!routine || String(routine._id) !== routineId) throw new NotFoundError('Routine not found')
  if (String(routine.userId) !== userId) throw new ValidationError('Forbidden')

  const endTime = addMinutes(dto.startTime, dto.durationMinutes)
  const updated = await addMeetingToRoutine(routineId, {
    isAdHoc: true,
    title: dto.title,
    startTime: dto.startTime,
    endTime,
    durationMinutes: dto.durationMinutes,
    priorityLevel: 'unset',
    endedEarly: false,
  })
  if (!updated) throw new NotFoundError('Routine not found')
  return updated
}

export async function markMeetingEndedEarly(
  userId: string,
  routineId: string,
  meetingId: string,
  actualEndTime: string
): Promise<{ routine: IRoutine; freeMinutesGained: number }> {
  const routine = await findRoutineByDate(userId, new Date().toISOString().slice(0, 10))
  if (!routine || String(routine._id) !== routineId) throw new NotFoundError('Routine not found')
  if (String(routine.userId) !== userId) throw new ValidationError('Forbidden')

  const meeting = routine.meetings.find((m) => String(m._id) === meetingId)
  if (!meeting) throw new NotFoundError('Meeting not found')

  const freeMinutesGained = Math.max(0, diffMinutes(actualEndTime, meeting.endTime))
  const updated = await endMeetingEarly(routineId, meetingId, actualEndTime, freeMinutesGained)
  if (!updated) throw new NotFoundError('Routine not found')
  return { routine: updated, freeMinutesGained }
}

export async function getTodayRoutine(userId: string): Promise<IRoutine | null> {
  const date = new Date().toISOString().slice(0, 10)
  return findRoutineByDate(userId, date)
}

export async function markTaskStatus(
  userId: string,
  routineId: string,
  taskId: string,
  status: 'done' | 'missed' | 'skipped',
  extras: { missedReason?: string; didInstead?: string } = {}
): Promise<IRoutine> {
  const routine = await updateTaskStatus(routineId, taskId, status, {
    completedAt: status === 'done' ? new Date() : undefined,
    ...extras,
  })
  if (!routine) throw new NotFoundError('Routine or task not found')
  if (String(routine.userId) !== userId) throw new ValidationError('Forbidden')

  // Update group activity projection — fire-and-forget
  computeUserActivityForToday(userId).catch((err) =>
    console.error('[groups] activity computation failed:', err)
  )

  return routine
}

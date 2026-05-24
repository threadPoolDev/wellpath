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
import { getReflectionForWeek } from '../weekly/weekly.service.js'
import { format, startOfWeek } from 'date-fns'

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
  medicineAnchors: string[],
  weeklyContext?: { lastWeekRating: string | null; oneIntention: string | null } | null
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

  const homeToOfficeDuration = profile?.commute?.homeToOfficeDuration ?? 0
  const officeToHomeDuration = profile?.commute?.officeToHomeDuration ?? 0
  const commuteMode = profile?.commute?.mode ?? 'none'

  // Departure time = workStart - travel time (so user arrives at workStart)
  const departureTime = homeToOfficeDuration > 0
    ? minToTime(timeToMin(workStart) - homeToOfficeDuration)
    : null

  const commuteBlock = (workMode === 'office' || workMode === 'hybrid') && homeToOfficeDuration > 0
    ? `Commute (mode: ${commuteMode}):
  - Morning: depart home at ${departureTime}, travel ${homeToOfficeDuration} min, arrive at work at ${workStart}
    → Schedule category "commute" task at time "${departureTime}", durationMinutes ${homeToOfficeDuration}
  - Evening: depart work at ${workEnd}, travel ${officeToHomeDuration > 0 ? officeToHomeDuration : homeToOfficeDuration} min home
    → Schedule category "commute" task at time "${workEnd}", durationMinutes ${officeToHomeDuration > 0 ? officeToHomeDuration : homeToOfficeDuration}`
    : '  (None — WFH or no commute data)'

  // NOTE: medicine names are deliberately excluded from this prompt
  return `You are WellPath, an AI that creates warm, realistic daily routines for busy people.

User profile:
  Name: ${user.name}
  Role: ${role}
  Work mode: ${workMode}
  Peak energy window: ${peakWindow}
  Work hours: ${workStart} – ${workEnd}

${commuteBlock}

Today (${dayEvents.date}):
  Energy: ${checkin.energyLevel}
  Mood: ${checkin.mood}
  Day type: ${dayEvents.dayType} (${dayEvents.totalMeetingMinutes} min in meetings, ${dayEvents.totalFreeMinutes} min free)
${checkin.anythingDifferentToday ? `  Note: ${checkin.anythingDifferentToday}` : ''}
${weeklyContext ? `  Weekly intention: "${weeklyContext.oneIntention ?? 'not specified'}" (last week felt: ${weeklyContext.lastWeekRating ?? 'unknown'})` : ''}
${weeklyContext && (weeklyContext.lastWeekRating === 'exhausting' || weeklyContext.lastWeekRating === 'tough') ? '  Note: This is Monday and the user had a hard last week — favour a lighter, more restorative routine today.' : ''}

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
4. Always include: morning hydration, lunch (category "nutrition") between 12:00 and 14:00, at least one break, wind-down before end of day
5. CRITICAL: If commute data is provided above, include BOTH commute legs with the EXACT time and durationMinutes specified — never use 0 for commute duration
6. CRITICAL: Never schedule focus_work, exercise, or learning tasks before ${workStart} — that is the work start time
7. CRITICAL: Never create a single focus_work block longer than 3 hours (180 minutes). If more deep work is needed, split into two blocks with a break or meal in between
8. CRITICAL: Tasks must not overlap. Each task's end time (time + durationMinutes) must be before or equal to the start time of the next task
9. Respond with ONLY a valid JSON array — no explanation, no markdown fences`
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

// ─── Time helpers ─────────────────────────────────────────────────────────────

function timeToMin(t: string): number {
  const [h, m] = t.split(':').map(Number)
  return h * 60 + m
}

function minToTime(min: number): string {
  const clamped = Math.max(0, Math.min(min, 23 * 60 + 59))
  return `${String(Math.floor(clamped / 60)).padStart(2, '0')}:${String(clamped % 60).padStart(2, '0')}`
}

// ─── Overlap resolution ───────────────────────────────────────────────────────
// Long "splittable" tasks (focus_work, learning, exercise) that overlap with
// shorter fixed tasks (nutrition, medicine, break) are split around them.
// Non-splittable tasks that overlap are trimmed to start after the previous task.

const SPLITTABLE_CATEGORIES = new Set(['focus_work', 'learning', 'exercise'])
const MIN_BLOCK_MINUTES = 15

function resolveOverlapsAndSplit(tasks: AITask[]): AITask[] {
  if (tasks.length === 0) return []

  // Process in start-time order via a mutable queue
  const queue = [...tasks].sort((a, b) => a.time.localeCompare(b.time))
  const result: AITask[] = []

  while (queue.length > 0) {
    const task = queue.shift()!
    const tStart = timeToMin(task.time)
    const tEnd = tStart + task.durationMinutes

    // Only the last result task can conflict (we process in chronological order)
    const prev = result.length > 0 ? result[result.length - 1] : null
    const prevEnd = prev ? timeToMin(prev.time) + prev.durationMinutes : -1

    if (!prev || tStart >= prevEnd) {
      result.push({ ...task })
      continue
    }

    // Overlap: current task starts before previous one ends
    if (SPLITTABLE_CATEGORIES.has(prev.category)) {
      // Trim previous task to end when current starts
      const firstPartDuration = tStart - timeToMin(prev.time)
      if (firstPartDuration >= MIN_BLOCK_MINUTES) {
        result[result.length - 1] = { ...prev, durationMinutes: firstPartDuration }
      } else {
        result.pop()
      }

      // Add current task
      result.push({ ...task })

      // If previous task had time remaining after current task ends, re-queue it
      const remainder = prevEnd - tEnd
      if (remainder >= MIN_BLOCK_MINUTES) {
        const continuation: AITask = { ...prev, time: minToTime(tEnd), durationMinutes: remainder }
        const insertAt = queue.findIndex((q) => timeToMin(q.time) > tEnd)
        if (insertAt === -1) queue.push(continuation)
        else queue.splice(insertAt, 0, continuation)
      }
    } else if (SPLITTABLE_CATEGORIES.has(task.category)) {
      // Current task is splittable — start it after previous ends
      const shiftedDuration = tEnd - prevEnd
      if (shiftedDuration >= MIN_BLOCK_MINUTES) {
        const shifted: AITask = { ...task, time: minToTime(prevEnd), durationMinutes: shiftedDuration }
        queue.unshift(shifted)
      }
    } else {
      // Neither splittable — trim current to start after previous
      const trimmedDuration = tEnd - prevEnd
      if (trimmedDuration >= MIN_BLOCK_MINUTES) {
        queue.unshift({ ...task, time: minToTime(prevEnd), durationMinutes: trimmedDuration })
      }
    }
  }

  return result
}

// ─── Commute task correction ──────────────────────────────────────────────────
// The AI sometimes generates commute tasks with durationMinutes = 0, or places
// the morning commute at workStart instead of (workStart - duration).
// This post-processor fixes both issues using the user's actual commute data.

function fixCommuteTasks(tasks: AITask[], user: IUser, workStart: string, workEnd: string): AITask[] {
  const homeToOfficeDuration = user.profile?.commute?.homeToOfficeDuration ?? 0
  const officeToHomeDuration = user.profile?.commute?.officeToHomeDuration ?? homeToOfficeDuration
  const workMode = user.profile?.workMode ?? 'office'

  if ((workMode !== 'office' && workMode !== 'hybrid') || homeToOfficeDuration === 0) {
    return tasks
  }

  const workStartMin = timeToMin(workStart)
  const workEndMin = timeToMin(workEnd)
  const morningDepartureMin = workStartMin - homeToOfficeDuration

  return tasks.map((task) => {
    if (task.category !== 'commute') return task

    const tMin = timeToMin(task.time)

    // Classify as morning or evening commute by proximity
    const distToMorning = Math.abs(tMin - morningDepartureMin)
    const distToEvening = Math.abs(tMin - workEndMin)
    const isMorning = distToMorning <= distToEvening

    if (isMorning) {
      return {
        ...task,
        time: minToTime(morningDepartureMin),
        durationMinutes: homeToOfficeDuration,
      }
    } else {
      return {
        ...task,
        time: workEnd,
        durationMinutes: officeToHomeDuration,
      }
    }
  })
}

// ─── Work-hours boundary enforcement ─────────────────────────────────────────
// Removes or trims focus_work tasks that start before workStart.
// Other categories (hydration, exercise, wind_down, etc.) are allowed pre-work.

function enforceWorkBoundaries(tasks: AITask[], workStart: string): AITask[] {
  const workStartMin = timeToMin(workStart)
  return tasks.flatMap((task) => {
    if (!SPLITTABLE_CATEGORIES.has(task.category)) return [task]
    const tStart = timeToMin(task.time)
    if (tStart >= workStartMin) return [task]

    // Task starts before work start — trim or drop
    const tEnd = tStart + task.durationMinutes
    if (tEnd <= workStartMin) return []  // entirely before work start, drop it

    // Partially before — trim to start at workStart
    return [{ ...task, time: workStart, durationMinutes: tEnd - workStartMin }]
  })
}

// ─── Merge + sort ─────────────────────────────────────────────────────────────

function mergeTasks(aiTasks: AITask[], medicineTasks: AITask[], user: IUser, workStart: string, workEnd: string): IRoutineTask[] {
  // Remove any AI-generated medicine tasks (AI shouldn't generate these)
  const filtered = aiTasks.filter((t) => t.category !== 'medicine')

  // Merge medicine anchors first so they are treated as fixed points
  const combined = [...filtered, ...medicineTasks]

  // Fix commute task durations and times before any other processing
  const withCommute = fixCommuteTasks(combined, user, workStart, workEnd)

  // Enforce work hours: move/drop focus_work before workStart
  const bounded = enforceWorkBoundaries(withCommute, workStart)

  // Resolve any remaining overlaps, splitting long blocks around fixed ones
  const resolved = resolveOverlapsAndSplit(bounded)

  return resolved.map((t) => ({
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

  // On Mondays, inject weekly reflection context into prompt
  const dateObj = new Date(date)
  const isMonday = dateObj.getDay() === 1
  let weeklyContext: { lastWeekRating: string | null; oneIntention: string | null } | null = null
  if (isMonday) {
    // Last week's Monday
    const lastMonday = format(startOfWeek(new Date(date + 'T00:00:00'), { weekStartsOn: 1 }), 'yyyy-MM-dd')
    // Previous week's Monday = 7 days before this Monday
    const prevMonday = format(
      new Date(new Date(lastMonday).getTime() - 7 * 24 * 60 * 60 * 1000),
      'yyyy-MM-dd'
    )
    weeklyContext = await getReflectionForWeek(userId, prevMonday).catch(() => null)
  }

  const isAIConfigured =
    process.env.USE_LOCAL_AI === 'true'
      ? !!process.env.OLLAMA_BASE_URL
      : !!process.env.GEMINI_API_KEY

  let aiTasks: AITask[] = []

  if (isAIConfigured) {
    try {
      const prompt = buildPrompt(user, dayEvents, checkin, anchors, weeklyContext)
      aiTasks = await generateTasksFromAI(prompt)
    } catch (err) {
      console.error('[routine] AI generation failed, using fallback:', err)
    }
  }

  if (aiTasks.length === 0) {
    aiTasks = buildFallbackTasks(user, workStart, workEnd, medicineTasks)
  }

  const tasks = mergeTasks(aiTasks, medicineTasks, user, workStart, workEnd)

  // Build prompt snapshot — exclude all medicine/medical data
  const safeSnapshot = isAIConfigured
    ? buildPrompt(user, dayEvents, checkin, anchors, weeklyContext)
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

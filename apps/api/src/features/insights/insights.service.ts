import { Types } from 'mongoose'
import { getRedis } from '../../lib/redis.js'
import { getAIClient } from '../../lib/ai.js'
import { Routine } from '../routine/routine.model.js'
import { User } from '../user/user.model.js'
import {
  PRIVATE_TASK_CATEGORIES,
  INSIGHT_CACHE_TTL_HOURS,
  INSIGHTS_MIN_DATA_DAYS,
  INSIGHTS_LOOKBACK_DAYS,
  MOOD_GRAPH_DAYS,
  ENERGY_LEVEL_SCORES,
  INSIGHT_TYPES,
  INSIGHT_CATEGORIES,
} from '../../constants/index.js'

// ─── Types ────────────────────────────────────────────────────────────────────

export interface InsightItem {
  id: string
  type: (typeof INSIGHT_TYPES)[number]
  category: (typeof INSIGHT_CATEGORIES)[number]
  title: string
  body: string
}

export interface TrendsResult {
  generatedAt: string
  insights: InsightItem[]
}

export interface MoodGraphDay {
  date: string
  energyLevel: number | null
  mood: string | null
  completionPercentage: number | null
}

// ─── Safe categories only — no medicine/family ────────────────────────────────

function isSafeCategory(cat: string): boolean {
  return !(PRIVATE_TASK_CATEGORIES as readonly string[]).includes(cat)
}

// ─── Build per-day summary (medical-free) for AI ──────────────────────────────

interface DaySummary {
  date: string
  energyLevel: string
  mood: string
  completionPercentage: number
  meetingCount: number
  missedCategories: string[]
}

async function buildDaySummaries(userId: string, days: number): Promise<DaySummary[]> {
  const since = new Date()
  since.setDate(since.getDate() - days)
  const sinceStr = since.toISOString().slice(0, 10)

  const routines = await Routine.find({
    userId: new Types.ObjectId(userId),
    date: { $gte: sinceStr },
    'morningCheckin.submittedAt': { $exists: true },
  })
    .select('date morningCheckin tasks meetings')
    .lean()

  return routines.map((r) => {
    const tasks = r.tasks ?? []
    const totalTasks = tasks.length
    const doneTasks = tasks.filter((t) => t.status === 'done').length
    const completionPercentage = totalTasks > 0 ? Math.round((doneTasks / totalTasks) * 100) : 0

    // Only safe categories in missedCategories — medical data never sent to AI
    const missedCategories = tasks
      .filter((t) => t.status === 'missed' && isSafeCategory(t.category))
      .map((t) => t.category)
      .filter((c, i, arr) => arr.indexOf(c) === i)

    return {
      date: r.date,
      energyLevel: r.morningCheckin?.energyLevel ?? 'medium',
      mood: r.morningCheckin?.mood ?? 'okay',
      completionPercentage,
      meetingCount: (r.meetings ?? []).length,
      missedCategories,
      // anythingDifferentToday — never included, could contain medical text
    }
  })
}

// ─── AI prompt — warm, curiosity-driven, no medical data ─────────────────────

function buildInsightPrompt(summaries: DaySummary[]): string {
  const lines = summaries
    .map(
      (s) =>
        `${s.date}: energy=${s.energyLevel}, mood=${s.mood}, completed=${s.completionPercentage}%, meetings=${s.meetingCount}${s.missedCategories.length ? `, missed_categories=[${s.missedCategories.join(',')}]` : ''}`
    )
    .join('\n')

  return `You are a warm, supportive wellbeing assistant. Analyse this user's recent daily routine data and generate 2–4 insight cards.

DATA (last ${summaries.length} days — safe routine data only, no medical or personal information):
${lines}

Rules:
- Tone: curious, warm, non-judgmental — never preachy, never guilt-inducing
- Only state patterns that appear in at least 3 data points — never fabricate
- Each insight must have: type, category, title (short label, ≤ 6 words), body (1–2 warm sentences)
- type is one of: pattern, positive, observation, weekly_summary
- category is one of: energy, completion, meetings, exercise
- Respond ONLY with valid JSON — no markdown, no explanation, no code fences
- Format: [{"id":"1","type":"...","category":"...","title":"...","body":"..."},...]
- If you cannot identify any genuine patterns, return []`
}

// ─── Parse AI response ────────────────────────────────────────────────────────

function parseInsights(raw: string): InsightItem[] {
  try {
    const trimmed = raw.trim().replace(/^```json\s*/i, '').replace(/\s*```$/, '')
    const parsed = JSON.parse(trimmed)
    if (!Array.isArray(parsed)) return []
    return parsed.filter(
      (item: unknown): item is InsightItem =>
        typeof item === 'object' &&
        item !== null &&
        typeof (item as InsightItem).id === 'string' &&
        INSIGHT_TYPES.includes((item as InsightItem).type as never) &&
        INSIGHT_CATEGORIES.includes((item as InsightItem).category as never) &&
        typeof (item as InsightItem).title === 'string' &&
        typeof (item as InsightItem).body === 'string'
    )
  } catch {
    return []
  }
}

// ─── getTrends ────────────────────────────────────────────────────────────────

export async function getTrends(userId: string): Promise<TrendsResult | { disabled: true }> {
  const user = await User.findById(userId).select('insightsEnabled').lean()
  if (!user || user.insightsEnabled === false) return { disabled: true }

  const redis = getRedis()
  const cacheKey = `insights:${userId}`
  const cached = await redis.get(cacheKey).catch(() => null)
  if (cached) {
    return JSON.parse(cached) as TrendsResult
  }

  const summaries = await buildDaySummaries(userId, INSIGHTS_LOOKBACK_DAYS)

  if (summaries.length < INSIGHTS_MIN_DATA_DAYS) {
    return { generatedAt: new Date().toISOString(), insights: [] }
  }

  let insights: InsightItem[] = []
  try {
    const ai = getAIClient()
    const raw = await ai.chat(buildInsightPrompt(summaries))
    insights = parseInsights(raw)
  } catch {
    insights = []
  }

  const result: TrendsResult = {
    generatedAt: new Date().toISOString(),
    insights,
  }

  const ttlSeconds = INSIGHT_CACHE_TTL_HOURS * 60 * 60
  await redis.set(cacheKey, JSON.stringify(result), 'EX', ttlSeconds).catch(() => null)

  return result
}

// ─── getMoodGraph ─────────────────────────────────────────────────────────────

export async function getMoodGraph(userId: string): Promise<MoodGraphDay[]> {
  const since = new Date()
  since.setDate(since.getDate() - MOOD_GRAPH_DAYS)
  const sinceStr = since.toISOString().slice(0, 10)

  const routines = await Routine.find({
    userId: new Types.ObjectId(userId),
    date: { $gte: sinceStr },
  })
    .select('date morningCheckin tasks')
    .lean()

  const byDate = new Map(routines.map((r) => [r.date, r]))

  const days: MoodGraphDay[] = []
  for (let i = MOOD_GRAPH_DAYS - 1; i >= 0; i--) {
    const d = new Date()
    d.setDate(d.getDate() - i)
    const dateStr = d.toISOString().slice(0, 10)
    const r = byDate.get(dateStr)

    if (!r || !r.morningCheckin?.energyLevel) {
      days.push({ date: dateStr, energyLevel: null, mood: null, completionPercentage: null })
      continue
    }

    const tasks = r.tasks ?? []
    const total = tasks.length
    const done = tasks.filter((t) => t.status === 'done').length
    const completionPercentage = total > 0 ? Math.round((done / total) * 100) : null

    days.push({
      date: dateStr,
      energyLevel: ENERGY_LEVEL_SCORES[r.morningCheckin.energyLevel] ?? null,
      mood: r.morningCheckin.mood,
      completionPercentage,
    })
  }

  return days
}

// ─── bustInsightsCache ────────────────────────────────────────────────────────

export async function bustInsightsCache(userId: string): Promise<void> {
  const redis = getRedis()
  await redis.del(`insights:${userId}`).catch(() => null)
}

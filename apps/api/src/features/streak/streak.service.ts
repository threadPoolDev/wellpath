import { format, subDays, startOfWeek } from 'date-fns'
import { toZonedTime } from 'date-fns-tz'
import webpush from 'web-push'
import { User } from '../user/user.model.js'
import { Routine } from '../routine/routine.model.js'
import { STREAK, STREAK_MILESTONE_COPY } from '../../constants/index.js'
import type { StreakDay, StreakResponse } from './streak.types.js'

// ─── Public: get streak for a user ──────────────────────────────────────────

export async function getStreak(userId: string): Promise<StreakResponse> {
  const user = await User.findById(userId).select('streak')
  if (!user) throw new Error('User not found')

  const s = user.streak
  const graceRemaining = Math.max(0, STREAK.GRACE_DAYS_PER_WEEK - s.graceDaysUsedThisWeek)

  // Build last-30-days status array
  const today = format(new Date(), 'yyyy-MM-dd')
  const last30Days: StreakDay[] = []

  for (let i = 29; i >= 0; i--) {
    const date = format(subDays(new Date(), i), 'yyyy-MM-dd')
    last30Days.push({ date, status: await dayStatus(userId, date, today, user.streak) })
  }

  return {
    current: s.current,
    personalBest: s.personalBest,
    graceDaysUsedThisWeek: s.graceDaysUsedThisWeek,
    graceRemaining,
    totalDaysCompleted: s.totalDaysCompleted,
    last30Days,
  }
}

// ─── Internal: determine a day's status ──────────────────────────────────────

async function dayStatus(
  userId: string,
  date: string,
  today: string,
  _streak: { lastStreakDate: string | null; current: number }
): Promise<'complete' | 'grace' | 'missed' | 'future' | 'pending'> {
  if (date > today) return 'future'
  if (date === today) return 'pending'

  const routine = await Routine.findOne({ userId, date }).select('tasks')
  if (!routine || routine.tasks.length === 0) return 'missed'

  const total = routine.tasks.length
  const done = routine.tasks.filter((t) => t.status === 'done').length
  const pct = (done / total) * 100

  if (pct >= STREAK.COMPLETION_THRESHOLD_PERCENT) return 'complete'

  // We can't reconstruct whether a grace day was used without traversing the
  // full history — use a simple heuristic: if the date is within the streak
  // window and completion was below threshold, mark missed.
  return 'missed'
}

// ─── Nightly calculation (called by cron at 23:59 user local time) ──────────

export async function calculateStreakForUser(userId: string, timezone = 'UTC'): Promise<void> {
  const user = await User.findById(userId).select('streak pushSubscription profile')
  if (!user) return

  const zonedNow = toZonedTime(new Date(), timezone)
  const today = format(zonedNow, 'yyyy-MM-dd')

  // Avoid double-processing the same day
  if (user.streak.lastStreakDate === today) return

  const routine = await Routine.findOne({ userId, date: today }).select('tasks')

  const total = routine?.tasks?.length ?? 0
  const done = routine?.tasks?.filter((t) => t.status === 'done').length ?? 0
  const completionPct = total > 0 ? (done / total) * 100 : 0

  const meetsThreshold = completionPct >= STREAK.COMPLETION_THRESHOLD_PERCENT

  // Reset grace counter at start of each week (Monday 00:00)
  const weekStart = format(startOfWeek(zonedNow, { weekStartsOn: 1 }), 'yyyy-MM-dd')
  const isNewWeek = user.streak.graceWeekStartDate !== weekStart

  const { milestonesSeen } = user.streak
  let { current, personalBest, graceDaysUsedThisWeek, graceWeekStartDate, totalDaysCompleted } =
    user.streak

  if (isNewWeek) {
    graceDaysUsedThisWeek = 0
    graceWeekStartDate = weekStart
  }

  if (meetsThreshold) {
    current += 1
    totalDaysCompleted += 1
  } else {
    const graceAvailable = graceDaysUsedThisWeek < STREAK.GRACE_DAYS_PER_WEEK
    if (graceAvailable) {
      // Use grace — streak continues
      current += 1
      graceDaysUsedThisWeek += 1
      totalDaysCompleted += 1
    } else {
      // Streak broken
      current = 0
    }
  }

  if (current > personalBest) personalBest = current

  await User.findByIdAndUpdate(userId, {
    $set: {
      'streak.current': current,
      'streak.personalBest': personalBest,
      'streak.lastStreakDate': today,
      'streak.graceDaysUsedThisWeek': graceDaysUsedThisWeek,
      'streak.graceWeekStartDate': graceWeekStartDate,
      'streak.totalDaysCompleted': totalDaysCompleted,
    },
  })

  // Check for milestone
  await checkAndFireMilestone(userId, current, milestonesSeen, user.pushSubscription)
}

// ─── Milestone notifications ─────────────────────────────────────────────────

async function checkAndFireMilestone(
  userId: string,
  current: number,
  milestonesSeen: number[],
  pushSubscription?: { endpoint: string; keys: { p256dh: string; auth: string } } | null
): Promise<void> {
  const newMilestone = STREAK.MILESTONES.find(
    (m) => m === current && !milestonesSeen.includes(m)
  )
  if (!newMilestone) return

  // Mark milestone seen
  await User.findByIdAndUpdate(userId, {
    $addToSet: { 'streak.milestonesSeen': newMilestone },
  })

  if (!pushSubscription?.endpoint) return

  const body = STREAK_MILESTONE_COPY[newMilestone] ?? `${newMilestone} day streak! Keep it up. 🔥`

  try {
    await webpush.sendNotification(
      pushSubscription as webpush.PushSubscription,
      JSON.stringify({
        title: `🔥 ${newMilestone}-day streak!`,
        body,
        url: '/history',
      })
    )
  } catch {
    // Non-fatal — notification failure should not block streak update
  }
}

// ─── Run nightly cron for all users ──────────────────────────────────────────

export async function runNightlyStreakUpdate(): Promise<void> {
  const users = await User.find({}, '_id profile.shiftTimezone').lean()
  const results = await Promise.allSettled(
    users.map((u) =>
      calculateStreakForUser(
        String(u._id),
        (u.profile as { shiftTimezone?: string })?.shiftTimezone ?? 'UTC'
      )
    )
  )
  const failed = results.filter((r) => r.status === 'rejected').length
  if (failed > 0) console.error(`[streak] ${failed} of ${results.length} users failed streak update`)
}

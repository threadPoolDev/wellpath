import webpush from 'web-push'
import { Job } from 'bullmq'
import { User } from '../user/user.model.js'
import { Notification, INotification } from './notification.model.js'
import { IRoutine, IRoutineTask } from '../routine/routine.model.js'
import { getNotificationQueue, NotificationJobData } from '../../lib/queue.js'
import { Types } from 'mongoose'

// ─── VAPID setup ──────────────────────────────────────────────────────────────

export function configureWebPush(): void {
  const pub = process.env.VAPID_PUBLIC_KEY
  const priv = process.env.VAPID_PRIVATE_KEY
  const email = process.env.VAPID_EMAIL
  if (!pub || !priv || !email) {
    console.warn('[notifications] VAPID keys not configured — push disabled')
    return
  }
  webpush.setVapidDetails(`mailto:${email}`, pub, priv)
}

// ─── Notification copy ────────────────────────────────────────────────────────

const CATEGORY_COPY: Record<string, { title: string; body: (t: string) => string }> = {
  hydration:   { title: 'Stay hydrated 💧',     body: (t) => `Time for your ${t}` },
  exercise:    { title: 'Move your body 🏃',     body: (t) => `Your ${t} is up — let's go!` },
  nutrition:   { title: 'Time to eat 🍱',        body: (t) => `Don't skip — your ${t} is waiting` },
  focus_work:  { title: 'Focus time 🎯',         body: (t) => `${t} — notifications paused for this block` },
  break:       { title: 'Take a break ☕',        body: (t) => `Step away for a bit — ${t}` },
  commute:     { title: 'Time to head out 🚌',   body: (t) => `${t} — have a good journey` },
  family:      { title: 'Family time 🏠',         body: (t) => `${t} — close the laptop` },
  medicine:    { title: 'Medicine reminder 💊',   body: () => `Time for your medicine. A small habit that keeps you going.` },
  wind_down:   { title: 'Wind down 🌙',           body: (t) => `${t} — tomorrow will handle itself` },
  learning:    { title: 'Learn something 📚',     body: (t) => `${t} — a few minutes a day adds up` },
  social:      { title: 'Connect 👥',             body: (t) => `${t} — the people in your life matter` },
  mindfulness: { title: 'Be present 🧘',          body: (t) => `${t} — take a breath` },
}

function copyForTask(task: IRoutineTask): { title: string; body: string } {
  const tpl = CATEGORY_COPY[task.category]
  if (!tpl) return { title: 'WellPath reminder', body: task.title }
  return { title: tpl.title, body: tpl.body(task.title) }
}

// ─── Store + enqueue ──────────────────────────────────────────────────────────

async function enqueueAt(
  userId: string,
  routineId: string,
  taskId: string | null,
  type: INotification['type'],
  title: string,
  body: string,
  scheduledFor: Date
): Promise<void> {
  const doc = await Notification.create({
    userId: new Types.ObjectId(userId),
    routineId: new Types.ObjectId(routineId),
    taskId: taskId ? new Types.ObjectId(taskId) : undefined,
    type,
    title,
    body,
    scheduledFor,
    deliveryStatus: 'pending',
  })

  const delay = Math.max(0, scheduledFor.getTime() - Date.now())
  await getNotificationQueue().add(
    type,
    { notificationId: String(doc._id), userId },
    { delay, jobId: String(doc._id) }
  )
}

// ─── Schedule all notifications for a routine ─────────────────────────────────

export async function scheduleNotificationsForRoutine(routine: IRoutine): Promise<void> {
  const today = routine.date // "YYYY-MM-DD"

  // Cancel any previously scheduled notifications for this routine
  const queue = getNotificationQueue()
  const existing = await Notification.find({ routineId: routine._id, deliveryStatus: 'pending' })
  await Promise.all(
    existing.map(async (n) => {
      await queue.remove(String(n._id)).catch(() => null)
      n.deliveryStatus = 'failed'
      await n.save()
    })
  )

  const scheduleTime = (hhmm: string): Date => {
    const [h, m] = hhmm.split(':').map(Number)
    const d = new Date(`${today}T00:00:00`)
    d.setHours(h, m, 0, 0)
    return d
  }

  for (const task of routine.tasks) {
    const scheduledFor = scheduleTime(task.time)
    if (scheduledFor <= new Date()) continue // skip past tasks

    const { title, body } = copyForTask(task)
    await enqueueAt(
      String(routine.userId),
      String(routine._id),
      String(task._id),
      'task_reminder',
      title,
      body,
      scheduledFor
    )

    // Critical medicine: follow-up 15 min later if still pending
    if (task.category === 'medicine') {
      const followUp = new Date(scheduledFor.getTime() + 15 * 60 * 1000)
      await enqueueAt(
        String(routine.userId),
        String(routine._id),
        String(task._id),
        'checkin_prompt',
        'Did you take your medicine? 💊',
        'Just checking in — did you get a chance to take your medicine?',
        followUp
      )
    }
  }
}

// ─── Morning check-in reminder ────────────────────────────────────────────────

export async function scheduleMorningCheckinReminder(
  userId: string,
  routineId: string,
  date: string,
  workStartTime: string
): Promise<void> {
  const [h, m] = workStartTime.split(':').map(Number)
  // Remind 30 minutes before work start
  const reminderMinutes = h * 60 + m - 30
  const rh = Math.floor(reminderMinutes / 60)
  const rm = reminderMinutes % 60
  const scheduledFor = new Date(`${date}T${String(rh).padStart(2, '0')}:${String(rm).padStart(2, '0')}:00`)

  if (scheduledFor <= new Date()) return

  await enqueueAt(
    userId, routineId, null,
    'morning_checkin',
    'Good morning ☀️',
    'Ready to build your day? Your check-in takes just a minute.',
    scheduledFor
  )
}

// ─── Worker processor ─────────────────────────────────────────────────────────

export async function processNotificationJob(job: Job<NotificationJobData>): Promise<void> {
  const { notificationId, userId } = job.data

  const [notif, user] = await Promise.all([
    Notification.findById(notificationId),
    User.findById(userId).select('pushSubscription'),
  ])

  if (!notif || notif.deliveryStatus !== 'pending') return
  if (!user?.pushSubscription?.endpoint) {
    notif.deliveryStatus = 'failed'
    await notif.save()
    return
  }

  // For medicine checkin_prompt: skip if task already done
  if (notif.type === 'checkin_prompt' && notif.taskId) {
    const { Routine } = await import('../routine/routine.model.js')
    const routine = await Routine.findById(notif.routineId)
    const task = routine?.tasks.find((t) => String(t._id) === String(notif.taskId))
    if (task && task.status === 'done') {
      notif.deliveryStatus = 'failed'
      await notif.save()
      return
    }
  }

  try {
    await webpush.sendNotification(
      user.pushSubscription as webpush.PushSubscription,
      JSON.stringify({
        title: notif.title,
        body: notif.body,
        type: notif.type,
        routineId: String(notif.routineId),
        taskId: notif.taskId ? String(notif.taskId) : null,
      })
    )
    notif.deliveryStatus = 'sent'
    notif.sentAt = new Date()
  } catch (err) {
    console.error('[notifications] push failed:', err)
    notif.deliveryStatus = 'failed'
  }
  await notif.save()
}

// ─── Subscribe / unsubscribe ──────────────────────────────────────────────────

export async function saveSubscription(
  userId: string,
  subscription: webpush.PushSubscription
): Promise<void> {
  await User.findByIdAndUpdate(userId, { $set: { pushSubscription: subscription } })
}

export async function removeSubscription(userId: string): Promise<void> {
  await User.findByIdAndUpdate(userId, { $unset: { pushSubscription: 1 } })
}

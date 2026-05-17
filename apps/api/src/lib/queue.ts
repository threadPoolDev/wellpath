import { Queue, Worker, Job } from 'bullmq'
import { getRedis } from './redis.js'

export interface NotificationJobData {
  notificationId: string
  userId: string
}

const QUEUE_NAME = 'notifications'

let notificationQueue: Queue<NotificationJobData> | null = null

export function getNotificationQueue(): Queue<NotificationJobData> {
  if (!notificationQueue) {
    notificationQueue = new Queue<NotificationJobData>(QUEUE_NAME, {
      connection: getRedis(),
      defaultJobOptions: { removeOnComplete: 100, removeOnFail: 200 },
    })
  }
  return notificationQueue
}

export function startNotificationWorker(
  processor: (job: Job<NotificationJobData>) => Promise<void>
): Worker<NotificationJobData> {
  const worker = new Worker<NotificationJobData>(QUEUE_NAME, processor, {
    connection: getRedis(),
  })
  worker.on('failed', (job, err) =>
    console.error(`[queue] job ${job?.id} failed:`, err.message)
  )
  return worker
}

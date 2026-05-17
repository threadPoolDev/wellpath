import Redis from 'ioredis'

let client: Redis | null = null

export function getRedis(): Redis {
  if (!client) {
    client = new Redis(process.env.REDIS_URL ?? 'redis://localhost:6379', {
      maxRetriesPerRequest: null, // required by BullMQ
      lazyConnect: true,
    })
    client.on('error', (err) => console.error('[redis] connection error:', err.message))
  }
  return client
}

import mongoose from 'mongoose'

export async function connectDB(): Promise<void> {
  const uri = process.env.MONGODB_URI
  if (!uri) throw new Error('MONGODB_URI is not set in environment variables')

  mongoose.connection.on('connected', () => console.log('[db] MongoDB connected'))
  mongoose.connection.on('error', (err) => console.error('[db] MongoDB error:', err))
  mongoose.connection.on('disconnected', () => console.warn('[db] MongoDB disconnected'))

  await mongoose.connect(uri)
}

export async function disconnectDB(): Promise<void> {
  await mongoose.disconnect()
  console.log('[db] MongoDB disconnected cleanly')
}

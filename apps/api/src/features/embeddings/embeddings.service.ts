import { getAIClient } from '../../lib/ai.js'
import { User, IUser } from '../user/user.model.js'
import { Checkin } from '../checkin/checkin.model.js'

// ─── Profile text builder ─────────────────────────────────────────────────────
// Medical fields (health, medicines) are intentionally excluded here.

function buildProfileText(user: IUser | null): string | null {
  if (!user) return null
  const p = user.profile
  if (!p) return null

  const parts: string[] = []

  if (p.role) parts.push(`Role: ${p.role}`)
  if (p.workMode) parts.push(`Work mode: ${p.workMode}`)
  if (p.city) parts.push(`City: ${p.city}`)
  if (p.cityType) parts.push(`City type: ${p.cityType}`)

  if (p.commute?.mode) parts.push(`Commute: ${p.commute.mode}`)
  if (p.commute?.homeToOfficeDuration) parts.push(`Commute duration: ${p.commute.homeToOfficeDuration} minutes`)

  if (p.diet?.type) parts.push(`Diet: ${p.diet.type}`)
  if (p.diet?.waterReminderNeeded) parts.push('Needs water reminders')

  if (p.sleep?.wakeTime) parts.push(`Wake time: ${p.sleep.wakeTime}`)
  if (p.sleep?.sleepGoal) parts.push(`Sleep goal: ${p.sleep.sleepGoal} hours`)

  if (p.exercise?.preference) parts.push(`Exercise: ${p.exercise.preference}`)
  if (p.focus?.peakWindow) parts.push(`Peak focus: ${p.focus.peakWindow}`)

  if (p.personalLifeConsented && p.personal) {
    if (p.personal.relationshipStatus) parts.push(`Relationship: ${p.personal.relationshipStatus}`)
    if (p.personal.hasChildren) parts.push('Has children')
    if (p.personal.familyTimeFeeling) parts.push(`Family time: ${p.personal.familyTimeFeeling}`)
    if (p.personal.friendsTimeFeeling) parts.push(`Friends time: ${p.personal.friendsTimeFeeling}`)
  }

  return parts.join('. ')
}

// ─── Public functions ─────────────────────────────────────────────────────────

export async function embedUserProfile(userId: string): Promise<void> {
  const user = await User.findById(userId) as IUser | null
  const text = buildProfileText(user)
  if (!text) return

  const embedding = await getAIClient().embed(text)
  await User.findByIdAndUpdate(userId, { $set: { profileEmbedding: embedding } })
}

export async function embedCheckin(checkinId: string): Promise<void> {
  const checkin = await Checkin.findById(checkinId)
  if (!checkin) return

  const parts: string[] = []
  if (checkin.missedReason) parts.push(checkin.missedReason)
  if (checkin.didInstead) parts.push(checkin.didInstead)
  if (checkin.eveningSummary?.howWasYourDay) parts.push(checkin.eveningSummary.howWasYourDay)
  if (checkin.eveningSummary?.tomorrowNote) parts.push(checkin.eveningSummary.tomorrowNote)

  if (parts.length === 0) return // nothing to embed

  const text = parts.join(' ')
  const embedding = await getAIClient().embed(text)
  await Checkin.findByIdAndUpdate(checkinId, { $set: { embedding } })
}

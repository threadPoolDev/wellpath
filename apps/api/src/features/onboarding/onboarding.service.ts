import { User } from '../user/user.model.js'
import { METRO_CITIES } from '../../constants/index.js'
import { NotFoundError } from '../../lib/errors.js'
import {
  findOrCreateSession,
  findActiveSession,
  upsertResponse,
  markSessionComplete,
} from './onboarding.repository.js'
import { SaveResponseDto, CompleteOnboardingDto, OnboardingSessionResponse } from './onboarding.types.js'
import { embedUserProfile } from '../embeddings/embeddings.service.js'
import { IOnboardingResponse } from './onboardingResponse.model.js'

export async function saveResponse(userId: string, dto: SaveResponseDto): Promise<void> {
  const session = await findOrCreateSession(userId, dto.sessionId)
  await upsertResponse(session, dto)
}

export async function getSession(userId: string): Promise<OnboardingSessionResponse | null> {
  const session = await findActiveSession(userId)
  if (!session) return null

  return {
    sessionId: session.sessionId,
    responses: session.responses.map((r) => ({
      questionId: r.questionId,
      answerValue: r.answerValue,
      skipped: r.skipped,
    })),
    droppedOffAtQuestion: session.droppedOffAtQuestion,
    completedLayer: session.completedLayer,
  }
}

export async function completeOnboarding(
  userId: string,
  _dto: CompleteOnboardingDto
): Promise<void> {
  const session = await findActiveSession(userId)
  if (!session) throw new NotFoundError('Onboarding session not found')

  const user = await User.findById(userId)
  if (!user) throw new NotFoundError('User not found')

  const updateFields = buildProfileUpdate(session)
  updateFields['onboardingComplete'] = true
  updateFields['onboardingStep'] = session.responses.length

  await User.updateOne({ _id: userId }, { $set: updateFields })
  await markSessionComplete(session)

  // Embed profile in background — does not block onboarding completion response
  embedUserProfile(userId).catch((err) =>
    console.error('[embeddings] profile embedding failed after onboarding:', err)
  )
}

function buildProfileUpdate(session: IOnboardingResponse): Record<string, unknown> {
  const answered = new Map<string, unknown>()
  for (const r of session.responses) {
    if (!r.skipped && r.answerValue !== null && r.answerValue !== undefined) {
      answered.set(r.questionId, r.answerValue)
    }
  }

  const fields: Record<string, unknown> = {}

  if (answered.has('name')) {
    fields['name'] = answered.get('name')
  }

  if (answered.has('role')) {
    fields['profile.role'] = answered.get('role')
  }

  if (answered.has('work_mode')) {
    fields['profile.workMode'] = answered.get('work_mode')
  }

  if (answered.has('city')) {
    const city = (answered.get('city') as string).trim()
    fields['profile.city'] = city
    const isMetro = (METRO_CITIES as readonly string[]).includes(city.toLowerCase())
    fields['profile.cityType'] = isMetro ? 'metro' : 'tier2'
  }

  if (answered.has('home_area')) {
    fields['profile.homeAddress'] = answered.get('home_area')
  }

  if (answered.has('office_area')) {
    fields['profile.officeAddress'] = answered.get('office_area')
  }

  if (answered.has('commute_mode')) {
    fields['profile.commute.mode'] = answered.get('commute_mode')
  }

  if (answered.has('commute_duration')) {
    const val = answered.get('commute_duration') as { durationMinutes: number; overridden: boolean }
    fields['profile.commute.homeToOfficeDuration'] = val.durationMinutes
    fields['profile.commute.travelTimeOverridden'] = val.overridden
  }

  if (answered.has('work_start_time')) {
    fields['profile.commute.homeToOfficeTime'] = answered.get('work_start_time')
  }

  if (answered.has('work_end_time')) {
    fields['profile.commute.officeToHomeTime'] = answered.get('work_end_time')
  }

  if (answered.has('peak_window')) {
    fields['profile.focus.peakWindow'] = answered.get('peak_window')
  }

  if (answered.has('takes_medicines')) {
    fields['profile.health.takesMedicines'] = answered.get('takes_medicines')
  }

  if (answered.has('medicines')) {
    fields['profile.health.medicines'] = answered.get('medicines')
    fields['profile.health.medicalDisclaimerAcknowledged'] = true
  }

  if (answered.has('bo_calendar_tool')) {
    fields['profile.businessOwnerProfile.calendarToolUsed'] = answered.get('bo_calendar_tool')
  }

  if (answered.has('bo_deep_work')) {
    fields['profile.businessOwnerProfile.deepWorkPreference'] = answered.get('bo_deep_work')
  }

  if (answered.has('bo_interruption')) {
    fields['profile.businessOwnerProfile.interruptionFrequency'] = answered.get('bo_interruption')
  }

  if (answered.has('bo_hard_to_switch_off')) {
    fields['profile.businessOwnerProfile.hardToSwitchOff'] = answered.get('bo_hard_to_switch_off')
  }

  if (answered.has('bo_lunch_habit')) {
    fields['profile.businessOwnerProfile.lunchHabit'] = answered.get('bo_lunch_habit')
  }

  if (answered.has('bo_manual_start')) {
    fields['profile.businessOwnerProfile.manualDayProfile.workdayStartTime'] = answered.get('bo_manual_start')
  }

  if (answered.has('bo_manual_end')) {
    fields['profile.businessOwnerProfile.manualDayProfile.workdayEndTime'] = answered.get('bo_manual_end')
  }

  if (answered.has('bo_avg_meetings')) {
    fields['profile.businessOwnerProfile.manualDayProfile.avgMeetingsPerDay'] = answered.get('bo_avg_meetings')
  }

  return fields
}

import { Schema, model, Document, Types } from 'mongoose'
import {
  AUTH_PROVIDERS,
  USER_ROLES,
  WORK_MODES,
  COMMUTE_MODES,
  METRO_ACTIVITIES,
  TAKES_MEDICINES,
  WITH_FOOD_OPTIONS,
  IS_CRITICAL_OPTIONS,
  DIET_TYPES,
  EXERCISE_PREFERENCES,
  PEAK_WINDOWS,
  FEELING_OPTIONS,
  RELATIONSHIP_STATUSES,
  CITY_TYPES,
  CALENDAR_TOOLS,
  AVG_MEETINGS_PER_DAY,
  AVG_MEETING_DURATIONS,
  PROTECTED_LUNCH_OPTIONS,
  DEEP_WORK_PREFERENCES,
  INTERRUPTION_FREQUENCIES,
  TEAM_DEPENDENCY_OPTIONS,
  SWITCH_OFF_OPTIONS,
  LUNCH_HABITS,
  PHYSICAL_MOVEMENT_OPTIONS,
  CALENDAR_PROVIDERS,
  SHARING_PREFERENCES,
} from '../../constants/index.js'

export interface IMedicine {
  nameOrNickname: string
  timings: string[]
  withFood: (typeof WITH_FOOD_OPTIONS)[number]
  isCritical: (typeof IS_CRITICAL_OPTIONS)[number]
  reminderEnabled: boolean
}

export interface IManualDayProfile {
  workdayStartTime: string
  workdayEndTime: string
  avgMeetingsPerDay: (typeof AVG_MEETINGS_PER_DAY)[number]
  avgMeetingDuration: (typeof AVG_MEETING_DURATIONS)[number]
  hasProtectedLunch: (typeof PROTECTED_LUNCH_OPTIONS)[number]
  recurringCommitments: string
  additionalContext: string
}

export interface IBusinessOwnerProfile {
  calendarToolUsed: (typeof CALENDAR_TOOLS)[number]
  hasFrequentAdHocMeetings: boolean
  manualDayProfile?: IManualDayProfile
  deepWorkPreference: (typeof DEEP_WORK_PREFERENCES)[number]
  interruptionFrequency: (typeof INTERRUPTION_FREQUENCIES)[number]
  hasTeamDependency: (typeof TEAM_DEPENDENCY_OPTIONS)[number]
  hardToSwitchOff: (typeof SWITCH_OFF_OPTIONS)[number]
  lunchHabit: (typeof LUNCH_HABITS)[number]
  physicalMovementDuringDay: (typeof PHYSICAL_MOVEMENT_OPTIONS)[number]
}

export interface ICalendarConnection {
  provider: (typeof CALENDAR_PROVIDERS)[number]
  accountEmail: string
  accessToken: string
  refreshToken: string
  tokenExpiry: Date
  calendarId: string
  scopes: string[]
  isActive: boolean
  lastSyncedAt: Date
  connectedAt: Date
  connectionNote: string
}

export interface IUser extends Document {
  email: string
  name: string
  passwordHash: string | null
  authProvider: (typeof AUTH_PROVIDERS)[number]
  isWorkEmail: boolean
  onboardingComplete: boolean
  onboardingStep: number
  profile: {
    role?: (typeof USER_ROLES)[number]
    workShift?: string
    shiftTimezone?: string
    workMode?: (typeof WORK_MODES)[number]
    city?: string
    cityType?: (typeof CITY_TYPES)[keyof typeof CITY_TYPES]
    homeAddress?: string
    officeAddress?: string
    commute?: {
      mode: (typeof COMMUTE_MODES)[number]
      homeToOfficeDuration?: number
      homeToOfficeTime?: string
      officeToHomeDuration?: number
      officeToHomeTime?: string
      travelTimeOverridden: boolean
      metroActivities: (typeof METRO_ACTIVITIES)[number][]
    }
    health?: {
      takesMedicines: (typeof TAKES_MEDICINES)[number]
      medicines: IMedicine[]
      medicalDisclaimerAcknowledged: boolean
      hasMedicalCondition?: boolean
      conditions: { name: string; isChronicOrCritical: boolean }[]
    }
    diet?: {
      type: (typeof DIET_TYPES)[number]
      waterReminderNeeded: boolean
      restrictions?: string
    }
    sleep?: {
      wakeTime: string
      sleepGoal: number
    }
    exercise?: {
      preference: (typeof EXERCISE_PREFERENCES)[number]
    }
    focus?: {
      peakWindow: (typeof PEAK_WINDOWS)[number]
    }
    personalLifeConsented?: boolean
    personal?: {
      relationshipStatus: (typeof RELATIONSHIP_STATUSES)[number]
      hasChildren: boolean
      familyTimeFeeling: (typeof FEELING_OPTIONS)[number]
      friendsTimeFeeling: (typeof FEELING_OPTIONS)[number]
    }
    businessOwnerProfile?: IBusinessOwnerProfile
  }
  calendarConnections: ICalendarConnection[]
  profilePhoto?: {
    url: string
    thumbnailUrl: string
    publicId: string
    uploadedAt: Date
  }
  groupIds: Types.ObjectId[]
  groupSharingDefaults: {
    defaultSharingPreference: (typeof SHARING_PREFERENCES)[number]
    shareWithGroups: boolean
  }
  pushSubscription?: {
    endpoint: string
    keys: { p256dh: string; auth: string }
  }
  expoPushToken?: string
  profileEmbedding?: number[]
  insightsEnabled: boolean
  streak: {
    current: number
    personalBest: number
    lastStreakDate: string | null
    graceDaysUsedThisWeek: number
    graceWeekStartDate: string | null
    totalDaysCompleted: number
    milestonesSeen: number[]
  }
}

const medicineSchema = new Schema<IMedicine>(
  {
    nameOrNickname: { type: String, required: true },
    timings: [{ type: String }],
    withFood: { type: String, enum: WITH_FOOD_OPTIONS, required: true },
    isCritical: { type: String, enum: IS_CRITICAL_OPTIONS, required: true },
    reminderEnabled: { type: Boolean, default: true },
  },
  { _id: false }
)

const manualDayProfileSchema = new Schema<IManualDayProfile>(
  {
    workdayStartTime: String,
    workdayEndTime: String,
    avgMeetingsPerDay: { type: String, enum: AVG_MEETINGS_PER_DAY },
    avgMeetingDuration: { type: String, enum: AVG_MEETING_DURATIONS },
    hasProtectedLunch: { type: String, enum: PROTECTED_LUNCH_OPTIONS },
    recurringCommitments: String,
    additionalContext: String,
  },
  { _id: false }
)

const businessOwnerProfileSchema = new Schema<IBusinessOwnerProfile>(
  {
    calendarToolUsed: { type: String, enum: CALENDAR_TOOLS },
    hasFrequentAdHocMeetings: Boolean,
    manualDayProfile: manualDayProfileSchema,
    deepWorkPreference: { type: String, enum: DEEP_WORK_PREFERENCES },
    interruptionFrequency: { type: String, enum: INTERRUPTION_FREQUENCIES },
    hasTeamDependency: { type: String, enum: TEAM_DEPENDENCY_OPTIONS },
    hardToSwitchOff: { type: String, enum: SWITCH_OFF_OPTIONS },
    lunchHabit: { type: String, enum: LUNCH_HABITS },
    physicalMovementDuringDay: { type: String, enum: PHYSICAL_MOVEMENT_OPTIONS },
  },
  { _id: false }
)

const calendarConnectionSchema = new Schema<ICalendarConnection>(
  {
    provider: { type: String, enum: CALENDAR_PROVIDERS, required: true },
    accountEmail: String,
    accessToken: String,
    refreshToken: String,
    tokenExpiry: Date,
    calendarId: String,
    scopes: [String],
    isActive: { type: Boolean, default: true },
    lastSyncedAt: Date,
    connectedAt: Date,
    connectionNote: String,
  },
  { _id: false }
)

const userSchema = new Schema<IUser>(
  {
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    name: { type: String, required: true },
    passwordHash: { type: String, default: null },
    authProvider: { type: String, enum: AUTH_PROVIDERS, required: true },
    isWorkEmail: { type: Boolean, default: false },
    onboardingComplete: { type: Boolean, default: false },
    onboardingStep: { type: Number, default: 0 },
    profile: {
      role: { type: String, enum: USER_ROLES },
      workShift: String,
      shiftTimezone: String,
      workMode: { type: String, enum: WORK_MODES },
      city: String,
      cityType: { type: String, enum: Object.values(CITY_TYPES) },
      homeAddress: String,
      officeAddress: String,
      commute: {
        mode: { type: String, enum: COMMUTE_MODES },
        homeToOfficeDuration: Number,
        homeToOfficeTime: String,
        officeToHomeDuration: Number,
        officeToHomeTime: String,
        travelTimeOverridden: { type: Boolean, default: false },
        metroActivities: [{ type: String, enum: METRO_ACTIVITIES }],
        _id: false,
      },
      health: {
        takesMedicines: { type: String, enum: TAKES_MEDICINES },
        medicines: [medicineSchema],
        medicalDisclaimerAcknowledged: { type: Boolean, default: false },
        hasMedicalCondition: Boolean,
        conditions: [{ name: String, isChronicOrCritical: Boolean, _id: false }],
        _id: false,
      },
      diet: {
        type: { type: String, enum: DIET_TYPES },
        waterReminderNeeded: Boolean,
        restrictions: String,
        _id: false,
      },
      sleep: {
        wakeTime: String,
        sleepGoal: Number,
        _id: false,
      },
      exercise: {
        preference: { type: String, enum: EXERCISE_PREFERENCES },
        _id: false,
      },
      focus: {
        peakWindow: { type: String, enum: PEAK_WINDOWS },
        _id: false,
      },
      personalLifeConsented: Boolean,
      personal: {
        relationshipStatus: { type: String, enum: RELATIONSHIP_STATUSES },
        hasChildren: Boolean,
        familyTimeFeeling: { type: String, enum: FEELING_OPTIONS },
        friendsTimeFeeling: { type: String, enum: FEELING_OPTIONS },
        _id: false,
      },
      businessOwnerProfile: businessOwnerProfileSchema,
    },
    calendarConnections: [calendarConnectionSchema],
    profilePhoto: {
      url: String,
      thumbnailUrl: String,
      publicId: String,
      uploadedAt: Date,
      _id: false,
    },
    groupIds: [{ type: Schema.Types.ObjectId, ref: 'Group' }],
    groupSharingDefaults: {
      defaultSharingPreference: {
        type: String,
        enum: SHARING_PREFERENCES,
        default: 'completion_only',
      },
      shareWithGroups: { type: Boolean, default: true },
      _id: false,
    },
    pushSubscription: {
      endpoint: String,
      keys: { p256dh: String, auth: String, _id: false },
      _id: false,
    },
    expoPushToken: String,
    profileEmbedding: [Number],
    insightsEnabled: { type: Boolean, default: true },
    streak: {
      current: { type: Number, default: 0 },
      personalBest: { type: Number, default: 0 },
      lastStreakDate: { type: String, default: null },
      graceDaysUsedThisWeek: { type: Number, default: 0 },
      graceWeekStartDate: { type: String, default: null },
      totalDaysCompleted: { type: Number, default: 0 },
      milestonesSeen: [{ type: Number }],
      _id: false,
    },
  },
  { timestamps: true }
)

export const User = model<IUser>('User', userSchema)

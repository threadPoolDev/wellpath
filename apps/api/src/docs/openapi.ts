import type { OpenAPIV3 } from 'openapi-types'

// ─── Reusable schemas ─────────────────────────────────────────────────────────

const RoutineTask: OpenAPIV3.SchemaObject = {
  type: 'object',
  properties: {
    _id:             { type: 'string' },
    time:            { type: 'string', example: '09:00' },
    durationMinutes: { type: 'number', example: 25 },
    category: {
      type: 'string',
      enum: [
        'hydration', 'exercise', 'nutrition', 'focus_work',
        'break', 'commute', 'family', 'medicine',
        'wind_down', 'learning', 'social', 'mindfulness',
      ],
    },
    title:       { type: 'string', example: 'Morning water' },
    description: { type: 'string', example: 'Start the day with a glass of water.' },
    status:      { type: 'string', enum: ['pending', 'done', 'missed', 'skipped'] },
    completedAt: { type: 'string', format: 'date-time' },
    missedReason:{ type: 'string' },
    didInstead:  { type: 'string' },
  },
}

const Routine: OpenAPIV3.SchemaObject = {
  type: 'object',
  properties: {
    _id:                 { type: 'string' },
    date:                { type: 'string', example: '2026-05-17' },
    dayType:             { type: 'string', enum: ['light', 'moderate', 'packed'] },
    totalMeetingMinutes: { type: 'number' },
    totalFreeMinutes:    { type: 'number' },
    morningCheckin: {
      type: 'object',
      properties: {
        energyLevel: { type: 'string', enum: ['low', 'medium', 'high'] },
        mood:        { type: 'string', enum: ['great', 'okay', 'tired', 'stressed'] },
        anythingDifferentToday: { type: 'string' },
        submittedAt: { type: 'string', format: 'date-time' },
      },
    },
    tasks: { type: 'array', items: RoutineTask },
  },
}

const AuthUser: OpenAPIV3.SchemaObject = {
  type: 'object',
  properties: {
    _id:                { type: 'string' },
    email:              { type: 'string', format: 'email' },
    name:               { type: 'string' },
    authProvider:       { type: 'string', enum: ['email', 'google', 'microsoft'] },
    onboardingComplete: { type: 'boolean' },
    profilePhoto: {
      type: 'object',
      properties: {
        url:          { type: 'string' },
        thumbnailUrl: { type: 'string' },
      },
    },
  },
}

const ErrorResponse: OpenAPIV3.SchemaObject = {
  type: 'object',
  properties: {
    success: { type: 'boolean', example: false },
    message: { type: 'string' },
  },
}

const SuccessWrapper = (dataSchema: OpenAPIV3.SchemaObject): OpenAPIV3.SchemaObject => ({
  type: 'object',
  properties: {
    success: { type: 'boolean', example: true },
    data: dataSchema,
  },
})

// ─── Shared response objects ──────────────────────────────────────────────────

const r401: OpenAPIV3.ResponseObject = {
  description: 'Unauthorized — no valid JWT cookie',
  content: { 'application/json': { schema: ErrorResponse } },
}

const r422: OpenAPIV3.ResponseObject = {
  description: 'Validation error',
  content: { 'application/json': { schema: ErrorResponse } },
}

const r404: OpenAPIV3.ResponseObject = {
  description: 'Not found',
  content: { 'application/json': { schema: ErrorResponse } },
}

// ─── Spec ─────────────────────────────────────────────────────────────────────

export const openapiSpec: OpenAPIV3.Document = {
  openapi: '3.0.3',
  info: {
    title: 'WellPath API',
    version: '0.1.0',
    description:
      'REST API for WellPath — adaptive daily routine planner. Auth via httpOnly cookie (set on login/OAuth).',
  },
  servers: [
    { url: 'http://localhost:3001/api', description: 'Local dev' },
  ],

  tags: [
    { name: 'Auth',        description: 'Register, login, OAuth, session' },
    { name: 'Onboarding',  description: 'Layer 1 onboarding flow' },
    { name: 'User',        description: 'Profile photo management' },
    { name: 'Travel',      description: 'Commute time estimation' },
    { name: 'Calendar',    description: 'Google / Microsoft calendar connect & sync' },
    { name: 'Check-in',    description: 'Morning check-in' },
    { name: 'Routine',     description: 'Daily routine & task status' },
  ],

  paths: {

    // ── Auth ──────────────────────────────────────────────────────────────────

    '/auth/register': {
      post: {
        tags: ['Auth'],
        summary: 'Register with email and password',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['name', 'email', 'password'],
                properties: {
                  name:     { type: 'string', example: 'Utsav Jain' },
                  email:    { type: 'string', format: 'email' },
                  password: { type: 'string', minLength: 8 },
                },
              },
            },
          },
        },
        responses: {
          '201': {
            description: 'Registered — JWT cookie set',
            content: { 'application/json': { schema: SuccessWrapper({ type: 'object', properties: { user: AuthUser } }) } },
          },
          '409': { description: 'Email already registered', content: { 'application/json': { schema: ErrorResponse } } },
          '422': r422,
        },
      },
    },

    '/auth/login': {
      post: {
        tags: ['Auth'],
        summary: 'Login with email and password',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['email', 'password'],
                properties: {
                  email:    { type: 'string', format: 'email' },
                  password: { type: 'string' },
                },
              },
            },
          },
        },
        responses: {
          '200': {
            description: 'Logged in — JWT cookie set',
            content: { 'application/json': { schema: SuccessWrapper({ type: 'object', properties: { user: AuthUser } }) } },
          },
          '401': { description: 'Invalid credentials', content: { 'application/json': { schema: ErrorResponse } } },
        },
      },
    },

    '/auth/me': {
      get: {
        tags: ['Auth'],
        summary: 'Get current authenticated user',
        security: [{ cookieAuth: [] }],
        responses: {
          '200': {
            description: 'Current user',
            content: { 'application/json': { schema: SuccessWrapper({ type: 'object', properties: { user: AuthUser } }) } },
          },
          '401': r401,
        },
      },
    },

    '/auth/logout': {
      post: {
        tags: ['Auth'],
        summary: 'Clear the JWT cookie',
        responses: {
          '200': { description: 'Logged out' },
        },
      },
    },

    '/auth/google': {
      get: {
        tags: ['Auth'],
        summary: 'Initiate Google OAuth login',
        description: 'Redirects the browser to Google consent screen. Not callable via Swagger UI — open in a browser tab.',
        responses: {
          '302': { description: 'Redirect to Google' },
        },
      },
    },

    '/auth/google/callback': {
      get: {
        tags: ['Auth'],
        summary: 'Google OAuth callback — sets JWT cookie and redirects to /auth/callback on the frontend',
        responses: {
          '302': { description: 'Redirect to frontend /auth/callback' },
        },
      },
    },

    '/auth/microsoft': {
      get: {
        tags: ['Auth'],
        summary: 'Initiate Microsoft OAuth login',
        description: 'Redirects the browser to Microsoft consent screen. Not callable via Swagger UI.',
        responses: {
          '302': { description: 'Redirect to Microsoft' },
        },
      },
    },

    '/auth/microsoft/callback': {
      get: {
        tags: ['Auth'],
        summary: 'Microsoft OAuth callback — sets JWT cookie and redirects to frontend',
        responses: {
          '302': { description: 'Redirect to frontend /auth/callback' },
        },
      },
    },

    // ── Onboarding ────────────────────────────────────────────────────────────

    '/onboarding/response': {
      patch: {
        tags: ['Onboarding'],
        summary: 'Save a single question response (called immediately on selection)',
        security: [{ cookieAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['questionId', 'questionText', 'questionType', 'answerValue'],
                properties: {
                  questionId:           { type: 'string', example: 'work_mode' },
                  questionText:         { type: 'string', example: 'Work from home, office, or both?' },
                  questionType:         { type: 'string', enum: ['single_select', 'multi_select', 'time_picker', 'text_input', 'yes_no', 'scale'] },
                  options:              { type: 'array', items: { type: 'string' } },
                  answerValue:          { description: 'Any JSON value matching the question type' },
                  skipped:              { type: 'boolean' },
                  timeToAnswerSeconds:  { type: 'number' },
                  droppedOffAtQuestion: { type: 'string', description: 'ID of next question (for resume)' },
                },
              },
            },
          },
        },
        responses: {
          '200': { description: 'Response saved' },
          '401': r401,
        },
      },
    },

    '/onboarding/session': {
      get: {
        tags: ['Onboarding'],
        summary: 'Get the current onboarding session (to resume)',
        security: [{ cookieAuth: [] }],
        responses: {
          '200': {
            description: 'Session with all responses so far',
            content: {
              'application/json': {
                schema: SuccessWrapper({
                  type: 'object',
                  properties: {
                    sessionId:            { type: 'string' },
                    droppedOffAtQuestion: { type: 'string' },
                    responses: {
                      type: 'array',
                      items: {
                        type: 'object',
                        properties: {
                          questionId:  { type: 'string' },
                          answerValue: {},
                          skipped:     { type: 'boolean' },
                        },
                      },
                    },
                  },
                }),
              },
            },
          },
          '401': r401,
        },
      },
    },

    '/onboarding/complete': {
      post: {
        tags: ['Onboarding'],
        summary: 'Mark onboarding complete — writes all responses into the user profile',
        security: [{ cookieAuth: [] }],
        responses: {
          '200': { description: 'Onboarding complete, user profile updated' },
          '401': r401,
        },
      },
    },

    // ── User ──────────────────────────────────────────────────────────────────

    '/user/profile-photo': {
      post: {
        tags: ['User'],
        summary: 'Upload or replace profile photo',
        security: [{ cookieAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'multipart/form-data': {
              schema: {
                type: 'object',
                required: ['photo'],
                properties: {
                  photo: { type: 'string', format: 'binary', description: 'JPEG / PNG / WEBP, max 5 MB' },
                },
              },
            },
          },
        },
        responses: {
          '200': {
            description: 'Photo uploaded',
            content: {
              'application/json': {
                schema: SuccessWrapper({
                  type: 'object',
                  properties: {
                    url:          { type: 'string' },
                    thumbnailUrl: { type: 'string' },
                  },
                }),
              },
            },
          },
          '401': r401,
          '422': { description: 'Invalid file format or size', content: { 'application/json': { schema: ErrorResponse } } },
        },
      },
      delete: {
        tags: ['User'],
        summary: 'Remove profile photo — reverts to initials avatar',
        security: [{ cookieAuth: [] }],
        responses: {
          '200': { description: 'Photo removed' },
          '401': r401,
        },
      },
    },

    // ── Travel ────────────────────────────────────────────────────────────────

    '/travel/estimate': {
      get: {
        tags: ['Travel'],
        summary: 'Estimate commute time between two locations',
        security: [{ cookieAuth: [] }],
        parameters: [
          { name: 'home',   in: 'query', required: true,  schema: { type: 'string' }, example: 'Koramangala, Bengaluru' },
          { name: 'office', in: 'query', required: true,  schema: { type: 'string' }, example: 'Whitefield, Bengaluru' },
          { name: 'mode',   in: 'query', required: true,  schema: { type: 'string', enum: ['car', 'metro', 'bus', 'walk', 'cycle', 'two_wheeler'] } },
        ],
        responses: {
          '200': {
            description: 'Commute estimate',
            content: {
              'application/json': {
                schema: SuccessWrapper({
                  type: 'object',
                  properties: {
                    durationMinutes: { type: 'number', example: 35 },
                    distanceKm:      { type: 'number', example: 12 },
                    source:          { type: 'string', example: 'openrouteservice' },
                    fallback:        { type: 'boolean', description: 'true if estimation failed' },
                  },
                }),
              },
            },
          },
          '401': r401,
          '429': { description: 'Rate limit — max 10 calls per user per day', content: { 'application/json': { schema: ErrorResponse } } },
        },
      },
    },

    // ── Calendar ──────────────────────────────────────────────────────────────

    '/calendar/connect/google': {
      get: {
        tags: ['Calendar'],
        summary: 'Initiate Google Calendar OAuth — redirects to Google',
        description: 'Not callable via Swagger UI — open in a browser tab.',
        security: [{ cookieAuth: [] }],
        responses: {
          '302': { description: 'Redirect to Google consent' },
          '401': r401,
        },
      },
    },

    '/calendar/connect/google/callback': {
      get: {
        tags: ['Calendar'],
        summary: 'Google Calendar OAuth callback — saves tokens and syncs events',
        responses: {
          '302': { description: 'Redirect to frontend onboarding or settings' },
        },
      },
    },

    '/calendar/connect/microsoft': {
      get: {
        tags: ['Calendar'],
        summary: 'Initiate Microsoft Calendar OAuth — redirects to Microsoft',
        description: 'Not callable via Swagger UI — open in a browser tab.',
        security: [{ cookieAuth: [] }],
        responses: {
          '302': { description: 'Redirect to Microsoft consent' },
          '401': r401,
        },
      },
    },

    '/calendar/connect/microsoft/callback': {
      get: {
        tags: ['Calendar'],
        summary: 'Microsoft Calendar OAuth callback — saves tokens and syncs events',
        responses: {
          '302': { description: 'Redirect to frontend onboarding or settings' },
        },
      },
    },

    '/calendar/connections': {
      get: {
        tags: ['Calendar'],
        summary: 'List connected calendars',
        security: [{ cookieAuth: [] }],
        responses: {
          '200': {
            description: 'Active calendar connections',
            content: {
              'application/json': {
                schema: SuccessWrapper({
                  type: 'object',
                  properties: {
                    connections: {
                      type: 'array',
                      items: {
                        type: 'object',
                        properties: {
                          provider:     { type: 'string', enum: ['google', 'microsoft'] },
                          accountEmail: { type: 'string', format: 'email' },
                          isActive:     { type: 'boolean' },
                          lastSyncedAt: { type: 'string', format: 'date-time' },
                          connectedAt:  { type: 'string', format: 'date-time' },
                        },
                      },
                    },
                  },
                }),
              },
            },
          },
          '401': r401,
        },
      },
    },

    '/calendar/connections/{provider}': {
      delete: {
        tags: ['Calendar'],
        summary: 'Disconnect a calendar provider',
        security: [{ cookieAuth: [] }],
        parameters: [
          { name: 'provider', in: 'path', required: true, schema: { type: 'string', enum: ['google', 'microsoft'] } },
        ],
        responses: {
          '200': { description: 'Calendar disconnected' },
          '401': r401,
          '404': r404,
        },
      },
    },

    '/calendar/events': {
      get: {
        tags: ['Calendar'],
        summary: 'Get calendar events for a specific date',
        security: [{ cookieAuth: [] }],
        parameters: [
          { name: 'date', in: 'query', required: true, schema: { type: 'string', example: '2026-05-17' }, description: 'YYYY-MM-DD' },
        ],
        responses: {
          '200': {
            description: 'Events and day classification',
            content: {
              'application/json': {
                schema: SuccessWrapper({
                  type: 'object',
                  properties: {
                    date:                { type: 'string' },
                    dayType:             { type: 'string', enum: ['light', 'moderate', 'packed'] },
                    totalMeetingMinutes: { type: 'number' },
                    totalFreeMinutes:    { type: 'number' },
                    events: {
                      type: 'array',
                      items: {
                        type: 'object',
                        properties: {
                          title:           { type: 'string' },
                          startTime:       { type: 'string', format: 'date-time' },
                          endTime:         { type: 'string', format: 'date-time' },
                          durationMinutes: { type: 'number' },
                          provider:        { type: 'string', enum: ['google', 'microsoft'] },
                        },
                      },
                    },
                  },
                }),
              },
            },
          },
          '401': r401,
        },
      },
    },

    // ── Check-in ──────────────────────────────────────────────────────────────

    '/checkin/morning': {
      post: {
        tags: ['Check-in'],
        summary: 'Submit morning check-in — triggers async routine generation',
        security: [{ cookieAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['energyLevel', 'mood'],
                properties: {
                  energyLevel:            { type: 'string', enum: ['low', 'medium', 'high'] },
                  mood:                   { type: 'string', enum: ['great', 'okay', 'tired', 'stressed'] },
                  anythingDifferentToday: { type: 'string', description: 'Optional free text' },
                  date:                   { type: 'string', example: '2026-05-17', description: 'YYYY-MM-DD, defaults to today' },
                },
              },
            },
          },
        },
        responses: {
          '200': {
            description: 'Check-in saved. Routine generation is async — poll GET /routine/today.',
            content: {
              'application/json': {
                schema: SuccessWrapper({
                  type: 'object',
                  properties: {
                    routineId:           { type: 'string' },
                    date:                { type: 'string' },
                    dayType:             { type: 'string', enum: ['light', 'moderate', 'packed'] },
                    totalMeetingMinutes: { type: 'number' },
                    totalFreeMinutes:    { type: 'number' },
                    morningCheckin: {
                      type: 'object',
                      properties: {
                        energyLevel: { type: 'string' },
                        mood:        { type: 'string' },
                        anythingDifferentToday: { type: 'string' },
                        submittedAt: { type: 'string', format: 'date-time' },
                      },
                    },
                  },
                }),
              },
            },
          },
          '401': r401,
          '422': r422,
        },
      },
    },

    '/checkin/morning/status': {
      get: {
        tags: ['Check-in'],
        summary: 'Check whether the morning check-in has been submitted today',
        security: [{ cookieAuth: [] }],
        responses: {
          '200': {
            description: 'Check-in status',
            content: {
              'application/json': {
                schema: SuccessWrapper({
                  type: 'object',
                  properties: {
                    submitted: { type: 'boolean' },
                    date:      { type: 'string', example: '2026-05-17' },
                  },
                }),
              },
            },
          },
          '401': r401,
        },
      },
    },

    // ── Routine ───────────────────────────────────────────────────────────────

    '/routine/today': {
      get: {
        tags: ['Routine'],
        summary: "Get today's routine (null if not yet generated)",
        security: [{ cookieAuth: [] }],
        responses: {
          '200': {
            description: 'Routine or null',
            content: {
              'application/json': {
                schema: SuccessWrapper({
                  type: 'object',
                  properties: {
                    routine: { oneOf: [Routine, { nullable: true, type: 'object', description: 'null when not yet generated' }] },
                  },
                }),
              },
            },
          },
          '401': r401,
        },
      },
    },

    '/routine/{routineId}/tasks/{taskId}/status': {
      patch: {
        tags: ['Routine'],
        summary: 'Mark a task as done, missed, or skipped',
        security: [{ cookieAuth: [] }],
        parameters: [
          { name: 'routineId', in: 'path', required: true, schema: { type: 'string' } },
          { name: 'taskId',    in: 'path', required: true, schema: { type: 'string' } },
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['status'],
                properties: {
                  status:         { type: 'string', enum: ['done', 'missed', 'skipped'] },
                  missedReason:   { type: 'string', description: 'Optional — only for missed' },
                  didInstead:     { type: 'string', description: 'Optional — only for missed' },
                  shareWithGroup: { type: 'boolean', description: 'Per-entry group sharing override' },
                },
              },
            },
          },
        },
        responses: {
          '200': {
            description: 'Updated routine',
            content: {
              'application/json': {
                schema: SuccessWrapper({ type: 'object', properties: { routine: Routine } }),
              },
            },
          },
          '401': r401,
          '404': r404,
          '422': r422,
        },
      },
    },

  },

  components: {
    securitySchemes: {
      cookieAuth: {
        type: 'apiKey',
        in: 'cookie',
        name: 'token',
        description: 'JWT set automatically on login or OAuth. Swagger UI cannot set httpOnly cookies — use a browser session from the app.',
      },
    },
  },
}

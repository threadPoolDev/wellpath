export const AUTH_STRINGS = {
  LOGIN_TITLE: 'Welcome back',
  LOGIN_SUBTITLE: 'Sign in to continue your wellness journey',
  REGISTER_TITLE: 'Create account',
  REGISTER_SUBTITLE: 'Start building healthier routines',
  EMAIL_PLACEHOLDER: 'Email address',
  PASSWORD_PLACEHOLDER: 'Password',
  NAME_PLACEHOLDER: 'Your name',
  LOGIN_BUTTON: 'Sign in',
  REGISTER_BUTTON: 'Create account',
  GOOGLE_BUTTON: 'Continue with Google',
  MICROSOFT_BUTTON: 'Continue with Microsoft',
  NO_ACCOUNT: "Don't have an account?",
  HAVE_ACCOUNT: 'Already have an account?',
  SIGN_UP: 'Sign up',
  SIGN_IN: 'Sign in',
  ERROR_INVALID_CREDENTIALS: 'Invalid email or password',
  ERROR_GENERIC: 'Something went wrong. Please try again.',
  ERROR_EMAIL_REQUIRED: 'Email is required',
  ERROR_PASSWORD_REQUIRED: 'Password is required',
  ERROR_NAME_REQUIRED: 'Your name is required',
  OAUTH_LOADING: 'Signing you in…',
} as const

export const AUTH_QUERY_KEYS = {
  ME: ['auth', 'me'] as const,
} as const

export const AUTH_DEEP_LINK_SCHEME = 'wellpath://auth/callback'

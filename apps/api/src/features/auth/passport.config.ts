import passport from 'passport'
import { Strategy as GoogleStrategy } from 'passport-google-oauth20'
import { Strategy as OAuth2Strategy } from 'passport-oauth2'
import type { VerifyCallback } from 'passport-oauth2'
import { authService } from './auth.service.js'

interface MicrosoftProfile {
  id: string
  displayName: string
  mail?: string
  userPrincipalName?: string
}

export function configurePassport(): void {
  const apiUrl = process.env.API_URL ?? 'http://localhost:5000'

  // ─── Google ───────────────────────────────────────────────────────────────
  const googleClientId = process.env.GOOGLE_CLIENT_ID
  const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET

  if (googleClientId && googleClientSecret) {
    passport.use(
      'google',
      new GoogleStrategy(
        {
          clientID: googleClientId,
          clientSecret: googleClientSecret,
          callbackURL: `${apiUrl}/api/auth/google/callback`,
          scope: ['profile', 'email'],
        },
        async (_accessToken, _refreshToken, profile, done) => {
          try {
            const email = profile.emails?.[0]?.value ?? ''
            const user = await authService.handleOAuthUser({
              providerId: profile.id,
              email,
              name: profile.displayName,
              authProvider: 'google',
              accessToken: _accessToken,
              refreshToken: _refreshToken,
              avatarUrl: profile.photos?.[0]?.value,
            })
            done(null, user)
          } catch (err) {
            done(err as Error)
          }
        }
      )
    )
  } else {
    console.warn('[passport] GOOGLE_CLIENT_ID or GOOGLE_CLIENT_SECRET not set — Google OAuth disabled')
  }

  // ─── Microsoft ────────────────────────────────────────────────────────────
  const msClientId = process.env.MICROSOFT_CLIENT_ID
  const msClientSecret = process.env.MICROSOFT_CLIENT_SECRET
  const msTenantId = process.env.MICROSOFT_TENANT_ID ?? 'common'

  if (msClientId && msClientSecret) {
    passport.use(
      'microsoft',
      new OAuth2Strategy(
        {
          authorizationURL: `https://login.microsoftonline.com/${msTenantId}/oauth2/v2.0/authorize`,
          tokenURL: `https://login.microsoftonline.com/${msTenantId}/oauth2/v2.0/token`,
          clientID: msClientId,
          clientSecret: msClientSecret,
          callbackURL: `${apiUrl}/api/auth/microsoft/callback`,
          scope: ['openid', 'profile', 'email', 'User.Read'],
        },
        async (accessToken: string, refreshToken: string, _profile: Record<string, unknown>, done: VerifyCallback) => {
          try {
            const graphRes = await fetch('https://graph.microsoft.com/v1.0/me', {
              headers: { Authorization: `Bearer ${accessToken}` },
            })
            const msProfile = (await graphRes.json()) as MicrosoftProfile

            const email = msProfile.mail ?? msProfile.userPrincipalName ?? ''
            const user = await authService.handleOAuthUser({
              providerId: msProfile.id,
              email,
              name: msProfile.displayName,
              authProvider: 'microsoft',
              accessToken,
              refreshToken,
            })
            done(null, user)
          } catch (err) {
            done(err as Error)
          }
        }
      )
    )
  } else {
    console.warn('[passport] MICROSOFT_CLIENT_ID or MICROSOFT_CLIENT_SECRET not set — Microsoft OAuth disabled')
  }
}

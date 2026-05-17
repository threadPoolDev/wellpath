import { TRAVEL_TIME } from '../../constants/index.js'
import { ValidationError } from '../../lib/errors.js'
import { TravelEstimateResponse, TravelEstimateResult } from './travel.types.js'

// In-memory rate limit counter — keyed by userId:YYYY-MM-DD
const callCounts = new Map<string, number>()

function rateLimitKey(userId: string): string {
  return `${userId}:${new Date().toISOString().slice(0, 10)}`
}

function checkRateLimit(userId: string): void {
  const count = callCounts.get(rateLimitKey(userId)) ?? 0
  if (count >= TRAVEL_TIME.MAX_CALLS_PER_USER_PER_DAY) {
    throw new ValidationError(
      `Travel time limit reached (${TRAVEL_TIME.MAX_CALLS_PER_USER_PER_DAY} lookups per day).`
    )
  }
}

function incrementCount(userId: string): void {
  const key = rateLimitKey(userId)
  callCounts.set(key, (callCounts.get(key) ?? 0) + 1)
}

// ─── Mode maps ────────────────────────────────────────────────────────────────

const GOOGLE_MODE_MAP: Record<string, string> = {
  car: 'driving',
  bus: 'driving',
  two_wheeler: 'driving',
  metro: 'transit',
  walk: 'walking',
  cycle: 'bicycling',
}

// ORS doesn't support transit — metro falls back to driving
const ORS_MODE_MAP: Record<string, string> = {
  car: 'driving-car',
  bus: 'driving-car',
  two_wheeler: 'driving-car',
  metro: 'driving-car',
  walk: 'foot-walking',
  cycle: 'cycling-regular',
}

// ─── Google Maps Distance Matrix ──────────────────────────────────────────────

interface GoogleDistanceMatrixResponse {
  rows: Array<{
    elements: Array<{
      status: string
      duration: { value: number; text: string }
      distance: { value: number; text: string }
    }>
  }>
}

async function fetchFromGoogleMaps(
  home: string,
  office: string,
  mode: string
): Promise<TravelEstimateResponse> {
  const apiKey = process.env.GOOGLE_MAPS_API_KEY
  if (!apiKey) return { error: 'Google Maps API key not configured', fallback: true }

  const travelMode = GOOGLE_MODE_MAP[mode] ?? 'driving'
  const params = new URLSearchParams({ origins: home, destinations: office, mode: travelMode, key: apiKey })
  const url = `https://maps.googleapis.com/maps/api/distancematrix/json?${params}`

  const res = await fetch(url, { signal: AbortSignal.timeout(8000) })
  const data = (await res.json()) as GoogleDistanceMatrixResponse

  const element = data?.rows?.[0]?.elements?.[0]
  if (!element || element.status !== 'OK') {
    return { error: 'Could not fetch travel time', fallback: true }
  }

  return {
    durationMinutes: Math.round(element.duration.value / 60),
    distanceKm: Math.round((element.distance.value / 1000) * 10) / 10,
    source: 'google_maps',
  }
}

// ─── OpenRouteService ─────────────────────────────────────────────────────────

interface ORSGeocodeResponse {
  features: Array<{ geometry: { coordinates: [number, number] } }>
}

interface ORSDirectionsResponse {
  routes: Array<{
    summary: { duration: number; distance: number }
  }>
}

async function geocodeORS(place: string, apiKey: string): Promise<[number, number] | null> {
  const params = new URLSearchParams({ api_key: apiKey, text: place, size: '1' })
  const res = await fetch(
    `https://api.openrouteservice.org/geocode/search?${params}`,
    { signal: AbortSignal.timeout(5000) }
  )
  const data = (await res.json()) as ORSGeocodeResponse
  const coords = data?.features?.[0]?.geometry?.coordinates
  return coords ?? null
}

async function fetchFromORS(
  home: string,
  office: string,
  mode: string
): Promise<TravelEstimateResponse> {
  const apiKey = process.env.ORS_API_KEY
  if (!apiKey) return { error: 'OpenRouteService API key not configured', fallback: true }

  const profile = ORS_MODE_MAP[mode] ?? 'driving-car'

  const [homeCoords, officeCoords] = await Promise.all([
    geocodeORS(home, apiKey),
    geocodeORS(office, apiKey),
  ])

  if (!homeCoords || !officeCoords) {
    return { error: 'Could not geocode addresses', fallback: true }
  }

  const res = await fetch(
    `https://api.openrouteservice.org/v2/directions/${profile}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: apiKey },
      body: JSON.stringify({ coordinates: [homeCoords, officeCoords] }),
      signal: AbortSignal.timeout(8000),
    }
  )

  const data = (await res.json()) as ORSDirectionsResponse
  const summary = data?.routes?.[0]?.summary
  if (!summary) return { error: 'Could not fetch travel time', fallback: true }

  return {
    durationMinutes: Math.round(summary.duration / 60),
    distanceKm: Math.round((summary.distance / 1000) * 10) / 10,
    source: 'openrouteservice',
  } satisfies TravelEstimateResult
}

// ─── Public service function ──────────────────────────────────────────────────

export async function estimateTravelTime(
  userId: string,
  home: string,
  office: string,
  mode: string
): Promise<TravelEstimateResponse> {
  if (!home || !office || !mode) throw new ValidationError('home, office, and mode are required')

  checkRateLimit(userId)

  const useGoogle = process.env.TRAVEL_PROVIDER === 'google_maps'

  try {
    const result = useGoogle
      ? await fetchFromGoogleMaps(home, office, mode)
      : await fetchFromORS(home, office, mode)

    if (!('fallback' in result)) incrementCount(userId)
    return result
  } catch {
    return { error: 'Could not fetch travel time', fallback: true }
  }
}

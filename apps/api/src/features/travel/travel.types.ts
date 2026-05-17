export interface TravelEstimateResult {
  durationMinutes: number
  distanceKm: number
  source: 'google_maps' | 'openrouteservice'
}

export interface TravelEstimateFallback {
  error: string
  fallback: true
}

export type TravelEstimateResponse = TravelEstimateResult | TravelEstimateFallback

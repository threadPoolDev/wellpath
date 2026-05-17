import { apiClient } from '@/lib/apiClient'

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

export async function fetchTravelEstimate(
  home: string,
  office: string,
  mode: string
): Promise<TravelEstimateResponse> {
  const res = await apiClient.get<{ data: TravelEstimateResponse }>('/travel/estimate', {
    params: { home, office, mode },
  })
  return res.data.data
}

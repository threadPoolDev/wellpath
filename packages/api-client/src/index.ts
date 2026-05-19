// Fetch-based API client for mobile (and any non-browser context).
// Web uses axios with httpOnly cookies instead — this client is mobile-first.
// Pass getToken to inject a Bearer token (from Expo SecureStore in mobile).

export type TokenGetter = () => Promise<string | null>

export interface ApiClientConfig {
  baseUrl: string
  getToken?: TokenGetter
}

export class ApiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
    public readonly code?: string,
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

async function request<T>(
  config: ApiClientConfig,
  method: string,
  path: string,
  body?: unknown,
): Promise<T> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  }

  if (config.getToken) {
    const token = await config.getToken()
    if (token) headers['Authorization'] = `Bearer ${token}`
  }

  const res = await fetch(`${config.baseUrl}${path}`, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  })

  // Parse JSON body — swallow parse errors gracefully
  const json = await res.json().catch(() => ({})) as Record<string, unknown>

  if (!res.ok) {
    const errObj = json?.error as Record<string, unknown> | undefined
    const message = (errObj?.message as string) ?? `Request failed (${res.status})`
    const code = errObj?.code as string | undefined
    throw new ApiError(message, res.status, code)
  }

  return json as T
}

export function createApiClient(config: ApiClientConfig) {
  return {
    get:    <T>(path: string) => request<T>(config, 'GET', path),
    post:   <T>(path: string, body?: unknown) => request<T>(config, 'POST', path, body),
    patch:  <T>(path: string, body?: unknown) => request<T>(config, 'PATCH', path, body),
    put:    <T>(path: string, body?: unknown) => request<T>(config, 'PUT', path, body),
    delete: <T>(path: string) => request<T>(config, 'DELETE', path),
  }
}

export type ApiClient = ReturnType<typeof createApiClient>

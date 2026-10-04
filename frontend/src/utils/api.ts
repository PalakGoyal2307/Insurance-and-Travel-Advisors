const configuredApiBaseUrl = (import.meta.env.VITE_API_BASE_URL || 'https://pnp-advisors-backend.onrender.com/api').replace(/\/+$/, '')
export const API_BASE_URL = configuredApiBaseUrl.endsWith('/api')
  ? configuredApiBaseUrl
  : `${configuredApiBaseUrl}/api`

export class ApiRequestError extends Error {
  statusCode: number
  details: unknown

  constructor(message: string, statusCode: number, details: unknown = null) {
    super(message)
    this.statusCode = statusCode
    this.details = details
  }
}

interface RequestOptions extends RequestInit {
  skipJson?: boolean
}

export const apiRequest = async <T>(
  endpoint: string,
  options: RequestOptions = {}
): Promise<T> => {
  const { skipJson = false, headers, ...restOptions } = options

  let response: Response
  try {
    response = await fetch(`${API_BASE_URL}${endpoint}`, {
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        ...(headers || {}),
      },
      ...restOptions,
    })
  } catch {
    throw new ApiRequestError('Unable to reach the server. Check your internet connection and try again.', 0)
  }

  if (skipJson) {
    if (!response.ok) {
      throw new ApiRequestError('Request failed', response.status)
    }

    return null as T
  }

  let data: { success?: boolean; message?: string; details?: unknown }
  try {
    data = await response.json()
  } catch {
    throw new ApiRequestError(
      response.ok
        ? 'The server returned an unexpected response. Please try again later.'
        : 'The server is temporarily unavailable. Please try again shortly.',
      response.status
    )
  }

  if (!response.ok || !data.success) {
    throw new ApiRequestError(data.message || 'Request failed', response.status, data.details)
  }

  return data as T
}

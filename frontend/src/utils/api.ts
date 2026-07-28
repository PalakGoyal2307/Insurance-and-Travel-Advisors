export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api'

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

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...(headers || {}),
    },
    ...restOptions,
  })

  if (skipJson) {
    if (!response.ok) {
      throw new ApiRequestError('Request failed', response.status)
    }

    return null as T
  }

  const data = await response.json()

  if (!response.ok || !data.success) {
    throw new ApiRequestError(data.message || 'Request failed', response.status, data.details)
  }

  return data as T
}

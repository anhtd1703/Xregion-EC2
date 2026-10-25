import type { ApiResponse } from '@xregion/contracts'

export class ApiClientError extends Error {
  public code: string
  public details?: Record<string, unknown>

  constructor(code: string, message: string, details?: Record<string, unknown>) {
    super(message)
    this.name = 'ApiClientError'
    this.code = code
    this.details = details
  }
}

export interface ApiRequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'
  body?: unknown
  query?: Record<string, string | number | boolean | undefined>
  headers?: Record<string, string>
}

export function useApi() {
  const config = useRuntimeConfig()
  const baseUrl = config.public.apiBaseUrl || '/api/v1'

  async function request<T>(endpoint: string, options: ApiRequestOptions = {}): Promise<T> {
    const url = endpoint.startsWith('http') ? endpoint : `${baseUrl}${endpoint}`

    try {
      const response = await $fetch<ApiResponse<T>>(url, {
        method: options.method || 'GET',
        body: options.body,
        query: options.query,
        headers: {
          'Content-Type': 'application/json',
          ...options.headers
        }
      })

      if (!response.success) {
        throw new ApiClientError(
          response.error.code,
          response.error.message,
          response.error.details
        )
      }

      return response.data
    } catch (err: unknown) {
      if (err instanceof ApiClientError) {
        throw err
      }
      const fetchErr = err as {
        data?: { error?: { code?: string; message?: string; details?: Record<string, unknown> } }
        message?: string
      }
      const code = fetchErr?.data?.error?.code || 'UNKNOWN_ERROR'
      const message =
        fetchErr?.data?.error?.message || fetchErr?.message || 'Network request failed'
      throw new ApiClientError(code, message, fetchErr?.data?.error?.details)
    }
  }

  return {
    request,
    get: <T>(endpoint: string, query?: Record<string, string | number | boolean | undefined>) =>
      request<T>(endpoint, { method: 'GET', query }),
    post: <T>(endpoint: string, body?: unknown) => request<T>(endpoint, { method: 'POST', body }),
    patch: <T>(endpoint: string, body?: unknown) => request<T>(endpoint, { method: 'PATCH', body }),
    delete: <T>(endpoint: string) => request<T>(endpoint, { method: 'DELETE' })
  }
}

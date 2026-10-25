import type { ErrorCode } from '../enums/error-codes.js'

export interface ApiMeta {
  requestId: string
  page?: number
  pageSize?: number
  total?: number
  [key: string]: unknown
}

export interface ApiErrorDetail {
  code: ErrorCode | string
  message: string
  details?: Record<string, unknown>
}

export interface ApiSuccessResponse<T> {
  success: true
  data: T
  meta: ApiMeta
}

export interface ApiErrorResponse {
  success: false
  error: ApiErrorDetail
  meta: ApiMeta
}

export type ApiResponse<T> = ApiSuccessResponse<T> | ApiErrorResponse

export interface PaginatedResponse<T> {
  success: true
  data: T[]
  meta: ApiMeta & {
    page: number
    pageSize: number
    total: number
  }
}

export interface PaginationQuery {
  page?: number
  pageSize?: number
}

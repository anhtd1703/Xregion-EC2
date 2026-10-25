import type { ApiErrorResponse, ApiSuccessResponse, PaginatedResponse } from '@xregion/contracts'
import { ErrorCode } from '@xregion/contracts'
import { AppError } from '../errors/app-error.js'
import type { ApiGatewayResult } from './types.js'

const DEFAULT_HEADERS: Record<string, string> = {
  'Content-Type': 'application/json',
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type,Authorization,X-Request-Id',
  'Access-Control-Allow-Methods': 'OPTIONS,GET,POST,PUT,PATCH,DELETE'
}

export function createSuccessResult<T>(
  data: T,
  requestId = 'req_mock',
  statusCode = 200,
  extraMeta?: Record<string, unknown>
): ApiGatewayResult {
  const body: ApiSuccessResponse<T> = {
    success: true,
    data,
    meta: {
      requestId,
      ...extraMeta
    }
  }

  return {
    statusCode,
    headers: DEFAULT_HEADERS,
    body: JSON.stringify(body)
  }
}

export function createPaginatedResult<T>(
  data: T[],
  pagination: { page: number; pageSize: number; total: number },
  requestId = 'req_mock',
  extraMeta?: Record<string, unknown>
): ApiGatewayResult {
  const body: PaginatedResponse<T> = {
    success: true,
    data,
    meta: {
      requestId,
      page: pagination.page,
      pageSize: pagination.pageSize,
      total: pagination.total,
      ...extraMeta
    }
  }

  return {
    statusCode: 200,
    headers: DEFAULT_HEADERS,
    body: JSON.stringify(body)
  }
}

export function createErrorResult(err: unknown, requestId = 'req_mock'): ApiGatewayResult {
  if (err instanceof AppError) {
    const body: ApiErrorResponse = {
      success: false,
      error: {
        code: err.code,
        message: err.message,
        ...(err.details ? { details: err.details } : {})
      },
      meta: {
        requestId
      }
    }

    return {
      statusCode: err.statusCode,
      headers: DEFAULT_HEADERS,
      body: JSON.stringify(body)
    }
  }

  const message = err instanceof Error ? err.message : 'An unexpected error occurred'
  const body: ApiErrorResponse = {
    success: false,
    error: {
      code: ErrorCode.INTERNAL_ERROR,
      message
    },
    meta: {
      requestId
    }
  }

  return {
    statusCode: 500,
    headers: DEFAULT_HEADERS,
    body: JSON.stringify(body)
  }
}

import { AppError } from '@xregion/backend'
import type { H3Event } from 'h3'
import { createError } from 'h3'

export function handleNitroError(event: H3Event, err: unknown): never {
  const requestId = event.node.req.headers['x-request-id']?.toString() || `req_err_${Date.now()}`

  if (err instanceof AppError) {
    throw createError({
      statusCode: err.statusCode,
      statusMessage: err.message,
      data: {
        success: false,
        error: {
          code: err.code,
          message: err.message,
          details: err.details
        },
        meta: {
          requestId
        }
      }
    })
  }

  const rawMessage = err instanceof Error ? err.message : 'Internal Server Error'
  throw createError({
    statusCode: 500,
    statusMessage: rawMessage,
    data: {
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: rawMessage
      },
      meta: {
        requestId
      }
    }
  })
}

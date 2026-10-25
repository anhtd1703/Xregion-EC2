import { describe, expect, it } from 'vitest'
import { ErrorCode } from '@xregion/contracts'
import {
  AppError,
  ConflictError,
  NotFoundError,
  ValidationError
} from '../shared/errors/app-error.js'
import { createErrorResult } from '../shared/http/response.js'

describe('Error Handling and Response Envelopes', () => {
  it('correctly maps NotFoundError to 404 response envelope', () => {
    const error = new NotFoundError('Instance vm-999 not found')
    const result = createErrorResult(error, 'req_test_1')

    expect(result.statusCode).toBe(404)
    const body = JSON.parse(result.body)
    expect(body.success).toBe(false)
    expect(body.error.code).toBe(ErrorCode.INSTANCE_NOT_FOUND)
    expect(body.error.message).toContain('vm-999')
    expect(body.meta.requestId).toBe('req_test_1')
  })

  it('correctly maps ValidationError to 422 response envelope', () => {
    const error = new ValidationError('Invalid input parameters', { field: 'name' })
    const result = createErrorResult(error, 'req_test_2')

    expect(result.statusCode).toBe(422)
    const body = JSON.parse(result.body)
    expect(body.success).toBe(false)
    expect(body.error.code).toBe(ErrorCode.VALIDATION_ERROR)
    expect(body.error.details).toEqual({ field: 'name' })
  })

  it('correctly maps ConflictError to 409 response envelope', () => {
    const error = new ConflictError('Scenario name already in use')
    const result = createErrorResult(error, 'req_test_3')

    expect(result.statusCode).toBe(409)
    const body = JSON.parse(result.body)
    expect(body.success).toBe(false)
    expect(body.error.code).toBe(ErrorCode.SCENARIO_CONFLICT)
  })

  it('catches generic errors and converts to 500 INTERNAL_ERROR', () => {
    const error = new Error('Database connection failed')
    const result = createErrorResult(error, 'req_test_4')

    expect(result.statusCode).toBe(500)
    const body = JSON.parse(result.body)
    expect(body.success).toBe(false)
    expect(body.error.code).toBe(ErrorCode.INTERNAL_ERROR)
    expect(body.error.message).toBe('Database connection failed')
  })
})

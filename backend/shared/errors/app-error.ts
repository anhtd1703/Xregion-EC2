import { ErrorCode } from '@xregion/contracts'

export class AppError extends Error {
  public readonly code: ErrorCode
  public readonly statusCode: number
  public readonly details?: Record<string, unknown>

  constructor(
    code: ErrorCode,
    message: string,
    statusCode = 400,
    details?: Record<string, unknown>
  ) {
    super(message)
    this.name = 'AppError'
    this.code = code
    this.statusCode = statusCode
    this.details = details
    Object.setPrototypeOf(this, new.target.prototype)
  }
}

export class NotFoundError extends AppError {
  constructor(message: string, code: ErrorCode = ErrorCode.INSTANCE_NOT_FOUND) {
    super(code, message, 404)
    this.name = 'NotFoundError'
  }
}

export class ValidationError extends AppError {
  constructor(message: string, details?: Record<string, unknown>) {
    super(ErrorCode.VALIDATION_ERROR, message, 422, details)
    this.name = 'ValidationError'
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = 'Unauthorized') {
    super(ErrorCode.UNAUTHORIZED, message, 401)
    this.name = 'UnauthorizedError'
  }
}

export class ConflictError extends AppError {
  constructor(message: string, code: ErrorCode = ErrorCode.SCENARIO_CONFLICT) {
    super(code, message, 409)
    this.name = 'ConflictError'
  }
}

export class ProviderUnavailableError extends AppError {
  constructor(message = 'Provider service is temporarily unavailable') {
    super(ErrorCode.PROVIDER_UNAVAILABLE, message, 503)
    this.name = 'ProviderUnavailableError'
  }
}

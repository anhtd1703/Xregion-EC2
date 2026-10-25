import type { LoginRequest } from '@xregion/contracts'
import { createErrorResult, createSuccessResult } from '../../shared/http/response.js'
import type { ApiGatewayEvent, ApiGatewayResult } from '../../shared/http/types.js'
import { createLogger } from '../../shared/logging/logger.js'
import { AuthService } from './service.js'

const logger = createLogger('auth-service')
const authService = new AuthService()

export async function handler(event: ApiGatewayEvent): Promise<ApiGatewayResult> {
  const requestId = event.requestContext?.requestId || 'req_auth'

  try {
    const path = event.path || ''
    const method = event.httpMethod.toUpperCase()

    if (method === 'POST' && path.endsWith('/auth/login')) {
      const payload: LoginRequest = event.body ? JSON.parse(event.body) : {}
      const res = await authService.login(payload)
      logger.info('auth.login.success', 'User logged in', {
        requestId,
        username: payload.username
      })
      return createSuccessResult(res, requestId)
    }

    if (method === 'GET' && path.endsWith('/auth/me')) {
      const authHeader = event.headers['Authorization'] || event.headers['authorization']
      const token = authHeader?.replace('Bearer ', '')
      const user = await authService.getCurrentUser(token)
      return createSuccessResult(user, requestId)
    }

    return createErrorResult(new Error(`Route not found: ${method} ${path}`), requestId)
  } catch (err) {
    logger.warn('auth.error', 'Authentication failed', { requestId, err })
    return createErrorResult(err, requestId)
  }
}

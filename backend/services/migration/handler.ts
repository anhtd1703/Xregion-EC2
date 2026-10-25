import type { CreateMigrationRequest } from '@xregion/contracts'
import { createErrorResult, createSuccessResult } from '../../shared/http/response.js'
import type { ApiGatewayEvent, ApiGatewayResult } from '../../shared/http/types.js'
import { createLogger } from '../../shared/logging/logger.js'
import { MigrationService } from './service.js'

const logger = createLogger('migration-handler')
const migrationService = new MigrationService()

export async function handler(event: ApiGatewayEvent): Promise<ApiGatewayResult> {
  const requestId = event.requestContext?.requestId || 'req_migration'

  try {
    const path = event.path || ''
    const method = event.httpMethod.toUpperCase()
    const pathParams = event.pathParameters || {}
    const id = pathParams.id

    // GET /migrations
    if (method === 'GET' && (!id || path.endsWith('/migrations'))) {
      const list = await migrationService.listMigrations()
      return createSuccessResult(list, requestId)
    }

    // POST /migrations
    if (method === 'POST' && path.endsWith('/migrations')) {
      const payload: CreateMigrationRequest = event.body ? JSON.parse(event.body) : {}
      const created = await migrationService.createMigration(payload)
      return createSuccessResult(created, requestId, 201)
    }

    // GET /migrations/{id}
    if (method === 'GET' && id && !path.includes('/', path.indexOf(id) + id.length + 1)) {
      const m = await migrationService.getMigration(id)
      return createSuccessResult(m, requestId)
    }

    // POST /migrations/{id}/retry
    if (method === 'POST' && id && path.endsWith('/retry')) {
      const retried = await migrationService.retryMigration(id)
      return createSuccessResult(retried, requestId)
    }

    // POST /migrations/{id}/cancel
    if (method === 'POST' && id && path.endsWith('/cancel')) {
      const cancelled = await migrationService.cancelMigration(id)
      return createSuccessResult(cancelled, requestId)
    }

    return createErrorResult(new Error(`Route not found: ${method} ${path}`), requestId)
  } catch (err) {
    logger.error('migration.error', 'Migration request failed', { requestId, err })
    return createErrorResult(err, requestId)
  }
}

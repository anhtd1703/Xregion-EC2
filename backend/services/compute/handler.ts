import type { CreateInstanceRequest, ListInstancesQuery } from '@xregion/contracts'
import {
  createErrorResult,
  createPaginatedResult,
  createSuccessResult
} from '../../shared/http/response.js'
import type { ApiGatewayEvent, ApiGatewayResult } from '../../shared/http/types.js'
import { createLogger } from '../../shared/logging/logger.js'
import { ComputeService } from './service.js'

const logger = createLogger('compute-handler')
const computeService = new ComputeService()

export async function handler(event: ApiGatewayEvent): Promise<ApiGatewayResult> {
  const requestId = event.requestContext?.requestId || 'req_compute'

  try {
    const path = event.path || ''
    const method = event.httpMethod.toUpperCase()
    const pathParams = event.pathParameters || {}
    const id = pathParams.id

    // GET /instances
    if (method === 'GET' && (!id || path.endsWith('/instances'))) {
      const q: ListInstancesQuery = {
        region: event.queryStringParameters?.region as any,
        status: event.queryStringParameters?.status as any,
        search: event.queryStringParameters?.search,
        page: event.queryStringParameters?.page ? Number(event.queryStringParameters.page) : 1,
        pageSize: event.queryStringParameters?.pageSize
          ? Number(event.queryStringParameters.pageSize)
          : 20
      }
      const { items, total } = await computeService.listInstances(q)
      return createPaginatedResult(
        items,
        { page: q.page || 1, pageSize: q.pageSize || 20, total },
        requestId
      )
    }

    // POST /instances
    if (method === 'POST' && path.endsWith('/instances')) {
      const payload: CreateInstanceRequest = event.body ? JSON.parse(event.body) : {}
      const created = await computeService.createInstance(payload)
      return createSuccessResult(created, requestId, 201)
    }

    // GET /instances/{id}
    if (method === 'GET' && id && !path.includes('/', path.indexOf(id) + id.length + 1)) {
      const inst = await computeService.getInstance(id)
      return createSuccessResult(inst, requestId)
    }

    // Actions on /instances/{id}/start, stop, restart
    if (method === 'POST' && id && path.endsWith('/start')) {
      const res = await computeService.startInstance(id)
      return createSuccessResult(res, requestId)
    }

    if (method === 'POST' && id && path.endsWith('/stop')) {
      const res = await computeService.stopInstance(id)
      return createSuccessResult(res, requestId)
    }

    if (method === 'POST' && id && path.endsWith('/restart')) {
      const res = await computeService.restartInstance(id)
      return createSuccessResult(res, requestId)
    }

    // DELETE /instances/{id}
    if (method === 'DELETE' && id) {
      await computeService.deleteInstance(id)
      return createSuccessResult({ message: `Instance ${id} deleted` }, requestId)
    }

    return createErrorResult(new Error(`Route not found: ${method} ${path}`), requestId)
  } catch (err) {
    logger.error('compute.error', 'Request processing failed', { requestId, err })
    return createErrorResult(err, requestId)
  }
}

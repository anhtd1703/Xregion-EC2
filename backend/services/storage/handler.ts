import type { CopySnapshotRequest, CreateSnapshotRequest } from '@xregion/contracts'
import { createErrorResult, createSuccessResult } from '../../shared/http/response.js'
import type { ApiGatewayEvent, ApiGatewayResult } from '../../shared/http/types.js'
import { createLogger } from '../../shared/logging/logger.js'
import { StorageService } from './service.js'

const logger = createLogger('storage-handler')
const storageService = new StorageService()

export async function handler(event: ApiGatewayEvent): Promise<ApiGatewayResult> {
  const requestId = event.requestContext?.requestId || 'req_storage'

  try {
    const path = event.path || ''
    const method = event.httpMethod.toUpperCase()
    const pathParams = event.pathParameters || {}
    const id = pathParams.id

    // GET /snapshots
    if (method === 'GET' && (!id || path.endsWith('/snapshots'))) {
      const instanceId = event.queryStringParameters?.instanceId
      const items = await storageService.listSnapshots(instanceId)
      return createSuccessResult(items, requestId)
    }

    // POST /instances/{id}/snapshots or POST /snapshots
    if (method === 'POST' && path.endsWith('/snapshots')) {
      const payload: CreateSnapshotRequest = event.body ? JSON.parse(event.body) : {}
      const created = await storageService.createSnapshot(payload)
      return createSuccessResult(created, requestId, 201)
    }

    // POST /snapshots/{id}/copy
    if (method === 'POST' && id && path.endsWith('/copy')) {
      const payload: CopySnapshotRequest = event.body
        ? JSON.parse(event.body)
        : { destinationRegion: 'REGION_B' }
      const copied = await storageService.copySnapshot(id, payload)
      return createSuccessResult(copied, requestId)
    }

    // DELETE /snapshots/{id}
    if (method === 'DELETE' && id) {
      await storageService.deleteSnapshot(id)
      return createSuccessResult({ message: `Snapshot ${id} deleted` }, requestId)
    }

    return createErrorResult(new Error(`Route not found: ${method} ${path}`), requestId)
  } catch (err) {
    logger.error('storage.error', 'Storage request failed', { requestId, err })
    return createErrorResult(err, requestId)
  }
}

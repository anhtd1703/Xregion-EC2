import type {
  CopySnapshotRequest,
  CreateSnapshotRequest,
  RegionId,
  SnapshotStatus
} from '@xregion/contracts'
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

    // GET /images
    if (method === 'GET' && path.endsWith('/images')) {
      const images = await storageService.listImages()
      return createSuccessResult(images, requestId)
    }

    // GET /snapshots/{id}
    if (method === 'GET' && id && !path.endsWith('/snapshots')) {
      const snap = await storageService.getSnapshot(id)
      return createSuccessResult(snap, requestId)
    }

    // GET /snapshots
    if (method === 'GET' && (!id || path.endsWith('/snapshots'))) {
      const q = event.queryStringParameters || {}
      const items = await storageService.listSnapshots({
        instanceId: q.instanceId,
        region: q.region as RegionId | undefined,
        status: q.status as SnapshotStatus | undefined,
        search: q.search
      })
      return createSuccessResult(items, requestId)
    }

    // POST /instances/{id}/snapshots or POST /snapshots
    if (method === 'POST' && path.endsWith('/snapshots')) {
      const payload: CreateSnapshotRequest = event.body ? JSON.parse(event.body) : {}
      if (id && !payload.instanceId) {
        payload.instanceId = id
      }
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

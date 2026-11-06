import { StorageService } from '@xregion/backend'
import type { ApiSuccessResponse, CopySnapshotRequest, Snapshot } from '@xregion/contracts'

const storageService = new StorageService()

export default defineEventHandler(async (event): Promise<ApiSuccessResponse<Snapshot>> => {
  try {
    const id = getRouterParam(event, 'id')
    if (!id) {
      throw new Error('Snapshot ID is required')
    }

    const body = await readBody<CopySnapshotRequest>(event)
    const result = await storageService.copySnapshot(id, body)
    const requestId =
      event.node.req.headers['x-request-id']?.toString() || `req_snap_copy_${Date.now()}`

    return {
      success: true,
      data: result,
      meta: {
        requestId
      }
    }
  } catch (err) {
    return handleNitroError(event, err)
  }
})

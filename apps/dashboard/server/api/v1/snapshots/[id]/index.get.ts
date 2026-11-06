import { StorageService } from '@xregion/backend'
import type { ApiSuccessResponse, Snapshot } from '@xregion/contracts'

const storageService = new StorageService()

export default defineEventHandler(async (event): Promise<ApiSuccessResponse<Snapshot>> => {
  try {
    const id = getRouterParam(event, 'id')
    if (!id) {
      throw new Error('Snapshot ID is required')
    }

    const snapshot = await storageService.getSnapshot(id)
    const requestId =
      event.node.req.headers['x-request-id']?.toString() || `req_snap_detail_${Date.now()}`

    return {
      success: true,
      data: snapshot,
      meta: {
        requestId
      }
    }
  } catch (err) {
    return handleNitroError(event, err)
  }
})

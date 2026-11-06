import { StorageService } from '@xregion/backend'
import type { ApiSuccessResponse, CreateSnapshotRequest, Snapshot } from '@xregion/contracts'

const storageService = new StorageService()

export default defineEventHandler(async (event): Promise<ApiSuccessResponse<Snapshot>> => {
  try {
    const body = await readBody<CreateSnapshotRequest>(event)
    const result = await storageService.createSnapshot(body)
    const requestId =
      event.node.req.headers['x-request-id']?.toString() || `req_snap_create_${Date.now()}`

    setResponseStatus(event, 201)
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

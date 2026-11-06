import { StorageService } from '@xregion/backend'
import type { ApiSuccessResponse, CreateSnapshotRequest, Snapshot } from '@xregion/contracts'

const storageService = new StorageService()

export default defineEventHandler(async (event): Promise<ApiSuccessResponse<Snapshot>> => {
  try {
    const instanceId = getRouterParam(event, 'id')
    if (!instanceId) {
      throw new Error('Instance ID is required in URL path')
    }

    const body = (await readBody<Partial<CreateSnapshotRequest>>(event)) || {}
    const payload: CreateSnapshotRequest = {
      ...body,
      instanceId
    }

    const result = await storageService.createSnapshot(payload)
    const requestId =
      event.node.req.headers['x-request-id']?.toString() || `req_inst_snap_create_${Date.now()}`

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

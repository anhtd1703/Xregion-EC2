import { StorageService } from '@xregion/backend'
import type { ApiSuccessResponse } from '@xregion/contracts'

const storageService = new StorageService()

export default defineEventHandler(
  async (event): Promise<ApiSuccessResponse<{ snapshotId: string; deleted: boolean }>> => {
    try {
      const id = getRouterParam(event, 'id')
      if (!id) {
        throw new Error('Snapshot ID is required')
      }

      await storageService.deleteSnapshot(id)
      const requestId =
        event.node.req.headers['x-request-id']?.toString() || `req_snap_delete_${Date.now()}`

      return {
        success: true,
        data: {
          snapshotId: id,
          deleted: true
        },
        meta: {
          requestId
        }
      }
    } catch (err) {
      return handleNitroError(event, err)
    }
  }
)

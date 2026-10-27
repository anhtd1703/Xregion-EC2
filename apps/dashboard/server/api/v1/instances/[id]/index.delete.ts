import { ComputeService } from '@xregion/backend'
import type { ApiSuccessResponse } from '@xregion/contracts'

const computeService = new ComputeService()

export default defineEventHandler(
  async (event): Promise<ApiSuccessResponse<{ instanceId: string; deleted: boolean }>> => {
    try {
      const id = getRouterParam(event, 'id')
      if (!id) {
        throw new Error('Instance ID is required')
      }

      await computeService.deleteInstance(id)
      const requestId =
        event.node.req.headers['x-request-id']?.toString() || `req_inst_delete_${Date.now()}`

      return {
        success: true,
        data: {
          instanceId: id,
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

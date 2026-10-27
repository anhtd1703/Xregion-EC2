import { ComputeService } from '@xregion/backend'
import type { ApiSuccessResponse, InstanceActionResponse } from '@xregion/contracts'

const computeService = new ComputeService()

export default defineEventHandler(
  async (event): Promise<ApiSuccessResponse<InstanceActionResponse>> => {
    try {
      const id = getRouterParam(event, 'id')
      if (!id) {
        throw new Error('Instance ID is required')
      }

      const result = await computeService.restartInstance(id)
      const requestId =
        event.node.req.headers['x-request-id']?.toString() || `req_inst_restart_${Date.now()}`

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
  }
)

import { ComputeService } from '@xregion/backend'
import type { ApiSuccessResponse, Instance } from '@xregion/contracts'

const computeService = new ComputeService()

export default defineEventHandler(async (event): Promise<ApiSuccessResponse<Instance>> => {
  try {
    const id = getRouterParam(event, 'id')
    if (!id) {
      throw new Error('Instance ID is required')
    }

    const instance = await computeService.getInstance(id)
    const requestId =
      event.node.req.headers['x-request-id']?.toString() || `req_inst_get_${Date.now()}`

    return {
      success: true,
      data: instance,
      meta: {
        requestId
      }
    }
  } catch (err) {
    return handleNitroError(event, err)
  }
})

import { ComputeService } from '@xregion/backend'
import type { ApiSuccessResponse, CreateInstanceRequest, Instance } from '@xregion/contracts'

const computeService = new ComputeService()

export default defineEventHandler(async (event): Promise<ApiSuccessResponse<Instance>> => {
  try {
    const body = await readBody<CreateInstanceRequest>(event)
    const result = await computeService.createInstance(body)
    const requestId =
      event.node.req.headers['x-request-id']?.toString() || `req_inst_create_${Date.now()}`

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

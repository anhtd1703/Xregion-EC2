import { AuthService } from '@xregion/backend'
import type { ApiSuccessResponse, LoginRequest, LoginResponse } from '@xregion/contracts'

const authService = new AuthService()

export default defineEventHandler(async (event): Promise<ApiSuccessResponse<LoginResponse>> => {
  const body = await readBody<LoginRequest>(event)
  const result = await authService.login(body)
  const requestId = event.node.req.headers['x-request-id']?.toString() || `req_auth_${Date.now()}`

  return {
    success: true,
    data: result,
    meta: {
      requestId
    }
  }
})

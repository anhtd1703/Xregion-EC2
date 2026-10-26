import { AuthService } from '@xregion/backend'
import type { ApiSuccessResponse, UserProfile } from '@xregion/contracts'

const authService = new AuthService()

export default defineEventHandler(async (event): Promise<ApiSuccessResponse<UserProfile>> => {
  const authHeader = getHeader(event, 'authorization')
  const token = authHeader?.replace('Bearer ', '') || 'mock-admin-token'
  const user = await authService.getCurrentUser(token)
  const requestId = event.node.req.headers['x-request-id']?.toString() || `req_me_${Date.now()}`

  return {
    success: true,
    data: user,
    meta: {
      requestId
    }
  }
})

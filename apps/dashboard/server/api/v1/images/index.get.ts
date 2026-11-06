import { StorageService } from '@xregion/backend'
import type { ApiSuccessResponse, OsImage } from '@xregion/contracts'

const storageService = new StorageService()

export default defineEventHandler(async (event): Promise<ApiSuccessResponse<OsImage[]>> => {
  try {
    const images = await storageService.listImages()
    const requestId =
      event.node.req.headers['x-request-id']?.toString() || `req_images_${Date.now()}`

    return {
      success: true,
      data: images,
      meta: {
        requestId
      }
    }
  } catch (err) {
    return handleNitroError(event, err)
  }
})

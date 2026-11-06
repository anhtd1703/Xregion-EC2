import { StorageService } from '@xregion/backend'
import type { PaginatedResponse, RegionId, Snapshot, SnapshotStatus } from '@xregion/contracts'

const storageService = new StorageService()

export default defineEventHandler(async (event): Promise<PaginatedResponse<Snapshot>> => {
  try {
    const query = getQuery(event)
    const page = query.page ? Number(query.page) : 1
    const pageSize = query.pageSize ? Number(query.pageSize) : 50
    const region = query.region ? (query.region.toString() as RegionId) : undefined
    const status = query.status ? (query.status.toString() as SnapshotStatus) : undefined
    const search = query.search?.toString()
    const instanceId = query.instanceId?.toString()

    const all = await storageService.listSnapshots({
      instanceId,
      region,
      status,
      search
    })

    const total = all.length
    const start = (page - 1) * pageSize
    const items = all.slice(start, start + pageSize)

    const requestId = event.node.req.headers['x-request-id']?.toString() || `req_snap_${Date.now()}`

    return {
      success: true,
      data: items,
      meta: {
        requestId,
        page,
        pageSize,
        total
      }
    }
  } catch (err) {
    return handleNitroError(event, err)
  }
})

import { ComputeService } from '@xregion/backend'
import type { Instance, InstanceStatus, PaginatedResponse, RegionId } from '@xregion/contracts'

const computeService = new ComputeService()

export default defineEventHandler(async (event): Promise<PaginatedResponse<Instance>> => {
  const query = getQuery(event)
  const page = query.page ? Number(query.page) : 1
  const pageSize = query.pageSize ? Number(query.pageSize) : 20
  const region = query.region ? (query.region.toString() as RegionId) : undefined
  const status = query.status ? (query.status.toString() as InstanceStatus) : undefined
  const search = query.search?.toString()

  const { items, total } = await computeService.listInstances({
    page,
    pageSize,
    region,
    status,
    search
  })

  const requestId = event.node.req.headers['x-request-id']?.toString() || `req_inst_${Date.now()}`

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
})

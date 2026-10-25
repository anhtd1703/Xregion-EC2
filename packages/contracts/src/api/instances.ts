import type { InstanceStatus, RegionId } from '../models/instance.js'
import type { PaginationQuery } from './envelope.js'

export interface ListInstancesQuery extends PaginationQuery {
  search?: string
  status?: InstanceStatus
  region?: RegionId
}

export interface CreateInstanceRequest {
  name: string
  region: RegionId
  imageId: string
  vcpu: number
  memoryMb: number
  diskGb: number
}

export interface InstanceActionResponse {
  instanceId: string
  status: InstanceStatus
  message: string
}

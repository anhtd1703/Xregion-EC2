import type { CreateInstanceRequest, Instance, InstanceStatus, RegionId } from '@xregion/contracts'

export interface ListInstancesFilters {
  region?: RegionId
  status?: InstanceStatus
  search?: string
}

export interface ComputeProvider {
  listInstances(filters?: ListInstancesFilters): Promise<Instance[]>
  getInstance(id: string): Promise<Instance>
  createInstance(input: CreateInstanceRequest): Promise<Instance>
  startInstance(id: string): Promise<void>
  stopInstance(id: string): Promise<void>
  restartInstance(id: string): Promise<void>
  deleteInstance(id: string): Promise<void>
}

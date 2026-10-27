import type {
  CreateInstanceRequest,
  Instance,
  InstanceActionResponse,
  InstanceStatus,
  RegionId
} from '@xregion/contracts'
import { useApi } from './useApi.js'

export interface ListInstancesFilterParams {
  region?: RegionId | 'ALL'
  status?: InstanceStatus | 'ALL'
  search?: string
  page?: number
  pageSize?: number
}

export function useInstancesApi() {
  const api = useApi()

  async function listInstances(params?: ListInstancesFilterParams) {
    const query: Record<string, string | number | boolean | undefined> = {}
    if (params?.region && params.region !== 'ALL') {
      query.region = params.region
    }
    if (params?.status && params.status !== 'ALL') {
      query.status = params.status
    }
    if (params?.search?.trim()) {
      query.search = params.search.trim()
    }
    if (params?.page) {
      query.page = params.page
    }
    if (params?.pageSize) {
      query.pageSize = params.pageSize
    }

    return api.get<Instance[]>('/instances', query)
  }

  async function getInstance(id: string) {
    return api.get<Instance>(`/instances/${id}`)
  }

  async function createInstance(payload: CreateInstanceRequest) {
    return api.post<Instance>('/instances', payload)
  }

  async function startInstance(id: string) {
    return api.post<InstanceActionResponse>(`/instances/${id}/start`)
  }

  async function stopInstance(id: string) {
    return api.post<InstanceActionResponse>(`/instances/${id}/stop`)
  }

  async function restartInstance(id: string) {
    return api.post<InstanceActionResponse>(`/instances/${id}/restart`)
  }

  async function deleteInstance(id: string) {
    return api.delete<{ instanceId: string; deleted: boolean }>(`/instances/${id}`)
  }

  return {
    listInstances,
    getInstance,
    createInstance,
    startInstance,
    stopInstance,
    restartInstance,
    deleteInstance
  }
}

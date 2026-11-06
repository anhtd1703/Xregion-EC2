import type {
  CopySnapshotRequest,
  CreateSnapshotRequest,
  RegionId,
  Snapshot,
  SnapshotStatus
} from '@xregion/contracts'
import { useApi } from './useApi.js'

export interface ListSnapshotsFilterParams {
  instanceId?: string
  region?: RegionId | 'ALL'
  status?: SnapshotStatus | 'ALL'
  search?: string
  page?: number
  pageSize?: number
}

export function useSnapshotsApi() {
  const api = useApi()

  async function listSnapshots(params?: ListSnapshotsFilterParams): Promise<Snapshot[]> {
    const query: Record<string, string | number | boolean | undefined> = {}
    if (params?.instanceId) {
      query.instanceId = params.instanceId
    }
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

    return api.get<Snapshot[]>('/snapshots', query)
  }

  async function getSnapshot(id: string): Promise<Snapshot> {
    return api.get<Snapshot>(`/snapshots/${id}`)
  }

  async function createSnapshot(payload: CreateSnapshotRequest): Promise<Snapshot> {
    return api.post<Snapshot>('/snapshots', payload)
  }

  async function createInstanceSnapshot(
    instanceId: string,
    payload?: { name?: string; description?: string }
  ): Promise<Snapshot> {
    return api.post<Snapshot>(`/instances/${instanceId}/snapshots`, payload || {})
  }

  async function copySnapshot(id: string, destinationRegion: RegionId): Promise<Snapshot> {
    const payload: CopySnapshotRequest = { destinationRegion }
    return api.post<Snapshot>(`/snapshots/${id}/copy`, payload)
  }

  async function deleteSnapshot(id: string): Promise<{ snapshotId: string; deleted: boolean }> {
    return api.delete<{ snapshotId: string; deleted: boolean }>(`/snapshots/${id}`)
  }

  return {
    listSnapshots,
    getSnapshot,
    createSnapshot,
    createInstanceSnapshot,
    copySnapshot,
    deleteSnapshot
  }
}

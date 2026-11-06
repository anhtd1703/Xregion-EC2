import type { RegionId } from '../models/instance.js'
import type { SnapshotStatus } from '../models/snapshot.js'

export interface CreateSnapshotRequest {
  instanceId: string
  name?: string
  description?: string
}

export interface CopySnapshotRequest {
  destinationRegion: RegionId
}

export interface ListSnapshotsQuery {
  instanceId?: string
  region?: RegionId
  status?: SnapshotStatus
  search?: string
  page?: number
  pageSize?: number
}

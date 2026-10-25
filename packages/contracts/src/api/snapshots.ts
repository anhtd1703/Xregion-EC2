import type { RegionId } from '../models/instance.js'

export interface CreateSnapshotRequest {
  instanceId: string
  name?: string
  description?: string
}

export interface CopySnapshotRequest {
  destinationRegion: RegionId
}

import type { OsImage, RegionId, Snapshot, SnapshotStatus } from '@xregion/contracts'

export interface CreateSnapshotParams {
  instanceId: string
  name?: string
  description?: string
  sizeGb?: number
  region?: RegionId
  instanceName?: string
}

export interface ListSnapshotsFilters {
  instanceId?: string
  region?: RegionId
  status?: SnapshotStatus
  search?: string
}

export interface SnapshotProvider {
  listImages(): Promise<OsImage[]>
  listSnapshots(filters?: ListSnapshotsFilters | string): Promise<Snapshot[]>
  getSnapshot(id: string): Promise<Snapshot>
  createSnapshot(params: CreateSnapshotParams | string, sizeGb?: number): Promise<Snapshot>
  copySnapshot(snapshotId: string, destinationRegion: RegionId): Promise<Snapshot>
  deleteSnapshot(id: string): Promise<void>
}

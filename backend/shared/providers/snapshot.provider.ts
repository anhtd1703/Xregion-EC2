import type { RegionId, Snapshot } from '@xregion/contracts'

export interface SnapshotProvider {
  listSnapshots(instanceId?: string): Promise<Snapshot[]>
  getSnapshot(id: string): Promise<Snapshot>
  createSnapshot(instanceId: string, sizeGb?: number): Promise<Snapshot>
  copySnapshot(snapshotId: string, destinationRegion: RegionId): Promise<Snapshot>
  deleteSnapshot(id: string): Promise<void>
}

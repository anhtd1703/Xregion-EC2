import type { RegionId } from './instance.js'

export type SnapshotStatus = 'CREATING' | 'AVAILABLE' | 'COPYING' | 'ERROR' | 'DELETING'

export interface Snapshot {
  id: string
  instanceId: string
  status: SnapshotStatus

  sourceRegion: RegionId
  copiedRegions: RegionId[]

  sizeGb: number

  createdAt: string
  updatedAt: string
}

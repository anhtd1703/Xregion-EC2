import type { RegionId } from './instance.js'

export type SnapshotStatus = 'CREATING' | 'AVAILABLE' | 'COPYING' | 'ERROR' | 'DELETING'

export interface Snapshot {
  id: string
  name: string
  instanceId: string
  instanceName?: string
  status: SnapshotStatus

  /** The physical region where this snapshot copy resides */
  region: RegionId
  /** The originating region where the snapshot was first captured */
  sourceRegion: RegionId
  /** Destination regions to which this snapshot has been replicated */
  copiedRegions: RegionId[]

  /** Originating snapshot ID if this snapshot was created by cross-region copy */
  copiedFromSnapshotId?: string

  sizeGb: number
  description?: string

  createdAt: string
  updatedAt: string
}

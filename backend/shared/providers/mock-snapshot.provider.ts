import {
  DEFAULT_OS_IMAGES,
  ErrorCode,
  type OsImage,
  type RegionId,
  type Snapshot
} from '@xregion/contracts'
import { InvalidStateError, NotFoundError, ValidationError } from '../errors/app-error.js'
import type {
  CreateSnapshotParams,
  ListSnapshotsFilters,
  SnapshotProvider
} from './snapshot.provider.js'

export class MockSnapshotProvider implements SnapshotProvider {
  private snapshots: Map<string, Snapshot> = new Map()

  constructor() {
    this.seed()
  }

  private seed(): void {
    const defaults: Snapshot[] = [
      {
        id: 'snap-001',
        name: 'snap-web-api-prod',
        instanceId: 'vm-prod-01',
        instanceName: 'web-api-gateway',
        status: 'AVAILABLE',
        region: 'REGION_A',
        sourceRegion: 'REGION_A',
        copiedRegions: ['REGION_B'],
        sizeGb: 50,
        description: 'Production baseline snapshot before cutover',
        createdAt: '2026-03-15T02:00:00Z',
        updatedAt: '2026-03-15T02:10:00Z'
      },
      {
        id: 'snap-001-copy-va',
        name: 'snap-web-api-prod-dr-replica',
        instanceId: 'vm-prod-01',
        instanceName: 'web-api-gateway',
        status: 'AVAILABLE',
        region: 'REGION_B',
        sourceRegion: 'REGION_A',
        copiedRegions: [],
        copiedFromSnapshotId: 'snap-001',
        sizeGb: 50,
        description: 'Replicated DR snapshot in us-east-1',
        createdAt: '2026-03-15T02:30:00Z',
        updatedAt: '2026-03-15T02:45:00Z'
      },
      {
        id: 'snap-002',
        name: 'snap-payment-proc-pre-update',
        instanceId: 'vm-prod-02',
        instanceName: 'payment-processor',
        status: 'AVAILABLE',
        region: 'REGION_A',
        sourceRegion: 'REGION_A',
        copiedRegions: [],
        sizeGb: 30,
        description: 'Pre-maintenance point-in-time image',
        createdAt: '2026-03-16T02:00:00Z',
        updatedAt: '2026-03-16T02:05:00Z'
      },
      {
        id: 'snap-003',
        name: 'snap-reporting-worker-b',
        instanceId: 'vm-prod-06',
        instanceName: 'reporting-microservice',
        status: 'AVAILABLE',
        region: 'REGION_B',
        sourceRegion: 'REGION_B',
        copiedRegions: [],
        sizeGb: 80,
        description: 'Secondary region reporting volume snapshot',
        createdAt: '2026-03-18T04:00:00Z',
        updatedAt: '2026-03-18T04:10:00Z'
      }
    ]

    for (const s of defaults) {
      this.snapshots.set(s.id, { ...s })
    }
  }

  async listImages(): Promise<OsImage[]> {
    return [...DEFAULT_OS_IMAGES]
  }

  async listSnapshots(filters?: ListSnapshotsFilters | string): Promise<Snapshot[]> {
    let list = Array.from(this.snapshots.values())

    if (typeof filters === 'string') {
      return list.filter((s) => s.instanceId === filters)
    }

    if (!filters) {
      return list
    }

    if (filters.instanceId) {
      list = list.filter((s) => s.instanceId === filters.instanceId)
    }

    if (filters.region && filters.region !== ('ALL' as RegionId)) {
      list = list.filter((s) => s.region === filters.region)
    }

    if (filters.status && filters.status !== ('ALL' as string)) {
      list = list.filter((s) => s.status === filters.status)
    }

    if (filters.search?.trim()) {
      const q = filters.search.trim().toLowerCase()
      list = list.filter(
        (s) =>
          s.name.toLowerCase().includes(q) ||
          s.id.toLowerCase().includes(q) ||
          s.instanceId.toLowerCase().includes(q) ||
          (s.instanceName && s.instanceName.toLowerCase().includes(q)) ||
          (s.description && s.description.toLowerCase().includes(q))
      )
    }

    return list
  }

  async getSnapshot(id: string): Promise<Snapshot> {
    const s = this.snapshots.get(id)
    if (!s) {
      throw new NotFoundError(`Snapshot ${id} not found`, ErrorCode.SNAPSHOT_NOT_FOUND)
    }
    return { ...s }
  }

  async createSnapshot(params: CreateSnapshotParams | string, sizeGb = 40): Promise<Snapshot> {
    const p: CreateSnapshotParams =
      typeof params === 'string' ? { instanceId: params, sizeGb } : params
    const id = `snap-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`
    const snapRegion = p.region || 'REGION_A'
    const name = p.name?.trim() || `snap-${p.instanceId}-${Date.now().toString(36)}`

    const snap: Snapshot = {
      id,
      name,
      instanceId: p.instanceId,
      instanceName: p.instanceName,
      status: 'AVAILABLE',
      region: snapRegion,
      sourceRegion: snapRegion,
      copiedRegions: [],
      sizeGb: p.sizeGb ?? sizeGb,
      description: p.description?.trim(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
    this.snapshots.set(id, snap)
    return { ...snap }
  }

  async copySnapshot(snapshotId: string, destinationRegion: RegionId): Promise<Snapshot> {
    const sourceSnap = await this.getSnapshot(snapshotId)

    if (sourceSnap.status !== 'AVAILABLE') {
      throw new InvalidStateError(
        `Cannot copy snapshot ${snapshotId}: current status is ${sourceSnap.status}. Only AVAILABLE snapshots can be copied.`,
        ErrorCode.SNAPSHOT_COPY_FAILED
      )
    }

    if (destinationRegion !== 'REGION_A' && destinationRegion !== 'REGION_B') {
      throw new ValidationError(`Invalid destination region: ${destinationRegion}`)
    }

    if (sourceSnap.region === destinationRegion) {
      throw new ValidationError(
        `Destination region (${destinationRegion}) must be different from source snapshot region (${sourceSnap.region})`
      )
    }

    // Update source snapshot's copiedRegions without modifying its region or ID
    if (!sourceSnap.copiedRegions.includes(destinationRegion)) {
      sourceSnap.copiedRegions.push(destinationRegion)
    }
    sourceSnap.updatedAt = new Date().toISOString()
    this.snapshots.set(snapshotId, sourceSnap)

    // Create a NEW destination snapshot with its own unique ID and destination region
    const suffix = destinationRegion === 'REGION_A' ? 'sg' : 'va'
    const newId = `snap-copy-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`
    const newName = `${sourceSnap.name || sourceSnap.id}-copy-${suffix}`

    const copiedSnap: Snapshot = {
      id: newId,
      name: newName,
      instanceId: sourceSnap.instanceId,
      instanceName: sourceSnap.instanceName,
      status: 'AVAILABLE',
      region: destinationRegion,
      sourceRegion: sourceSnap.sourceRegion,
      copiedRegions: [],
      copiedFromSnapshotId: sourceSnap.id,
      sizeGb: sourceSnap.sizeGb,
      description: `Cross-region replica of ${sourceSnap.id} in ${
        destinationRegion === 'REGION_A' ? 'ap-southeast-1' : 'us-east-1'
      }`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }

    this.snapshots.set(newId, copiedSnap)
    return { ...copiedSnap }
  }

  async deleteSnapshot(id: string): Promise<void> {
    const existing = this.snapshots.get(id)
    if (!existing) {
      throw new NotFoundError(`Snapshot ${id} not found`, ErrorCode.SNAPSHOT_NOT_FOUND)
    }

    if (
      existing.status === 'COPYING' ||
      existing.status === 'CREATING' ||
      existing.status === 'DELETING'
    ) {
      throw new InvalidStateError(
        `Cannot delete snapshot ${id} while in ${existing.status} status`,
        ErrorCode.INSTANCE_INVALID_STATE
      )
    }

    this.snapshots.delete(id)
  }
}

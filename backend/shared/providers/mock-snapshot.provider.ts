import type { RegionId, Snapshot } from '@xregion/contracts'
import { NotFoundError } from '../errors/app-error.js'
import type { SnapshotProvider } from './snapshot.provider.js'

export class MockSnapshotProvider implements SnapshotProvider {
  private snapshots: Map<string, Snapshot> = new Map()

  constructor() {
    this.seed()
  }

  private seed(): void {
    const defaults: Snapshot[] = [
      {
        id: 'snap-001',
        instanceId: 'vm-prod-01',
        status: 'AVAILABLE',
        sourceRegion: 'REGION_A',
        copiedRegions: ['REGION_B'],
        sizeGb: 50,
        createdAt: '2026-03-15T02:00:00Z',
        updatedAt: '2026-03-15T02:10:00Z'
      },
      {
        id: 'snap-002',
        instanceId: 'vm-prod-02',
        status: 'AVAILABLE',
        sourceRegion: 'REGION_A',
        copiedRegions: [],
        sizeGb: 30,
        createdAt: '2026-03-16T02:00:00Z',
        updatedAt: '2026-03-16T02:05:00Z'
      }
    ]

    for (const s of defaults) {
      this.snapshots.set(s.id, { ...s })
    }
  }

  async listSnapshots(instanceId?: string): Promise<Snapshot[]> {
    const list = Array.from(this.snapshots.values())
    if (instanceId) {
      return list.filter((s) => s.instanceId === instanceId)
    }
    return list
  }

  async getSnapshot(id: string): Promise<Snapshot> {
    const s = this.snapshots.get(id)
    if (!s) {
      throw new NotFoundError(`Snapshot ${id} not found`)
    }
    return { ...s }
  }

  async createSnapshot(instanceId: string, sizeGb = 40): Promise<Snapshot> {
    const id = `snap-${Date.now().toString(36)}`
    const snap: Snapshot = {
      id,
      instanceId,
      status: 'AVAILABLE',
      sourceRegion: 'REGION_A',
      copiedRegions: [],
      sizeGb,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
    this.snapshots.set(id, snap)
    return { ...snap }
  }

  async copySnapshot(snapshotId: string, destinationRegion: RegionId): Promise<Snapshot> {
    const snap = await this.getSnapshot(snapshotId)
    if (!snap.copiedRegions.includes(destinationRegion)) {
      snap.copiedRegions.push(destinationRegion)
    }
    snap.updatedAt = new Date().toISOString()
    this.snapshots.set(snapshotId, snap)
    return { ...snap }
  }

  async deleteSnapshot(id: string): Promise<void> {
    if (!this.snapshots.has(id)) {
      throw new NotFoundError(`Snapshot ${id} not found`)
    }
    this.snapshots.delete(id)
  }
}

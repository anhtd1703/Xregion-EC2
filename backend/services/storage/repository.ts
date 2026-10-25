import type { RegionId, Snapshot } from '@xregion/contracts'
import type { SnapshotProvider } from '../../shared/providers/snapshot.provider.js'
import { getSnapshotProvider } from '../../shared/providers/provider-factory.js'

export class StorageRepository {
  private get provider(): SnapshotProvider {
    return getSnapshotProvider()
  }

  async list(instanceId?: string): Promise<Snapshot[]> {
    return this.provider.listSnapshots(instanceId)
  }

  async findById(id: string): Promise<Snapshot> {
    return this.provider.getSnapshot(id)
  }

  async create(instanceId: string, sizeGb?: number): Promise<Snapshot> {
    return this.provider.createSnapshot(instanceId, sizeGb)
  }

  async copy(id: string, destinationRegion: RegionId): Promise<Snapshot> {
    return this.provider.copySnapshot(id, destinationRegion)
  }

  async delete(id: string): Promise<void> {
    return this.provider.deleteSnapshot(id)
  }
}

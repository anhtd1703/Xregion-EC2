import type { OsImage, RegionId, Snapshot } from '@xregion/contracts'
import { getSnapshotProvider } from '../../shared/providers/provider-factory.js'
import type {
  CreateSnapshotParams,
  ListSnapshotsFilters,
  SnapshotProvider
} from '../../shared/providers/snapshot.provider.js'

export class StorageRepository {
  private get provider(): SnapshotProvider {
    return getSnapshotProvider()
  }

  async listImages(): Promise<OsImage[]> {
    return this.provider.listImages()
  }

  async list(filters?: ListSnapshotsFilters | string): Promise<Snapshot[]> {
    return this.provider.listSnapshots(filters)
  }

  async findById(id: string): Promise<Snapshot> {
    return this.provider.getSnapshot(id)
  }

  async create(params: CreateSnapshotParams | string, sizeGb?: number): Promise<Snapshot> {
    return this.provider.createSnapshot(params, sizeGb)
  }

  async copy(id: string, destinationRegion: RegionId): Promise<Snapshot> {
    return this.provider.copySnapshot(id, destinationRegion)
  }

  async delete(id: string): Promise<void> {
    return this.provider.deleteSnapshot(id)
  }
}

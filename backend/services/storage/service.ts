import type { CopySnapshotRequest, CreateSnapshotRequest, Snapshot } from '@xregion/contracts'
import { ValidationError } from '../../shared/errors/app-error.js'
import { createLogger } from '../../shared/logging/logger.js'
import { StorageRepository } from './repository.js'

export class StorageService {
  private repository: StorageRepository
  private logger = createLogger('storage-service')

  constructor(repository = new StorageRepository()) {
    this.repository = repository
  }

  async listSnapshots(instanceId?: string): Promise<Snapshot[]> {
    return this.repository.list(instanceId)
  }

  async getSnapshot(id: string): Promise<Snapshot> {
    if (!id) throw new ValidationError('Snapshot ID is required')
    return this.repository.findById(id)
  }

  async createSnapshot(input: CreateSnapshotRequest): Promise<Snapshot> {
    if (!input.instanceId) throw new ValidationError('instanceId is required')
    const created = await this.repository.create(input.instanceId)
    this.logger.info('storage.snapshot.created', `Snapshot created ${created.id}`, {
      snapshotId: created.id,
      instanceId: created.instanceId
    })
    return created
  }

  async copySnapshot(id: string, input: CopySnapshotRequest): Promise<Snapshot> {
    if (!input.destinationRegion) {
      throw new ValidationError('destinationRegion is required')
    }
    const copied = await this.repository.copy(id, input.destinationRegion)
    this.logger.info(
      'storage.snapshot.copied',
      `Snapshot ${id} copied to ${input.destinationRegion}`,
      {
        snapshotId: id,
        destinationRegion: input.destinationRegion
      }
    )
    return copied
  }

  async deleteSnapshot(id: string): Promise<void> {
    await this.repository.delete(id)
    this.logger.info('storage.snapshot.deleted', `Snapshot deleted ${id}`, {
      snapshotId: id
    })
  }
}

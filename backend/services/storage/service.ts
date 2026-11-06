import type {
  CopySnapshotRequest,
  CreateSnapshotRequest,
  ListSnapshotsQuery,
  OsImage,
  Snapshot
} from '@xregion/contracts'
import { InvalidStateError, ValidationError } from '../../shared/errors/app-error.js'
import { createLogger } from '../../shared/logging/logger.js'
import { ComputeService } from '../compute/service.js'
import { StorageRepository } from './repository.js'

export class StorageService {
  private repository: StorageRepository
  private computeService: ComputeService
  private logger = createLogger('storage-service')

  constructor(repository = new StorageRepository(), computeService = new ComputeService()) {
    this.repository = repository
    this.computeService = computeService
  }

  async listImages(): Promise<OsImage[]> {
    return this.repository.listImages()
  }

  async listSnapshots(query?: ListSnapshotsQuery | string): Promise<Snapshot[]> {
    return this.repository.list(query)
  }

  async getSnapshot(id: string): Promise<Snapshot> {
    if (!id || !id.trim()) {
      throw new ValidationError('Snapshot ID is required')
    }
    return this.repository.findById(id.trim())
  }

  async createSnapshot(input: CreateSnapshotRequest): Promise<Snapshot> {
    if (!input || !input.instanceId?.trim()) {
      throw new ValidationError('instanceId is required')
    }

    const instanceId = input.instanceId.trim()
    // Verify source instance exists in authoritative compute state
    const instance = await this.computeService.getInstance(instanceId)

    if (instance.status === 'DELETING') {
      throw new InvalidStateError(
        `Cannot create snapshot for instance ${instanceId}: instance is currently DELETING`
      )
    }

    const name = input.name?.trim() || `${instance.name}-snap-${Date.now().toString(36)}`

    const created = await this.repository.create({
      instanceId: instance.id,
      instanceName: instance.name,
      name,
      description: input.description?.trim(),
      region: instance.region,
      sizeGb: instance.diskGb
    })

    this.logger.info('storage.snapshot.created', `Snapshot created ${created.id}`, {
      snapshotId: created.id,
      instanceId: created.instanceId,
      region: created.region,
      sizeGb: created.sizeGb
    })

    return created
  }

  async copySnapshot(id: string, input: CopySnapshotRequest): Promise<Snapshot> {
    if (!id || !id.trim()) {
      throw new ValidationError('Snapshot ID is required')
    }
    if (!input || !input.destinationRegion) {
      throw new ValidationError('destinationRegion is required')
    }

    const copied = await this.repository.copy(id.trim(), input.destinationRegion)
    this.logger.info(
      'storage.snapshot.copied',
      `Snapshot ${id} copied to destination region ${input.destinationRegion}`,
      {
        sourceSnapshotId: id,
        copiedSnapshotId: copied.id,
        destinationRegion: input.destinationRegion
      }
    )
    return copied
  }

  async deleteSnapshot(id: string): Promise<void> {
    if (!id || !id.trim()) {
      throw new ValidationError('Snapshot ID is required')
    }
    await this.repository.delete(id.trim())
    this.logger.info('storage.snapshot.deleted', `Snapshot deleted ${id}`, {
      snapshotId: id
    })
  }
}

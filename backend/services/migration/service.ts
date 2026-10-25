import type { CreateMigrationRequest, Migration } from '@xregion/contracts'
import { ConflictError, ValidationError } from '../../shared/errors/app-error.js'
import { createLogger } from '../../shared/logging/logger.js'
import { getComputeProvider } from '../../shared/providers/provider-factory.js'
import { MigrationRepository } from './repository.js'
import { MigrationRollbackManager } from './rollback.js'

export class MigrationService {
  private repository: MigrationRepository
  private rollbackManager: MigrationRollbackManager
  private logger = createLogger('migration-service')

  constructor(
    repository = new MigrationRepository(),
    rollbackManager = new MigrationRollbackManager()
  ) {
    this.repository = repository
    this.rollbackManager = rollbackManager
  }

  async listMigrations(): Promise<Migration[]> {
    return this.repository.list()
  }

  async getMigration(id: string): Promise<Migration> {
    if (!id) throw new ValidationError('Migration ID is required')
    return this.repository.findById(id)
  }

  async createMigration(input: CreateMigrationRequest): Promise<Migration> {
    if (!input.instanceId || !input.destinationRegion) {
      throw new ValidationError('instanceId and destinationRegion are required')
    }

    const compute = getComputeProvider()
    const instance = await compute.getInstance(input.instanceId)

    if (instance.region === input.destinationRegion) {
      throw new ValidationError('Source and destination regions cannot be identical')
    }

    // Check if an active migration already exists for this instance
    const all = await this.repository.list()
    const active = all.find(
      (m) =>
        m.instanceId === input.instanceId &&
        (m.status === 'PENDING' || m.status === 'IN_PROGRESS' || m.status === 'ROLLING_BACK')
    )
    if (active) {
      throw new ConflictError(
        `Migration ${active.id} is already active for instance ${input.instanceId}`
      )
    }

    const migration = await this.repository.create(input, instance.region)
    this.logger.info('migration.created', `Migration created ${migration.id}`, {
      migrationId: migration.id,
      instanceId: migration.instanceId,
      sourceRegion: migration.sourceRegion,
      destinationRegion: migration.destinationRegion
    })

    return migration
  }

  async retryMigration(id: string): Promise<Migration> {
    const existing = await this.getMigration(id)
    if (existing.status !== 'FAILED') {
      throw new ValidationError(`Cannot retry migration in status ${existing.status}`)
    }

    existing.status = 'IN_PROGRESS'
    existing.error = undefined
    return this.repository.save(existing)
  }

  async cancelMigration(id: string): Promise<Migration> {
    const existing = await this.getMigration(id)
    if (existing.status !== 'PENDING' && existing.status !== 'IN_PROGRESS') {
      throw new ValidationError(`Cannot cancel migration in status ${existing.status}`)
    }

    if (existing.rollbackOnFailure) {
      existing.status = 'ROLLING_BACK'
      await this.repository.save(existing)
      return this.rollbackManager.executeRollback(existing, 'User cancelled migration')
    }

    existing.status = 'FAILED'
    return this.repository.save(existing)
  }
}

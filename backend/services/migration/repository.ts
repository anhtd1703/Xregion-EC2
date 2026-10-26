import type { CreateMigrationRequest, Migration } from '@xregion/contracts'
import { NotFoundError } from '../../shared/errors/app-error.js'

export class MigrationRepository {
  private migrations: Map<string, Migration> = new Map()

  constructor() {
    this.seed()
  }

  private seed(): void {
    const defaultMigrations: Migration[] = [
      {
        id: 'mig-active-01',
        instanceId: 'vm-prod-04',
        scenarioId: 'scen-nightly-01',
        sourceRegion: 'REGION_A',
        destinationRegion: 'REGION_B',
        trigger: 'SCHEDULED',
        status: 'IN_PROGRESS',
        step: 'COPY_SNAPSHOT',
        progress: 45,
        autoUpdateDns: true,
        rollbackOnFailure: true,
        startedAt: '2026-03-15T02:00:00Z',
        createdAt: '2026-03-15T02:00:00Z',
        updatedAt: '2026-03-15T02:05:00Z'
      },
      {
        id: 'mig-history-01',
        instanceId: 'vm-staging-01',
        sourceRegion: 'REGION_A',
        destinationRegion: 'REGION_B',
        trigger: 'MANUAL',
        status: 'COMPLETED',
        step: 'COMPLETE',
        progress: 100,
        autoUpdateDns: true,
        rollbackOnFailure: true,
        startedAt: '2026-03-12T08:00:00Z',
        completedAt: '2026-03-12T08:14:22Z',
        createdAt: '2026-03-12T08:00:00Z',
        updatedAt: '2026-03-12T08:14:22Z'
      }
    ]

    for (const m of defaultMigrations) {
      this.migrations.set(m.id, { ...m })
    }
  }

  async list(): Promise<Migration[]> {
    return Array.from(this.migrations.values())
  }

  async findById(id: string): Promise<Migration> {
    const m = this.migrations.get(id)
    if (!m) throw new NotFoundError(`Migration ${id} not found`)
    return { ...m }
  }

  async create(
    input: CreateMigrationRequest,
    sourceRegion: 'REGION_A' | 'REGION_B'
  ): Promise<Migration> {
    const id = `mig-${Date.now().toString(36)}`
    const created: Migration = {
      id,
      instanceId: input.instanceId,
      scenarioId: input.scenarioId,
      sourceRegion,
      destinationRegion: input.destinationRegion,
      trigger: input.scenarioId ? 'SCHEDULED' : 'MANUAL',
      status: 'PENDING',
      step: 'PRE_CHECK',
      progress: 0,
      autoUpdateDns: input.autoUpdateDns ?? true,
      rollbackOnFailure: input.rollbackOnFailure ?? true,
      startedAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
    this.migrations.set(id, created)
    return { ...created }
  }

  async save(migration: Migration): Promise<Migration> {
    const updated = {
      ...migration,
      updatedAt: new Date().toISOString()
    }
    this.migrations.set(migration.id, updated)
    return { ...updated }
  }
}

import { describe, expect, it } from 'vitest'
import { MigrationRepository } from '../services/migration/repository.js'
import { MigrationService } from '../services/migration/service.js'

describe('MigrationService', () => {
  const repository = new MigrationRepository()
  const service = new MigrationService(repository)

  it('prevents migration between identical regions', async () => {
    await expect(
      service.createMigration({
        instanceId: 'vm-prod-01', // region is REGION_A
        destinationRegion: 'REGION_A'
      })
    ).rejects.toThrow('Source and destination regions cannot be identical')
  })

  it('creates and lists cross-region migration', async () => {
    const migration = await service.createMigration({
      instanceId: 'vm-prod-02', // region is REGION_A
      destinationRegion: 'REGION_B',
      autoUpdateDns: true,
      rollbackOnFailure: true
    })

    expect(migration.id).toBeDefined()
    expect(migration.sourceRegion).toBe('REGION_A')
    expect(migration.destinationRegion).toBe('REGION_B')
    expect(migration.status).toBe('PENDING')
    expect(migration.step).toBe('PRE_CHECK')

    const list = await service.listMigrations()
    expect(list.some((m) => m.id === migration.id)).toBe(true)
  })

  it('prevents duplicate active migrations on the same instance', async () => {
    await expect(
      service.createMigration({
        instanceId: 'vm-prod-02',
        destinationRegion: 'REGION_B'
      })
    ).rejects.toThrow('already active')
  })

  it('cancels migration and triggers rollback when configured', async () => {
    const list = await service.listMigrations()
    const active = list.find((m) => m.instanceId === 'vm-prod-02' && m.status === 'PENDING')
    expect(active).toBeDefined()

    if (active) {
      const cancelled = await service.cancelMigration(active.id)
      expect(cancelled.status).toBe('ROLLED_BACK')
    }
  })
})

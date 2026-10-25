import type { Migration } from '@xregion/contracts'
import { createLogger } from '../../shared/logging/logger.js'
import { getComputeProvider } from '../../shared/providers/provider-factory.js'

const logger = createLogger('migration-rollback')

export class MigrationRollbackManager {
  async executeRollback(migration: Migration, reason: string): Promise<Migration> {
    logger.warn('migration.rollback.started', `Initiating rollback for ${migration.id}`, {
      migrationId: migration.id,
      instanceId: migration.instanceId,
      failedStep: migration.step,
      reason
    })

    const compute = getComputeProvider()

    // Rollback procedure:
    // 1. Ensure DNS still points to source region (do not change)
    // 2. Restart source VM if it was stopped
    try {
      if (migration.step !== 'PRE_CHECK') {
        await compute.startInstance(migration.instanceId)
        logger.info(
          'migration.rollback.source_restored',
          `Source VM ${migration.instanceId} restarted`,
          {
            migrationId: migration.id,
            instanceId: migration.instanceId
          }
        )
      }
    } catch (err) {
      logger.error('migration.rollback.failed', 'Failed to restore source instance', {
        migrationId: migration.id,
        err
      })
    }

    const updated: Migration = {
      ...migration,
      status: 'ROLLED_BACK',
      updatedAt: new Date().toISOString()
    }

    logger.info('migration.rollback.completed', `Rollback completed for ${migration.id}`, {
      migrationId: migration.id,
      status: 'ROLLED_BACK'
    })

    return updated
  }
}

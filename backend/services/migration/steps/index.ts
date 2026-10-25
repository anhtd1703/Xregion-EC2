import type { Migration, MigrationStep } from '@xregion/contracts'

export interface StepExecutionResult {
  step: MigrationStep
  success: boolean
  progress: number
  message: string
  error?: {
    code: string
    message: string
  }
}

export interface MigrationStepHandler {
  name: MigrationStep
  execute(migration: Migration): Promise<StepExecutionResult>
}

export const MIGRATION_ORDER: MigrationStep[] = [
  'PRE_CHECK',
  'STOP_SOURCE',
  'CREATE_SNAPSHOT',
  'COPY_SNAPSHOT',
  'CREATE_VOLUME',
  'RESTORE_DESTINATION',
  'HEALTH_CHECK',
  'SWITCH_DNS',
  'COMPLETE'
]

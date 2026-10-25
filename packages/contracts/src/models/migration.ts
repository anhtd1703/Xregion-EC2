import type { RegionId } from './instance.js'

export type MigrationStatus =
  'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'FAILED' | 'ROLLING_BACK' | 'ROLLED_BACK'

export type MigrationStep =
  | 'PRE_CHECK'
  | 'STOP_SOURCE'
  | 'CREATE_SNAPSHOT'
  | 'COPY_SNAPSHOT'
  | 'CREATE_VOLUME'
  | 'RESTORE_DESTINATION'
  | 'HEALTH_CHECK'
  | 'SWITCH_DNS'
  | 'COMPLETE'

export interface MigrationError {
  code: string
  message: string
  failedStep: MigrationStep
}

export interface Migration {
  id: string
  scenarioId?: string

  instanceId: string
  sourceRegion: RegionId
  destinationRegion: RegionId

  trigger: 'MANUAL' | 'SCHEDULED'

  status: MigrationStatus
  step: MigrationStep
  progress: number

  autoUpdateDns: boolean
  rollbackOnFailure: boolean

  snapshotId?: string
  sourceVmId?: string
  destinationVmId?: string

  error?: MigrationError

  startedAt?: string
  completedAt?: string
  createdAt: string
  updatedAt: string
}

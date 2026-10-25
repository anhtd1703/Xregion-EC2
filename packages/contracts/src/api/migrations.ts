import type { RegionId } from '../models/instance.js'

export interface CreateMigrationRequest {
  instanceId: string
  destinationRegion: RegionId
  scenarioId?: string
  autoUpdateDns?: boolean
  rollbackOnFailure?: boolean
}

export interface RetryMigrationRequest {
  resumeFromStep?: string
}

import type { RegionId } from './instance.js'

export type ScenarioTriggerType = 'MANUAL' | 'SCHEDULED'
export type ScenarioStatus = 'ACTIVE' | 'PAUSED'

export interface ScenarioSchedule {
  expression: string
  timezone: string
}

export interface MigrationScenario {
  id: string
  name: string

  instanceId: string
  destinationRegion: RegionId

  triggerType: ScenarioTriggerType

  schedule?: ScenarioSchedule

  autoUpdateDns: boolean
  rollbackOnFailure: boolean
  notificationChannel: 'DASHBOARD' | 'EMAIL' | 'BOTH'

  cooldownMinutes: number

  status: ScenarioStatus

  createdAt: string
  updatedAt: string
}

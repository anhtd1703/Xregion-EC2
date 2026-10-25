import type { RegionId } from '../models/instance.js'
import type { ScenarioSchedule, ScenarioTriggerType } from '../models/scenario.js'

export interface CreateScenarioRequest {
  name: string
  instanceId: string
  destinationRegion: RegionId
  triggerType: ScenarioTriggerType
  schedule?: ScenarioSchedule
  autoUpdateDns?: boolean
  rollbackOnFailure?: boolean
  notificationChannel?: 'DASHBOARD' | 'EMAIL' | 'BOTH'
  cooldownMinutes?: number
}

export interface UpdateScenarioRequest {
  name?: string
  destinationRegion?: RegionId
  triggerType?: ScenarioTriggerType
  schedule?: ScenarioSchedule
  autoUpdateDns?: boolean
  rollbackOnFailure?: boolean
  notificationChannel?: 'DASHBOARD' | 'EMAIL' | 'BOTH'
  cooldownMinutes?: number
}

# Data Models

These are logical contracts. Adjust implementation details only when necessary.

## 1. Region

```ts
export type RegionId = 'REGION_A' | 'REGION_B'

export interface Region {
  id: RegionId
  cloudRegion: string
  displayName: string
  shortName: string
  available: boolean
  hourlyCostMultiplier?: number
}
```

---

## 2. Instance

```ts
export type InstanceStatus =
  | 'CREATING'
  | 'RUNNING'
  | 'STOPPED'
  | 'MIGRATING'
  | 'ERROR'
  | 'DELETING'

export interface Instance {
  id: string
  name: string
  status: InstanceStatus

  region: RegionId

  imageId: string
  imageName: string

  vcpu: number
  memoryMb: number
  diskGb: number

  privateIp?: string
  publicIp?: string
  endpoint?: string

  estimatedHourlyCost?: number

  createdAt: string
  updatedAt: string
}
```

---

## 3. Snapshot

```ts
export type SnapshotStatus =
  | 'CREATING'
  | 'AVAILABLE'
  | 'COPYING'
  | 'ERROR'
  | 'DELETING'

export interface Snapshot {
  id: string
  instanceId: string
  status: SnapshotStatus

  sourceRegion: RegionId
  copiedRegions: RegionId[]

  sizeGb: number

  createdAt: string
  updatedAt: string
}
```

---

## 4. Migration Scenario

```ts
export type ScenarioTriggerType = 'MANUAL' | 'SCHEDULED'
export type ScenarioStatus = 'ACTIVE' | 'PAUSED'

export interface MigrationScenario {
  id: string
  name: string

  instanceId: string
  destinationRegion: RegionId

  triggerType: ScenarioTriggerType

  schedule?: {
    expression: string
    timezone: string
  }

  autoUpdateDns: boolean
  rollbackOnFailure: boolean
  notificationChannel: 'DASHBOARD' | 'EMAIL' | 'BOTH'

  cooldownMinutes: number

  status: ScenarioStatus

  createdAt: string
  updatedAt: string
}
```

---

## 5. Migration

```ts
export type MigrationStatus =
  | 'PENDING'
  | 'IN_PROGRESS'
  | 'COMPLETED'
  | 'FAILED'
  | 'ROLLING_BACK'
  | 'ROLLED_BACK'

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

  error?: {
    code: string
    message: string
    failedStep: MigrationStep
  }

  startedAt?: string
  completedAt?: string
  createdAt: string
  updatedAt: string
}
```

---

## 6. Metric point

```ts
export interface MetricPoint {
  timestamp: string
  value: number
}

export interface InstanceMetrics {
  instanceId: string
  range: '1h' | '24h' | '7d'
  cpu: MetricPoint[]
  memory: MetricPoint[]
  networkIn: MetricPoint[]
  networkOut: MetricPoint[]
}
```

---

## 7. Audit log

```ts
export type LogSeverity = 'DEBUG' | 'INFO' | 'WARN' | 'ERROR'

export interface AuditLog {
  id: string
  timestamp: string
  severity: LogSeverity

  service: string
  event: string
  message: string

  instanceId?: string
  migrationId?: string
  requestId?: string

  metadata?: Record<string, unknown>
}
```

---

## 8. DynamoDB guidance

Avoid designing one giant schema prematurely.

MVP can use separate tables/logical repositories for:

- migrations
- scenarios
- resource mappings

The exact physical DynamoDB design may be refined when real integration begins.

The frontend must never depend on DynamoDB key design.

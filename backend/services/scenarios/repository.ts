import type {
  CreateScenarioRequest,
  MigrationScenario,
  UpdateScenarioRequest
} from '@xregion/contracts'
import { NotFoundError } from '../../shared/errors/app-error.js'

export class ScenarioRepository {
  private scenarios: Map<string, MigrationScenario> = new Map()

  constructor() {
    this.seed()
  }

  private seed(): void {
    const defaultScenarios: MigrationScenario[] = [
      {
        id: 'scen-nightly-01',
        name: 'Nightly Cost Optimizer: Web Gateway to Region B',
        instanceId: 'vm-prod-01',
        destinationRegion: 'REGION_B',
        triggerType: 'SCHEDULED',
        schedule: {
          expression: '0 2 * * *',
          timezone: 'UTC'
        },
        autoUpdateDns: true,
        rollbackOnFailure: true,
        notificationChannel: 'DASHBOARD',
        cooldownMinutes: 60,
        status: 'ACTIVE',
        createdAt: '2026-03-01T00:00:00Z',
        updatedAt: '2026-03-01T00:00:00Z'
      }
    ]

    for (const s of defaultScenarios) {
      this.scenarios.set(s.id, { ...s })
    }
  }

  async list(): Promise<MigrationScenario[]> {
    return Array.from(this.scenarios.values())
  }

  async findById(id: string): Promise<MigrationScenario> {
    const s = this.scenarios.get(id)
    if (!s) throw new NotFoundError(`Scenario ${id} not found`)
    return { ...s }
  }

  async create(input: CreateScenarioRequest): Promise<MigrationScenario> {
    const id = `scen-${Date.now().toString(36)}`
    const created: MigrationScenario = {
      id,
      name: input.name,
      instanceId: input.instanceId,
      destinationRegion: input.destinationRegion,
      triggerType: input.triggerType,
      schedule: input.schedule,
      autoUpdateDns: input.autoUpdateDns ?? true,
      rollbackOnFailure: input.rollbackOnFailure ?? true,
      notificationChannel: input.notificationChannel ?? 'DASHBOARD',
      cooldownMinutes: input.cooldownMinutes ?? 30,
      status: 'ACTIVE',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
    this.scenarios.set(id, created)
    return { ...created }
  }

  async update(id: string, input: UpdateScenarioRequest): Promise<MigrationScenario> {
    const existing = await this.findById(id)
    const updated: MigrationScenario = {
      ...existing,
      ...input,
      updatedAt: new Date().toISOString()
    }
    this.scenarios.set(id, updated)
    return { ...updated }
  }

  async delete(id: string): Promise<void> {
    if (!this.scenarios.has(id)) {
      throw new NotFoundError(`Scenario ${id} not found`)
    }
    this.scenarios.delete(id)
  }
}

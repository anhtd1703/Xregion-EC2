import type {
  CreateScenarioRequest,
  MigrationScenario,
  UpdateScenarioRequest
} from '@xregion/contracts'
import { ValidationError } from '../../shared/errors/app-error.js'
import { createLogger } from '../../shared/logging/logger.js'
import { ScenarioRepository } from './repository.js'

export class ScenarioService {
  private repository: ScenarioRepository
  private logger = createLogger('scenario-service')

  constructor(repository = new ScenarioRepository()) {
    this.repository = repository
  }

  async listScenarios(): Promise<MigrationScenario[]> {
    return this.repository.list()
  }

  async getScenario(id: string): Promise<MigrationScenario> {
    if (!id) throw new ValidationError('Scenario ID is required')
    return this.repository.findById(id)
  }

  async createScenario(input: CreateScenarioRequest): Promise<MigrationScenario> {
    if (!input.name || !input.instanceId || !input.destinationRegion) {
      throw new ValidationError('Name, instanceId, and destinationRegion are required')
    }
    const created = await this.repository.create(input)
    this.logger.info('scenario.created', `Scenario created ${created.id}`, {
      scenarioId: created.id,
      instanceId: created.instanceId
    })
    return created
  }

  async updateScenario(id: string, input: UpdateScenarioRequest): Promise<MigrationScenario> {
    const updated = await this.repository.update(id, input)
    this.logger.info('scenario.updated', `Scenario updated ${id}`, { scenarioId: id })
    return updated
  }

  async enableScenario(id: string): Promise<MigrationScenario> {
    return this.updateScenario(id, {
      ...(await this.getScenario(id)),
      ...({ status: 'ACTIVE' } as any)
    })
  }

  async disableScenario(id: string): Promise<MigrationScenario> {
    return this.updateScenario(id, {
      ...(await this.getScenario(id)),
      ...({ status: 'PAUSED' } as any)
    })
  }

  async deleteScenario(id: string): Promise<void> {
    await this.repository.delete(id)
    this.logger.info('scenario.deleted', `Scenario deleted ${id}`, { scenarioId: id })
  }
}

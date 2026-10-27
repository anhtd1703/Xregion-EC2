import type {
  CreateInstanceRequest,
  Instance,
  InstanceActionResponse,
  ListInstancesQuery
} from '@xregion/contracts'
import { ValidationError } from '../../shared/errors/app-error.js'
import { createLogger } from '../../shared/logging/logger.js'
import { ComputeRepository } from './repository.js'

export class ComputeService {
  private repository: ComputeRepository
  private logger = createLogger('compute-service')

  constructor(repository = new ComputeRepository()) {
    this.repository = repository
  }

  async listInstances(query?: ListInstancesQuery): Promise<{ items: Instance[]; total: number }> {
    const all = await this.repository.list({
      region: query?.region,
      status: query?.status,
      search: query?.search
    })

    const page = query?.page || 1
    const pageSize = query?.pageSize || 20
    const start = (page - 1) * pageSize
    const items = all.slice(start, start + pageSize)

    return {
      items,
      total: all.length
    }
  }

  async getInstance(id: string): Promise<Instance> {
    if (!id) throw new ValidationError('Instance id is required')
    return this.repository.findById(id)
  }

  async createInstance(input: CreateInstanceRequest): Promise<Instance> {
    if (!input || !input.name || !input.region || !input.imageId) {
      throw new ValidationError('Name, region, and imageId are required fields')
    }
    const created = await this.repository.create(input)
    this.logger.info('compute.instance.created', `Instance created ${created.id}`, {
      instanceId: created.id,
      region: created.region
    })
    return created
  }

  async startInstance(id: string): Promise<InstanceActionResponse> {
    await this.repository.start(id)
    return {
      instanceId: id,
      status: 'RUNNING',
      message: `Instance ${id} successfully started`
    }
  }

  async stopInstance(id: string): Promise<InstanceActionResponse> {
    await this.repository.stop(id)
    return {
      instanceId: id,
      status: 'STOPPED',
      message: `Instance ${id} successfully stopped`
    }
  }

  async restartInstance(id: string): Promise<InstanceActionResponse> {
    await this.repository.restart(id)
    return {
      instanceId: id,
      status: 'RUNNING',
      message: `Instance ${id} successfully restarted`
    }
  }

  async deleteInstance(id: string): Promise<void> {
    await this.repository.delete(id)
    this.logger.info('compute.instance.deleted', `Instance deleted ${id}`, {
      instanceId: id
    })
  }
}

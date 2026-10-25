import type { CreateInstanceRequest, Instance } from '@xregion/contracts'
import type {
  ComputeProvider,
  ListInstancesFilters
} from '../../shared/providers/compute.provider.js'
import { getComputeProvider } from '../../shared/providers/provider-factory.js'

export class ComputeRepository {
  private get provider(): ComputeProvider {
    return getComputeProvider()
  }

  async list(filters?: ListInstancesFilters): Promise<Instance[]> {
    return this.provider.listInstances(filters)
  }

  async findById(id: string): Promise<Instance> {
    return this.provider.getInstance(id)
  }

  async create(input: CreateInstanceRequest): Promise<Instance> {
    return this.provider.createInstance(input)
  }

  async start(id: string): Promise<void> {
    return this.provider.startInstance(id)
  }

  async stop(id: string): Promise<void> {
    return this.provider.stopInstance(id)
  }

  async restart(id: string): Promise<void> {
    return this.provider.restartInstance(id)
  }

  async delete(id: string): Promise<void> {
    return this.provider.deleteInstance(id)
  }
}

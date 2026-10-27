import type { CreateInstanceRequest, Instance } from '@xregion/contracts'
import { InvalidStateError, NotFoundError } from '../errors/app-error.js'
import type { ComputeProvider, ListInstancesFilters } from './compute.provider.js'

export class MockComputeProvider implements ComputeProvider {
  private instances: Map<string, Instance> = new Map()

  constructor() {
    this.seed()
  }

  private seed(): void {
    const defaultInstances: Instance[] = [
      {
        id: 'vm-prod-01',
        name: 'web-api-gateway',
        status: 'RUNNING',
        region: 'REGION_A',
        imageId: 'img-ubuntu-24',
        imageName: 'Ubuntu 24.04 LTS',
        vcpu: 4,
        memoryMb: 8192,
        diskGb: 50,
        privateIp: '10.0.1.15',
        publicIp: '54.251.10.42',
        endpoint: 'https://api-a.xregion.internal',
        estimatedHourlyCost: 0.096,
        createdAt: '2026-03-01T10:00:00Z',
        updatedAt: '2026-03-01T10:00:00Z'
      },
      {
        id: 'vm-prod-02',
        name: 'payment-processor',
        status: 'RUNNING',
        region: 'REGION_A',
        imageId: 'img-debian-12',
        imageName: 'Debian 12 Bookworm',
        vcpu: 2,
        memoryMb: 4096,
        diskGb: 30,
        privateIp: '10.0.1.28',
        publicIp: '54.251.10.88',
        endpoint: 'https://pay-a.xregion.internal',
        estimatedHourlyCost: 0.048,
        createdAt: '2026-03-05T08:30:00Z',
        updatedAt: '2026-03-05T08:30:00Z'
      },
      {
        id: 'vm-prod-03',
        name: 'inventory-cache',
        status: 'RUNNING',
        region: 'REGION_A',
        imageId: 'img-ubuntu-24',
        imageName: 'Ubuntu 24.04 LTS',
        vcpu: 2,
        memoryMb: 4096,
        diskGb: 20,
        privateIp: '10.0.1.95',
        publicIp: '54.251.10.95',
        endpoint: 'https://cache-a.xregion.internal',
        estimatedHourlyCost: 0.042,
        createdAt: '2026-03-07T11:00:00Z',
        updatedAt: '2026-03-07T11:00:00Z'
      },
      {
        id: 'vm-prod-04',
        name: 'order-analytics-worker',
        status: 'MIGRATING',
        region: 'REGION_A',
        imageId: 'img-ubuntu-24',
        imageName: 'Ubuntu 24.04 LTS',
        vcpu: 4,
        memoryMb: 8192,
        diskGb: 60,
        privateIp: '10.0.1.120',
        publicIp: '54.251.10.120',
        endpoint: 'https://analytics-a.xregion.internal',
        estimatedHourlyCost: 0.105,
        createdAt: '2026-03-08T09:15:00Z',
        updatedAt: '2026-03-15T02:00:00Z'
      },
      {
        id: 'vm-prod-05',
        name: 'notifications-dispatcher',
        status: 'RUNNING',
        region: 'REGION_B',
        imageId: 'img-debian-12',
        imageName: 'Debian 12 Bookworm',
        vcpu: 2,
        memoryMb: 2048,
        diskGb: 25,
        privateIp: '10.1.1.45',
        publicIp: '3.80.12.45',
        endpoint: 'https://notify-b.xregion.internal',
        estimatedHourlyCost: 0.038,
        createdAt: '2026-03-09T13:20:00Z',
        updatedAt: '2026-03-09T13:20:00Z'
      },
      {
        id: 'vm-prod-06',
        name: 'reporting-microservice',
        status: 'RUNNING',
        region: 'REGION_B',
        imageId: 'img-ubuntu-24',
        imageName: 'Ubuntu 24.04 LTS',
        vcpu: 4,
        memoryMb: 8192,
        diskGb: 80,
        privateIp: '10.1.1.72',
        publicIp: '3.80.12.72',
        endpoint: 'https://report-b.xregion.internal',
        estimatedHourlyCost: 0.092,
        createdAt: '2026-03-10T10:00:00Z',
        updatedAt: '2026-03-10T10:00:00Z'
      },
      {
        id: 'vm-staging-01',
        name: 'staging-auth-service',
        status: 'STOPPED',
        region: 'REGION_B',
        imageId: 'img-ubuntu-24',
        imageName: 'Ubuntu 24.04 LTS',
        vcpu: 2,
        memoryMb: 4096,
        diskGb: 20,
        privateIp: '10.1.1.10',
        publicIp: '3.80.12.99',
        estimatedHourlyCost: 0.045,
        createdAt: '2026-03-10T14:15:00Z',
        updatedAt: '2026-03-12T09:00:00Z'
      },
      {
        id: 'vm-dev-01',
        name: 'dev-sandbox-environment',
        status: 'STOPPED',
        region: 'REGION_B',
        imageId: 'img-debian-12',
        imageName: 'Debian 12 Bookworm',
        vcpu: 1,
        memoryMb: 2048,
        diskGb: 15,
        privateIp: '10.1.1.210',
        publicIp: '3.80.12.210',
        estimatedHourlyCost: 0.025,
        createdAt: '2026-03-11T08:00:00Z',
        updatedAt: '2026-03-11T08:00:00Z'
      }
    ]

    for (const inst of defaultInstances) {
      this.instances.set(inst.id, { ...inst })
    }
  }

  async listInstances(filters?: ListInstancesFilters): Promise<Instance[]> {
    let result = Array.from(this.instances.values())

    if (filters?.region) {
      result = result.filter((i) => i.region === filters.region)
    }

    if (filters?.status) {
      result = result.filter((i) => i.status === filters.status)
    }

    if (filters?.search) {
      const q = filters.search.toLowerCase()
      result = result.filter(
        (i) => i.name.toLowerCase().includes(q) || i.id.toLowerCase().includes(q)
      )
    }

    return result
  }

  async getInstance(id: string): Promise<Instance> {
    const inst = this.instances.get(id)
    if (!inst) {
      throw new NotFoundError(`Instance ${id} not found`)
    }
    return { ...inst }
  }

  async createInstance(input: CreateInstanceRequest): Promise<Instance> {
    const id = `vm-${Date.now().toString(36)}`
    const imageNames: Record<string, string> = {
      'img-ubuntu-24': 'Ubuntu 24.04 LTS',
      'img-ubuntu-22': 'Ubuntu 22.04 LTS',
      'img-debian-12': 'Debian 12 Bookworm',
      'img-cirros-06': 'CirrOS 0.6.2'
    }

    const imageName = imageNames[input.imageId] || 'Ubuntu 24.04 LTS'
    const octet = Math.floor(Math.random() * 200) + 20
    const isRegionA = input.region === 'REGION_A'
    const privateIp = isRegionA ? `10.0.2.${octet}` : `10.1.2.${octet}`
    const publicIp = isRegionA ? `54.251.20.${octet}` : `3.80.20.${octet}`
    const endpoint = `https://${input.name.toLowerCase().replace(/[^a-z0-9-]/g, '-')}.${isRegionA ? 'sg' : 'us'}.xregion.internal`

    // Rough hourly rate: $0.018 per vCPU + $0.005 per GB RAM + $0.00014 per GB disk
    const hourlyCost =
      Math.round(
        (input.vcpu * 0.018 + (input.memoryMb / 1024) * 0.005 + input.diskGb * 0.00014) * 1000
      ) / 1000

    const newInstance: Instance = {
      id,
      name: input.name,
      status: 'RUNNING',
      region: input.region,
      imageId: input.imageId,
      imageName,
      vcpu: input.vcpu,
      memoryMb: input.memoryMb,
      diskGb: input.diskGb,
      flavorId:
        input.flavorId ||
        (input.vcpu >= 4 ? 'm6i.xlarge' : input.vcpu >= 2 ? 't4g.medium' : 't4g.small'),
      subnetId:
        input.subnetId ||
        (isRegionA ? 'subnet-priv-01 (10.0.1.0/24)' : 'subnet-dr-01 (10.1.1.0/24)'),
      securityGroup: input.securityGroupId || 'sg-web-default',
      privateIp,
      publicIp,
      endpoint,
      estimatedHourlyCost: hourlyCost,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
    this.instances.set(id, newInstance)
    return { ...newInstance }
  }

  async startInstance(id: string): Promise<void> {
    const inst = await this.getInstance(id)
    if (inst.status === 'RUNNING') {
      throw new InvalidStateError(`Cannot start instance ${id}: already RUNNING`)
    }
    if (inst.status === 'MIGRATING') {
      throw new InvalidStateError(`Cannot start instance ${id}: currently MIGRATING`)
    }
    if (inst.status === 'DELETING') {
      throw new InvalidStateError(`Cannot start instance ${id}: currently DELETING`)
    }
    inst.status = 'RUNNING'
    inst.updatedAt = new Date().toISOString()
    this.instances.set(id, inst)
  }

  async stopInstance(id: string): Promise<void> {
    const inst = await this.getInstance(id)
    if (inst.status === 'STOPPED') {
      throw new InvalidStateError(`Cannot stop instance ${id}: already STOPPED`)
    }
    if (inst.status === 'MIGRATING') {
      throw new InvalidStateError(`Cannot stop instance ${id}: currently MIGRATING`)
    }
    if (inst.status === 'DELETING') {
      throw new InvalidStateError(`Cannot stop instance ${id}: currently DELETING`)
    }
    inst.status = 'STOPPED'
    inst.updatedAt = new Date().toISOString()
    this.instances.set(id, inst)
  }

  async restartInstance(id: string): Promise<void> {
    const inst = await this.getInstance(id)
    if (inst.status === 'STOPPED') {
      throw new InvalidStateError(
        `Cannot restart instance ${id}: currently STOPPED (start it instead)`
      )
    }
    if (inst.status === 'MIGRATING') {
      throw new InvalidStateError(`Cannot restart instance ${id}: currently MIGRATING`)
    }
    if (inst.status === 'DELETING') {
      throw new InvalidStateError(`Cannot restart instance ${id}: currently DELETING`)
    }
    inst.status = 'RUNNING'
    inst.updatedAt = new Date().toISOString()
    this.instances.set(id, inst)
  }

  async deleteInstance(id: string): Promise<void> {
    const inst = await this.getInstance(id)
    if (inst.status === 'MIGRATING') {
      throw new InvalidStateError(`Cannot delete instance ${id}: currently MIGRATING`)
    }
    this.instances.delete(id)
  }
}

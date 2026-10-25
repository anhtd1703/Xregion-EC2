import { describe, expect, it } from 'vitest'
import { ComputeService } from '../services/compute/service.js'

describe('ComputeService', () => {
  it('lists existing seeded instances', async () => {
    const service = new ComputeService()
    const { items, total } = await service.listInstances()
    expect(total).toBeGreaterThanOrEqual(2)
    expect(items.length).toBeGreaterThanOrEqual(2)
  })

  it('filters instances by region', async () => {
    const service = new ComputeService()
    const { items } = await service.listInstances({ region: 'REGION_A' })
    expect(items.every((i) => i.region === 'REGION_A')).toBe(true)
  })

  it('creates and retrieves a new instance', async () => {
    const service = new ComputeService()
    const created = await service.createInstance({
      name: 'test-vm',
      region: 'REGION_A',
      imageId: 'img-ubuntu-24',
      vcpu: 2,
      memoryMb: 4096,
      diskGb: 20
    })

    expect(created.id).toBeDefined()
    expect(created.name).toBe('test-vm')

    const fetched = await service.getInstance(created.id)
    expect(fetched.id).toBe(created.id)
  })

  it('stops and starts an instance', async () => {
    const service = new ComputeService()
    const inst = await service.createInstance({
      name: 'lifecycle-vm',
      region: 'REGION_B',
      imageId: 'img-ubuntu-24',
      vcpu: 1,
      memoryMb: 2048,
      diskGb: 10
    })

    const stopRes = await service.stopInstance(inst.id)
    expect(stopRes.status).toBe('STOPPED')

    const startRes = await service.startInstance(inst.id)
    expect(startRes.status).toBe('RUNNING')
  })
})

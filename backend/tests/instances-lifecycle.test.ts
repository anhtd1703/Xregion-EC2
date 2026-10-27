import { beforeEach, describe, expect, it } from 'vitest'
import {
  ComputeService,
  InvalidStateError,
  NotFoundError,
  ValidationError,
  resetMockProviders
} from '../index.js'

describe('Instance Lifecycle and Phase 2 Requirements', () => {
  let service: ComputeService

  beforeEach(() => {
    resetMockProviders()
    service = new ComputeService()
  })

  it('lists initial 8 deterministic instances and filters by region and status', async () => {
    const all = await service.listInstances()
    expect(all.total).toBe(8)
    expect(all.items.length).toBe(8)

    // Filter by Region A
    const regionA = await service.listInstances({ region: 'REGION_A' })
    expect(regionA.items.every((i) => i.region === 'REGION_A')).toBe(true)
    expect(regionA.total).toBe(4)

    // Filter by Region B
    const regionB = await service.listInstances({ region: 'REGION_B' })
    expect(regionB.items.every((i) => i.region === 'REGION_B')).toBe(true)
    expect(regionB.total).toBe(4)

    // Filter by status RUNNING
    const running = await service.listInstances({ status: 'RUNNING' })
    expect(running.items.every((i) => i.status === 'RUNNING')).toBe(true)
    expect(running.total).toBe(5)

    // Filter by status STOPPED
    const stopped = await service.listInstances({ status: 'STOPPED' })
    expect(stopped.items.every((i) => i.status === 'STOPPED')).toBe(true)
    expect(stopped.total).toBe(2)

    // Filter by status MIGRATING
    const migrating = await service.listInstances({ status: 'MIGRATING' })
    expect(migrating.items.every((i) => i.status === 'MIGRATING')).toBe(true)
    expect(migrating.total).toBe(1)
  })

  it('filters instances by search term', async () => {
    const searchRes = await service.listInstances({ search: 'payment' })
    expect(searchRes.items.length).toBe(1)
    expect(searchRes.items[0].name).toBe('payment-processor')

    const idSearch = await service.listInstances({ search: 'vm-prod-01' })
    expect(idSearch.items.length).toBe(1)
    expect(idSearch.items[0].id).toBe('vm-prod-01')
  })

  it('gets instance by ID or throws NotFoundError', async () => {
    const inst = await service.getInstance('vm-prod-01')
    expect(inst.id).toBe('vm-prod-01')
    expect(inst.region).toBe('REGION_A')

    await expect(service.getInstance('vm-non-existent')).rejects.toThrow(NotFoundError)
    await expect(service.getInstance('')).rejects.toThrow(ValidationError)
  })

  it('creates a new instance and persists in shared provider state', async () => {
    const newInst = await service.createInstance({
      name: 'analytics-aggregator',
      region: 'REGION_B',
      imageId: 'img-debian-12',
      vcpu: 2,
      memoryMb: 4096,
      diskGb: 40,
      flavorId: 't4g.medium',
      subnetId: 'subnet-dr-01',
      securityGroupId: 'sg-analytics'
    })

    expect(newInst.id).toMatch(/^vm-/)
    expect(newInst.name).toBe('analytics-aggregator')
    expect(newInst.status).toBe('RUNNING')
    expect(newInst.region).toBe('REGION_B')
    expect(newInst.imageName).toBe('Debian 12 Bookworm')
    expect(newInst.flavorId).toBe('t4g.medium')
    expect(newInst.privateIp).toMatch(/^10\.1\.2\./)
    expect(newInst.publicIp).toMatch(/^3\.80\.20\./)

    // Verify it persists in another ComputeService call
    const freshService = new ComputeService()
    const found = await freshService.getInstance(newInst.id)
    expect(found.id).toBe(newInst.id)

    const listAfter = await freshService.listInstances()
    expect(listAfter.total).toBe(9)
  })

  it('handles start lifecycle transition: STOPPED -> RUNNING', async () => {
    // vm-staging-01 is STOPPED initially
    const instBefore = await service.getInstance('vm-staging-01')
    expect(instBefore.status).toBe('STOPPED')

    const actionRes = await service.startInstance('vm-staging-01')
    expect(actionRes.status).toBe('RUNNING')

    const instAfter = await service.getInstance('vm-staging-01')
    expect(instAfter.status).toBe('RUNNING')
  })

  it('rejects start on already RUNNING instance with InvalidStateError', async () => {
    // vm-prod-01 is RUNNING initially
    await expect(service.startInstance('vm-prod-01')).rejects.toThrow(InvalidStateError)
  })

  it('handles stop lifecycle transition: RUNNING -> STOPPED', async () => {
    // vm-prod-01 is RUNNING initially
    const instBefore = await service.getInstance('vm-prod-01')
    expect(instBefore.status).toBe('RUNNING')

    const actionRes = await service.stopInstance('vm-prod-01')
    expect(actionRes.status).toBe('STOPPED')

    const instAfter = await service.getInstance('vm-prod-01')
    expect(instAfter.status).toBe('STOPPED')
  })

  it('rejects stop on already STOPPED instance with InvalidStateError', async () => {
    // vm-staging-01 is STOPPED initially
    await expect(service.stopInstance('vm-staging-01')).rejects.toThrow(InvalidStateError)
  })

  it('handles restart on RUNNING instance: RUNNING -> RUNNING', async () => {
    const instBefore = await service.getInstance('vm-prod-02')
    expect(instBefore.status).toBe('RUNNING')

    const actionRes = await service.restartInstance('vm-prod-02')
    expect(actionRes.status).toBe('RUNNING')

    const instAfter = await service.getInstance('vm-prod-02')
    expect(instAfter.status).toBe('RUNNING')
  })

  it('rejects restart on STOPPED instance with InvalidStateError', async () => {
    await expect(service.restartInstance('vm-staging-01')).rejects.toThrow(InvalidStateError)
  })

  it('rejects lifecycle operations on MIGRATING instance', async () => {
    // vm-prod-04 is MIGRATING
    await expect(service.startInstance('vm-prod-04')).rejects.toThrow(InvalidStateError)
    await expect(service.stopInstance('vm-prod-04')).rejects.toThrow(InvalidStateError)
    await expect(service.restartInstance('vm-prod-04')).rejects.toThrow(InvalidStateError)
    await expect(service.deleteInstance('vm-prod-04')).rejects.toThrow(InvalidStateError)
  })

  it('deletes an instance and removes it from mock provider state', async () => {
    // Delete vm-dev-01 (STOPPED)
    await service.deleteInstance('vm-dev-01')

    // Must now throw NotFoundError
    await expect(service.getInstance('vm-dev-01')).rejects.toThrow(NotFoundError)

    // Total instances should be 7
    const listRes = await service.listInstances()
    expect(listRes.total).toBe(7)
  })

  it('rejects delete on missing instance with NotFoundError', async () => {
    await expect(service.deleteInstance('vm-non-existent')).rejects.toThrow(NotFoundError)
  })
})

import { describe, expect, it } from 'vitest'
import {
  getComputeProvider,
  getDnsProvider,
  getMetricsProvider,
  getProviderMode,
  getSnapshotProvider
} from '../shared/providers/provider-factory.js'

describe('ProviderFactory', () => {
  it('defaults to mock provider mode when env is not set to real', () => {
    delete process.env.XREGION_PROVIDER_MODE
    expect(getProviderMode()).toBe('mock')
  })

  it('provides MockComputeProvider in mock mode', async () => {
    const compute = getComputeProvider()
    const instances = await compute.listInstances()
    expect(Array.isArray(instances)).toBe(true)
    expect(instances.length).toBeGreaterThan(0)
  })

  it('provides MockSnapshotProvider in mock mode', async () => {
    const snapshots = getSnapshotProvider()
    const list = await snapshots.listSnapshots()
    expect(Array.isArray(list)).toBe(true)
  })

  it('provides MockDnsProvider in mock mode', async () => {
    const dns = getDnsProvider()
    const status = await dns.getRoutingStatus()
    expect(status.domain).toBe('app.xregion.cloud')
  })

  it('provides MockMetricsProvider in mock mode', async () => {
    const metrics = getMetricsProvider()
    const data = await metrics.getInstanceMetrics('vm-prod-01', '1h')
    expect(data.cpu.length).toBeGreaterThan(0)
  })
})

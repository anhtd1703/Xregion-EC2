import { ProviderUnavailableError } from '../errors/app-error.js'
import type { ComputeProvider } from './compute.provider.js'
import type { DnsProvider } from './dns.provider.js'
import type { MetricsProvider } from './metrics.provider.js'
import { MockComputeProvider } from './mock-compute.provider.js'
import { MockDnsProvider } from './mock-dns.provider.js'
import { MockMetricsProvider } from './mock-metrics.provider.js'
import { MockSnapshotProvider } from './mock-snapshot.provider.js'
import type { SnapshotProvider } from './snapshot.provider.js'

let computeProviderInstance: ComputeProvider | null = null
let snapshotProviderInstance: SnapshotProvider | null = null
let dnsProviderInstance: DnsProvider | null = null
let metricsProviderInstance: MetricsProvider | null = null

export function getProviderMode(): 'mock' | 'real' {
  const mode = process.env.XREGION_PROVIDER_MODE?.toLowerCase()
  return mode === 'real' ? 'real' : 'mock'
}

export function getComputeProvider(): ComputeProvider {
  if (getProviderMode() === 'real') {
    throw new ProviderUnavailableError(
      'Real infrastructure ComputeProvider is scheduled for Phase 7'
    )
  }
  if (!computeProviderInstance) {
    computeProviderInstance = new MockComputeProvider()
  }
  return computeProviderInstance
}

export function getSnapshotProvider(): SnapshotProvider {
  if (getProviderMode() === 'real') {
    throw new ProviderUnavailableError(
      'Real infrastructure SnapshotProvider is scheduled for Phase 7'
    )
  }
  if (!snapshotProviderInstance) {
    snapshotProviderInstance = new MockSnapshotProvider()
  }
  return snapshotProviderInstance
}

export function getDnsProvider(): DnsProvider {
  if (getProviderMode() === 'real') {
    throw new ProviderUnavailableError('Real infrastructure DnsProvider is scheduled for Phase 7')
  }
  if (!dnsProviderInstance) {
    dnsProviderInstance = new MockDnsProvider()
  }
  return dnsProviderInstance
}

export function getMetricsProvider(): MetricsProvider {
  if (getProviderMode() === 'real') {
    throw new ProviderUnavailableError(
      'Real infrastructure MetricsProvider is scheduled for Phase 7'
    )
  }
  if (!metricsProviderInstance) {
    metricsProviderInstance = new MockMetricsProvider()
  }
  return metricsProviderInstance
}

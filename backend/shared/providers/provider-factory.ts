import { ProviderUnavailableError } from '../errors/app-error.js'
import type { ComputeProvider } from './compute.provider.js'
import type { DnsProvider } from './dns.provider.js'
import type { MetricsProvider } from './metrics.provider.js'
import { MockComputeProvider } from './mock-compute.provider.js'
import { MockDnsProvider } from './mock-dns.provider.js'
import { MockMetricsProvider } from './mock-metrics.provider.js'
import { MockSnapshotProvider } from './mock-snapshot.provider.js'
import type { SnapshotProvider } from './snapshot.provider.js'

interface GlobalMockStorage {
  __xregion_compute_provider__?: ComputeProvider
  __xregion_snapshot_provider__?: SnapshotProvider
  __xregion_dns_provider__?: DnsProvider
  __xregion_metrics_provider__?: MetricsProvider
}

const g = globalThis as unknown as GlobalMockStorage

export function resetMockProviders(): void {
  g.__xregion_compute_provider__ = undefined
  g.__xregion_snapshot_provider__ = undefined
  g.__xregion_dns_provider__ = undefined
  g.__xregion_metrics_provider__ = undefined
}

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
  if (!g.__xregion_compute_provider__) {
    g.__xregion_compute_provider__ = new MockComputeProvider()
  }
  return g.__xregion_compute_provider__
}

export function getSnapshotProvider(): SnapshotProvider {
  if (getProviderMode() === 'real') {
    throw new ProviderUnavailableError(
      'Real infrastructure SnapshotProvider is scheduled for Phase 7'
    )
  }
  if (!g.__xregion_snapshot_provider__) {
    g.__xregion_snapshot_provider__ = new MockSnapshotProvider()
  }
  return g.__xregion_snapshot_provider__
}

export function getDnsProvider(): DnsProvider {
  if (getProviderMode() === 'real') {
    throw new ProviderUnavailableError('Real infrastructure DnsProvider is scheduled for Phase 7')
  }
  if (!g.__xregion_dns_provider__) {
    g.__xregion_dns_provider__ = new MockDnsProvider()
  }
  return g.__xregion_dns_provider__
}

export function getMetricsProvider(): MetricsProvider {
  if (getProviderMode() === 'real') {
    throw new ProviderUnavailableError(
      'Real infrastructure MetricsProvider is scheduled for Phase 7'
    )
  }
  if (!g.__xregion_metrics_provider__) {
    g.__xregion_metrics_provider__ = new MockMetricsProvider()
  }
  return g.__xregion_metrics_provider__
}

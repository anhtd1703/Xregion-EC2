import type { DnsRoutingStatus, RegionId } from '@xregion/contracts'
import type { DnsProvider } from './dns.provider.js'

export class MockDnsProvider implements DnsProvider {
  private status: DnsRoutingStatus = {
    domain: 'app.xregion.cloud',
    hostedZoneId: 'Z0123456789ABCDEF',
    activeRegion: 'REGION_A',
    targetIp: '54.251.10.42',
    autoSwitchEnabled: true,
    regionAHealthy: true,
    regionBHealthy: true,
    lastSwitchedAt: '2026-03-01T00:00:00Z'
  }

  async getRoutingStatus(): Promise<DnsRoutingStatus> {
    return { ...this.status }
  }

  async updateActiveRegion(region: RegionId, autoSwitch?: boolean): Promise<DnsRoutingStatus> {
    this.status.activeRegion = region
    this.status.targetIp = region === 'REGION_A' ? '54.251.10.42' : '3.80.12.99'
    if (typeof autoSwitch === 'boolean') {
      this.status.autoSwitchEnabled = autoSwitch
    }
    this.status.lastSwitchedAt = new Date().toISOString()
    return { ...this.status }
  }
}

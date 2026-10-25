import type { DnsRoutingStatus, RegionId } from '@xregion/contracts'

export interface DnsProvider {
  getRoutingStatus(): Promise<DnsRoutingStatus>
  updateActiveRegion(region: RegionId, autoSwitch?: boolean): Promise<DnsRoutingStatus>
}

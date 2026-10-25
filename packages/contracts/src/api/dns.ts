import type { RegionId } from '../models/instance.js'

export interface DnsRoutingStatus {
  domain: string
  hostedZoneId: string
  activeRegion: RegionId
  targetIp: string
  autoSwitchEnabled: boolean
  regionAHealthy: boolean
  regionBHealthy: boolean
  lastSwitchedAt?: string
}

export interface UpdateDnsRequest {
  activeRegion: RegionId
  autoSwitchEnabled?: boolean
}

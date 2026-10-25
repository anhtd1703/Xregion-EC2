import type { DnsRoutingStatus, RegionId, UpdateDnsRequest } from '@xregion/contracts'
import { getDnsProvider } from '../../shared/providers/provider-factory.js'

export interface NetworkSummary {
  region: RegionId
  vpcId: string
  cidrBlock: string
  subnets: { id: string; name: string; cidr: string; isPublic: boolean }[]
  securityGroups: { id: string; name: string; rulesCount: number }[]
}

export class NetworkService {
  async getNetworkTopology(): Promise<NetworkSummary[]> {
    return [
      {
        region: 'REGION_A',
        vpcId: 'vpc-region-a-01',
        cidrBlock: '10.0.0.0/16',
        subnets: [
          { id: 'sub-a-pub-1', name: 'Public Subnet 1', cidr: '10.0.1.0/24', isPublic: true },
          { id: 'sub-a-priv-1', name: 'Private Subnet 1', cidr: '10.0.2.0/24', isPublic: false }
        ],
        securityGroups: [
          { id: 'sg-a-web', name: 'web-access-sg', rulesCount: 3 },
          { id: 'sg-a-internal', name: 'internal-sg', rulesCount: 2 }
        ]
      },
      {
        region: 'REGION_B',
        vpcId: 'vpc-region-b-01',
        cidrBlock: '10.1.0.0/16',
        subnets: [
          { id: 'sub-b-pub-1', name: 'Public Subnet 1', cidr: '10.1.1.0/24', isPublic: true },
          { id: 'sub-b-priv-1', name: 'Private Subnet 1', cidr: '10.1.2.0/24', isPublic: false }
        ],
        securityGroups: [{ id: 'sg-b-web', name: 'web-access-sg', rulesCount: 3 }]
      }
    ]
  }

  async getDnsStatus(): Promise<DnsRoutingStatus> {
    const dns = getDnsProvider()
    return dns.getRoutingStatus()
  }

  async updateDnsRouting(input: UpdateDnsRequest): Promise<DnsRoutingStatus> {
    const dns = getDnsProvider()
    return dns.updateActiveRegion(input.activeRegion, input.autoSwitchEnabled)
  }
}

import {
  ComputeService,
  MigrationService,
  MonitoringService,
  NetworkService
} from '@xregion/backend'
import type {
  ApiSuccessResponse,
  CostOverview,
  DnsRoutingStatus,
  Instance,
  Migration,
  RegionId
} from '@xregion/contracts'

export interface RegionHealth {
  region: RegionId
  displayName: string
  cloudRegion: string
  healthy: boolean
  latencyMs: number
  activeLoadBalancer: boolean
}

export interface OverviewData {
  stats: {
    totalInstances: number
    runningInstances: number
    stoppedInstances: number
    migratingInstances: number
    totalMigrations: number
    migrationSuccessRate: number
    estimatedMonthlyCost: number
  }
  regions: {
    regionA: {
      id: RegionId
      name: string
      cloudRegion: string
      total: number
      running: number
      stopped: number
      migrating: number
      monthlyCost: number
    }
    regionB: {
      id: RegionId
      name: string
      cloudRegion: string
      total: number
      running: number
      stopped: number
      migrating: number
      monthlyCost: number
    }
  }
  systemHealth: {
    status: 'HEALTHY' | 'DEGRADED' | 'CRITICAL'
    dns: DnsRoutingStatus
    regionAHealth: RegionHealth
    regionBHealth: RegionHealth
  }
  recentMigrations: Migration[]
  recentInstances: Instance[]
  costOverview: CostOverview
}

const computeService = new ComputeService()
const migrationService = new MigrationService()
const monitoringService = new MonitoringService()
const networkService = new NetworkService()

export default defineEventHandler(async (event): Promise<ApiSuccessResponse<OverviewData>> => {
  const [instancesRes, migrations, costs, dns] = await Promise.all([
    computeService.listInstances(),
    migrationService.listMigrations(),
    monitoringService.getCostsOverview(),
    networkService.getDnsStatus()
  ])

  const instances = instancesRes.items

  const runningCount = instances.filter((i) => i.status === 'RUNNING').length
  const stoppedCount = instances.filter((i) => i.status === 'STOPPED').length
  const migratingCount = instances.filter((i) => i.status === 'MIGRATING').length

  const regionAInstances = instances.filter((i) => i.region === 'REGION_A')
  const regionBInstances = instances.filter((i) => i.region === 'REGION_B')

  const regionACost = costs.regions.find((r) => r.region === 'REGION_A')?.totalCostMonthly || 111.68
  const regionBCost = costs.regions.find((r) => r.region === 'REGION_B')?.totalCostMonthly || 34.4

  const completedMigrations = migrations.filter((m) => m.status === 'COMPLETED').length
  const failedMigrations = migrations.filter((m) => m.status === 'FAILED').length
  const finishedTotal = completedMigrations + failedMigrations
  const successRate =
    finishedTotal > 0 ? Math.round((completedMigrations / finishedTotal) * 100) : 100

  const overviewData: OverviewData = {
    stats: {
      totalInstances: instances.length,
      runningInstances: runningCount,
      stoppedInstances: stoppedCount,
      migratingInstances: migratingCount,
      totalMigrations: migrations.length,
      migrationSuccessRate: successRate,
      estimatedMonthlyCost: costs.totalEstimatedMonthly
    },
    regions: {
      regionA: {
        id: 'REGION_A',
        name: 'Region A (Primary)',
        cloudRegion: 'ap-southeast-1',
        total: regionAInstances.length,
        running: regionAInstances.filter((i) => i.status === 'RUNNING').length,
        stopped: regionAInstances.filter((i) => i.status === 'STOPPED').length,
        migrating: regionAInstances.filter((i) => i.status === 'MIGRATING').length,
        monthlyCost: regionACost
      },
      regionB: {
        id: 'REGION_B',
        name: 'Region B (Secondary)',
        cloudRegion: 'us-east-1',
        total: regionBInstances.length,
        running: regionBInstances.filter((i) => i.status === 'RUNNING').length,
        stopped: regionBInstances.filter((i) => i.status === 'STOPPED').length,
        migrating: regionBInstances.filter((i) => i.status === 'MIGRATING').length,
        monthlyCost: regionBCost
      }
    },
    systemHealth: {
      status: 'HEALTHY',
      dns,
      regionAHealth: {
        region: 'REGION_A',
        displayName: 'Region A (Singapore)',
        cloudRegion: 'ap-southeast-1',
        healthy: dns.regionAHealthy,
        latencyMs: 18,
        activeLoadBalancer: dns.activeRegion === 'REGION_A'
      },
      regionBHealth: {
        region: 'REGION_B',
        displayName: 'Region B (N. Virginia)',
        cloudRegion: 'us-east-1',
        healthy: dns.regionBHealthy,
        latencyMs: 142,
        activeLoadBalancer: dns.activeRegion === 'REGION_B'
      }
    },
    recentMigrations: migrations.slice(0, 5),
    recentInstances: instances.slice(0, 6),
    costOverview: costs
  }

  const requestId = event.node.req.headers['x-request-id']?.toString() || `req_ov_${Date.now()}`

  return {
    success: true,
    data: overviewData,
    meta: {
      requestId
    }
  }
})

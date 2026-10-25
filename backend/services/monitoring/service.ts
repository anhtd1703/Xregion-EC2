import type { CostOverview, InstanceMetrics, MetricRange } from '@xregion/contracts'
import { getMetricsProvider } from '../../shared/providers/provider-factory.js'

export class MonitoringService {
  async getInstanceMetrics(instanceId: string, range?: MetricRange): Promise<InstanceMetrics> {
    const provider = getMetricsProvider()
    return provider.getInstanceMetrics(instanceId, range)
  }

  async getCostsOverview(): Promise<CostOverview> {
    return {
      totalEstimatedMonthly: 136.8,
      currency: 'USD',
      regions: [
        {
          region: 'REGION_A',
          instanceCount: 2,
          computeCostMonthly: 103.68,
          storageCostMonthly: 8.0,
          totalCostMonthly: 111.68
        },
        {
          region: 'REGION_B',
          instanceCount: 1,
          computeCostMonthly: 32.4,
          storageCostMonthly: 2.0,
          totalCostMonthly: 34.4
        }
      ],
      potentialCrossRegionSavingsMonthly: 28.5
    }
  }
}

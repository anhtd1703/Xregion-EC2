import type { InstanceMetrics, MetricRange } from '@xregion/contracts'

export interface MetricsProvider {
  getInstanceMetrics(instanceId: string, range?: MetricRange): Promise<InstanceMetrics>
}

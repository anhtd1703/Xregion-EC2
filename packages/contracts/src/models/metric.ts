export interface MetricPoint {
  timestamp: string
  value: number
}

export type MetricRange = '1h' | '24h' | '7d'

export interface InstanceMetrics {
  instanceId: string
  range: MetricRange
  cpu: MetricPoint[]
  memory: MetricPoint[]
  networkIn: MetricPoint[]
  networkOut: MetricPoint[]
}

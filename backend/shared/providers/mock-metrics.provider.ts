import type { InstanceMetrics, MetricPoint, MetricRange } from '@xregion/contracts'
import type { MetricsProvider } from './metrics.provider.js'

export class MockMetricsProvider implements MetricsProvider {
  async getInstanceMetrics(
    instanceId: string,
    range: MetricRange = '1h'
  ): Promise<InstanceMetrics> {
    const pointsCount = range === '1h' ? 12 : range === '24h' ? 24 : 14
    const now = Date.now()
    const stepMs =
      ((range === '1h' ? 3600 : range === '24h' ? 86400 : 86400 * 7) * 1000) / pointsCount

    const cpu: MetricPoint[] = []
    const memory: MetricPoint[] = []
    const networkIn: MetricPoint[] = []
    const networkOut: MetricPoint[] = []

    for (let i = pointsCount - 1; i >= 0; i--) {
      const timestamp = new Date(now - i * stepMs).toISOString()
      cpu.push({ timestamp, value: Math.round(20 + Math.sin(i) * 15 + Math.random() * 5) })
      memory.push({ timestamp, value: Math.round(45 + Math.cos(i) * 10 + Math.random() * 5) })
      networkIn.push({ timestamp, value: Math.round(120 + Math.random() * 40) })
      networkOut.push({ timestamp, value: Math.round(80 + Math.random() * 30) })
    }

    return {
      instanceId,
      range,
      cpu,
      memory,
      networkIn,
      networkOut
    }
  }
}

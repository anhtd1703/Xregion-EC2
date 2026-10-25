import type { MetricRange } from '@xregion/contracts'
import { createErrorResult, createSuccessResult } from '../../shared/http/response.js'
import type { ApiGatewayEvent, ApiGatewayResult } from '../../shared/http/types.js'
import { MonitoringService } from './service.js'

const monitoringService = new MonitoringService()

export async function handler(event: ApiGatewayEvent): Promise<ApiGatewayResult> {
  const requestId = event.requestContext?.requestId || 'req_monitoring'

  try {
    const path = event.path || ''
    const method = event.httpMethod.toUpperCase()
    const pathParams = event.pathParameters || {}
    const id = pathParams.id

    if (method === 'GET' && path.endsWith('/costs')) {
      const costs = await monitoringService.getCostsOverview()
      return createSuccessResult(costs, requestId)
    }

    if (method === 'GET' && id && path.endsWith('/metrics')) {
      const range = (event.queryStringParameters?.range as MetricRange) || '1h'
      const metrics = await monitoringService.getInstanceMetrics(id, range)
      return createSuccessResult(metrics, requestId)
    }

    return createErrorResult(new Error(`Route not found: ${method} ${path}`), requestId)
  } catch (err) {
    return createErrorResult(err, requestId)
  }
}

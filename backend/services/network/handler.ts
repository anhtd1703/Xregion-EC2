import type { UpdateDnsRequest } from '@xregion/contracts'
import { createErrorResult, createSuccessResult } from '../../shared/http/response.js'
import type { ApiGatewayEvent, ApiGatewayResult } from '../../shared/http/types.js'
import { NetworkService } from './service.js'

const networkService = new NetworkService()

export async function handler(event: ApiGatewayEvent): Promise<ApiGatewayResult> {
  const requestId = event.requestContext?.requestId || 'req_network'

  try {
    const path = event.path || ''
    const method = event.httpMethod.toUpperCase()

    if (method === 'GET' && path.endsWith('/network')) {
      const topology = await networkService.getNetworkTopology()
      return createSuccessResult(topology, requestId)
    }

    if (method === 'GET' && path.endsWith('/dns')) {
      const dns = await networkService.getDnsStatus()
      return createSuccessResult(dns, requestId)
    }

    if ((method === 'PATCH' || method === 'POST') && path.endsWith('/dns')) {
      const payload: UpdateDnsRequest = event.body
        ? JSON.parse(event.body)
        : { activeRegion: 'REGION_B' }
      const updated = await networkService.updateDnsRouting(payload)
      return createSuccessResult(updated, requestId)
    }

    return createErrorResult(new Error(`Route not found: ${method} ${path}`), requestId)
  } catch (err) {
    return createErrorResult(err, requestId)
  }
}

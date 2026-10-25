import type { CreateScenarioRequest, UpdateScenarioRequest } from '@xregion/contracts'
import { createErrorResult, createSuccessResult } from '../../shared/http/response.js'
import type { ApiGatewayEvent, ApiGatewayResult } from '../../shared/http/types.js'
import { createLogger } from '../../shared/logging/logger.js'
import { ScenarioService } from './service.js'

const logger = createLogger('scenarios-handler')
const scenarioService = new ScenarioService()

export async function handler(event: ApiGatewayEvent): Promise<ApiGatewayResult> {
  const requestId = event.requestContext?.requestId || 'req_scenarios'

  try {
    const path = event.path || ''
    const method = event.httpMethod.toUpperCase()
    const pathParams = event.pathParameters || {}
    const id = pathParams.id

    // GET /migration-scenarios
    if (method === 'GET' && (!id || path.endsWith('/migration-scenarios'))) {
      const list = await scenarioService.listScenarios()
      return createSuccessResult(list, requestId)
    }

    // POST /migration-scenarios
    if (method === 'POST' && path.endsWith('/migration-scenarios')) {
      const payload: CreateScenarioRequest = event.body ? JSON.parse(event.body) : {}
      const created = await scenarioService.createScenario(payload)
      return createSuccessResult(created, requestId, 201)
    }

    // GET /migration-scenarios/{id}
    if (method === 'GET' && id && !path.includes('/', path.indexOf(id) + id.length + 1)) {
      const s = await scenarioService.getScenario(id)
      return createSuccessResult(s, requestId)
    }

    // PATCH /migration-scenarios/{id}
    if (method === 'PATCH' && id) {
      const payload: UpdateScenarioRequest = event.body ? JSON.parse(event.body) : {}
      const updated = await scenarioService.updateScenario(id, payload)
      return createSuccessResult(updated, requestId)
    }

    // POST /migration-scenarios/{id}/enable
    if (method === 'POST' && id && path.endsWith('/enable')) {
      const res = await scenarioService.enableScenario(id)
      return createSuccessResult(res, requestId)
    }

    // POST /migration-scenarios/{id}/disable
    if (method === 'POST' && id && path.endsWith('/disable')) {
      const res = await scenarioService.disableScenario(id)
      return createSuccessResult(res, requestId)
    }

    // DELETE /migration-scenarios/{id}
    if (method === 'DELETE' && id) {
      await scenarioService.deleteScenario(id)
      return createSuccessResult({ message: `Scenario ${id} deleted` }, requestId)
    }

    return createErrorResult(new Error(`Route not found: ${method} ${path}`), requestId)
  } catch (err) {
    logger.error('scenarios.error', 'Scenario request failed', { requestId, err })
    return createErrorResult(err, requestId)
  }
}

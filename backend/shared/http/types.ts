export interface ApiGatewayEvent {
  path: string
  httpMethod: string
  headers: Record<string, string | undefined>
  queryStringParameters?: Record<string, string | undefined> | null
  pathParameters?: Record<string, string | undefined> | null
  body?: string | null
  requestContext?: {
    requestId: string
    [key: string]: unknown
  }
}

export interface ApiGatewayResult {
  statusCode: number
  headers: Record<string, string>
  body: string
}

export type LogSeverity = 'DEBUG' | 'INFO' | 'WARN' | 'ERROR'

export interface AuditLog {
  id: string
  timestamp: string
  severity: LogSeverity

  service: string
  event: string
  message: string

  instanceId?: string
  migrationId?: string
  requestId?: string

  metadata?: Record<string, unknown>
}

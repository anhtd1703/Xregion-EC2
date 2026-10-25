import type { LogSeverity } from '@xregion/contracts'

export interface LogContext {
  requestId?: string
  instanceId?: string
  migrationId?: string
  scenarioId?: string
  step?: string
  durationMs?: number
  [key: string]: unknown
}

export class Logger {
  private serviceName: string

  constructor(serviceName: string) {
    this.serviceName = serviceName
  }

  private write(severity: LogSeverity, event: string, message: string, context?: LogContext): void {
    const entry = {
      timestamp: new Date().toISOString(),
      service: this.serviceName,
      severity,
      event,
      message,
      ...context
    }
    // Structured JSON log output
    const serialized = JSON.stringify(entry)
    if (severity === 'ERROR') {
      console.error(serialized)
    } else if (severity === 'WARN') {
      console.warn(serialized)
    } else {
      console.log(serialized)
    }
  }

  debug(event: string, message: string, context?: LogContext): void {
    this.write('DEBUG', event, message, context)
  }

  info(event: string, message: string, context?: LogContext): void {
    this.write('INFO', event, message, context)
  }

  warn(event: string, message: string, context?: LogContext): void {
    this.write('WARN', event, message, context)
  }

  error(event: string, message: string, context?: LogContext): void {
    this.write('ERROR', event, message, context)
  }
}

export function createLogger(serviceName: string): Logger {
  return new Logger(serviceName)
}

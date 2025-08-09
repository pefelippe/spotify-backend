interface LogLevel {
  ERROR: 'error'
  WARN: 'warn'
  INFO: 'info'
  DEBUG: 'debug'
}

const LOG_LEVELS: LogLevel = {
  ERROR: 'error',
  WARN: 'warn',
  INFO: 'info',
  DEBUG: 'debug',
}

interface LogEntry {
  timestamp: string
  level: string
  message: string
  context?: Record<string, unknown>
  error?: Error
}

const createLogger = (service: string) => {
  const formatMessage = (
    level: string,
    message: string,
    context?: Record<string, unknown>,
    error?: Error
  ): LogEntry => ({
    timestamp: new Date().toISOString(),
    level,
    message: `[${service}] ${message}`,
    context,
    error: error
      ? ({
          name: error.name,
          message: error.message,
          stack: error.stack,
        } as Error)
      : undefined,
  })

  const log = (
    level: string,
    message: string,
    context?: Record<string, unknown>,
    error?: Error
  ) => {
    const entry = formatMessage(level, message, context, error)

    switch (level) {
      case LOG_LEVELS.ERROR:
        console.error(JSON.stringify(entry))
        break
      case LOG_LEVELS.WARN:
        console.warn(JSON.stringify(entry))
        break
      case LOG_LEVELS.INFO:
        console.info(JSON.stringify(entry))
        break
      case LOG_LEVELS.DEBUG:
        if (process.env.NODE_ENV !== 'production') {
          console.debug(JSON.stringify(entry))
        }
        break
      default:
        console.log(JSON.stringify(entry))
    }
  }

  return {
    error: (message: string, context?: Record<string, unknown>, error?: Error) =>
      log(LOG_LEVELS.ERROR, message, context, error),
    warn: (message: string, context?: Record<string, unknown>) =>
      log(LOG_LEVELS.WARN, message, context),
    info: (message: string, context?: Record<string, unknown>) =>
      log(LOG_LEVELS.INFO, message, context),
    debug: (message: string, context?: Record<string, unknown>) =>
      log(LOG_LEVELS.DEBUG, message, context),
  }
}

export { createLogger, LOG_LEVELS }
export type { LogEntry }

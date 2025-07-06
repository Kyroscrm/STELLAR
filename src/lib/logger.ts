type LogLevel = 'info' | 'warn' | 'error'

function formatError(error: unknown): string {
  if (error instanceof Error) {
    return error.stack || error.message
  }
  return JSON.stringify(error)
}

class Logger {
  private isDevelopment = process.env.NODE_ENV === 'development'

  /* eslint-disable no-console */
  private logFunctions = {
    info: console.log,
    warn: console.warn,
    error: console.error
  }
  /* eslint-enable no-console */

  private log(level: LogLevel, message: unknown) {
    const timestamp = new Date().toISOString()
    const formattedMessage = typeof message === 'string' ? message : formatError(message)

    if (this.isDevelopment) {
      const logFn = this.logFunctions[level].bind(console)
      logFn(`[${timestamp}] ${level.toUpperCase()}:`, formattedMessage)
    }

    // In production, you might want to send logs to a service like Sentry
    // This is just a placeholder for now
    if (level === 'error' && !this.isDevelopment) {
      // TODO: Send to error reporting service
    }
  }

  info(message: string) {
    this.log('info', message)
  }

  warn(message: string) {
    this.log('warn', message)
  }

  error(message: unknown) {
    this.log('error', message)
  }
}

export const logger = new Logger()

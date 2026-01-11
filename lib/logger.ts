/**
 * Simple logger utility to replace console.log/error throughout codebase
 * Only shows debug/info logs in development, always shows warnings/errors
 */

type LogLevel = "info" | "warn" | "error" | "debug";

class Logger {
  private isDev = process.env.NODE_ENV === "development";

  info(message: string, ...data: unknown[]) {
    if (this.isDev) {
      console.log(`ℹ️ ${message}`, ...data);
    }
  }

  warn(message: string, ...data: unknown[]) {
    console.warn(`⚠️ ${message}`, ...data);
  }

  error(message: string, ...data: unknown[]) {
    console.error(`❌ ${message}`, ...data);
  }

  debug(message: string, ...data: unknown[]) {
    if (this.isDev) {
      console.debug(`🐛 ${message}`, ...data);
    }
  }
}

export const logger = new Logger();

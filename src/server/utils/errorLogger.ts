import * as fs from 'fs';
import * as path from 'path';

const ERROR_LOG_FILE = path.join(process.cwd(), 'serverError.log');

/**
 * Ensures the error log file exists
 */
function ensureErrorLogFile(): void {
  try {
    if (!fs.existsSync(ERROR_LOG_FILE)) {
      fs.writeFileSync(ERROR_LOG_FILE, '');
    }
  } catch (error) {
    // If we can't create the file, we'll just skip logging
    console.error('Failed to create error log file:', error);
  }
}

/**
 * Format error message with timestamp
 */
function formatErrorLog(error: any, context?: string): string {
  const timestamp = new Date().toISOString();
  const contextStr = context ? ` [${context}]` : '';
  
  let errorMessage = '';
  if (error instanceof Error) {
    errorMessage = `${error.name}: ${error.message}`;
    if (error.stack) {
      errorMessage += `\n${error.stack}`;
    }
  } else if (typeof error === 'string') {
    errorMessage = error;
  } else {
    errorMessage = JSON.stringify(error, null, 2);
  }
  
  return `${timestamp}${contextStr} | ${errorMessage}\n`;
}

/**
 * Log error to serverError.log file
 */
export function logError(error: any, context?: string): void {
  try {
    ensureErrorLogFile();
    const logLine = formatErrorLog(error, context);
    
    // Append to error log file
    fs.appendFileSync(ERROR_LOG_FILE, logLine, 'utf8');
  } catch (writeError) {
    // If we can't write to the file, fall back to console
    console.error('Failed to write to error log:', writeError);
    console.error('Original error:', error);
  }
}

/**
 * Log error and also output to console.error
 */
export function logErrorWithConsole(error: any, context?: string): void {
  logError(error, context);
  console.error(context ? `[${context}]` : '', error);
}

/**
 * Log warning to serverError.log file
 */
export function logWarning(warning: any, context?: string): void {
  try {
    ensureErrorLogFile();
    const logLine = formatErrorLog(warning, context ? `WARN ${context}` : 'WARN');
    
    // Append to error log file
    fs.appendFileSync(ERROR_LOG_FILE, logLine, 'utf8');
  } catch (writeError) {
    // If we can't write to the file, fall back to console
    console.warn('Failed to write to error log:', writeError);
    console.warn('Original warning:', warning);
  }
}

/**
 * Log warning and also output to console.warn
 */
export function logWarningWithConsole(warning: any, context?: string): void {
  logWarning(warning, context);
  console.warn(context ? `[${context}]` : '', warning);
}

/**
 * Wrapper for async error handlers that logs errors
 */
export function withErrorLogging<T extends (...args: any[]) => Promise<any>>(
  fn: T,
  context?: string
): T {
  return (async (...args: any[]) => {
    try {
      return await fn(...args);
    } catch (error) {
      logErrorWithConsole(error, context);
      throw error;
    }
  }) as T;
}


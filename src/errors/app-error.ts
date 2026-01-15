/**
 * AppError - A structured error class for consistent error handling across the application.
 *
 * This class provides:
 * - HTTP status code mapping
 * - Error codes for programmatic error handling by API consumers
 * - Optional details for debugging (only shown in development)
 * - Proper serialization for API responses
 *
 * Usage:
 *   throw new AppError('User not found', 404, 'USER_NOT_FOUND')
 *   throw new AppError('Invalid input', 400, 'VALIDATION_ERROR', { field: 'email' })
 */
export class AppError extends Error {
  constructor(
    message: string,
    public readonly statusCode: number = 500,
    public readonly code: string = 'INTERNAL_ERROR',
    public readonly details?: Record<string, unknown>,
  ) {
    super(message)
    this.name = 'AppError'

    // Maintains proper stack trace for where error was thrown (V8 engines)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, AppError)
    }
  }

  /**
   * Converts the error to a JSON-serializable object for API responses.
   * In production, sensitive details like stack traces are omitted.
   */
  toJSON(includeStack = false): Record<string, unknown> {
    return {
      error: {
        message: this.message,
        code: this.code,
        statusCode: this.statusCode,
        ...(this.details && { details: this.details }),
        ...(includeStack && { stack: this.stack }),
      },
    }
  }
}

/**
 * Common error factory functions for consistent error creation.
 * These provide semantic meaning and reduce boilerplate.
 */
export const Errors = {
  notFound: (resource: string, id?: string) =>
    new AppError(
      id ? `${resource} with id '${id}' not found` : `${resource} not found`,
      404,
      'NOT_FOUND',
      { resource, id },
    ),

  badRequest: (message: string, details?: Record<string, unknown>) =>
    new AppError(message, 400, 'BAD_REQUEST', details),

  unauthorized: (message = 'Authentication required') =>
    new AppError(message, 401, 'UNAUTHORIZED'),

  forbidden: (message = 'Access denied') =>
    new AppError(message, 403, 'FORBIDDEN'),

  conflict: (message: string, details?: Record<string, unknown>) =>
    new AppError(message, 409, 'CONFLICT', details),

  internal: (message = 'An unexpected error occurred') =>
    new AppError(message, 500, 'INTERNAL_ERROR'),
}

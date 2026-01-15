import fp from 'fastify-plugin'
import { env } from '#~/config/environment.js'
import { AppError } from '#~/errors/app-error.js'

/**
 * Global Error Handler Plugin - Converts all errors to structured responses.
 *
 * This plugin sets up centralized error handling for the entire application.
 * All uncaught errors in routes and hooks will be processed here.
 *
 * Handles:
 * - AppError instances: Returns structured error with appropriate status code
 * - Zod validation errors: Converts to 400 Bad Request with validation details
 * - Unknown errors: Returns 500 Internal Server Error (details hidden in production)
 *
 * @see https://fastify.dev/docs/latest/Reference/Hooks/#onerror
 */
export default fp(
  async (fastify) => {
    fastify.setErrorHandler(async (err, request, reply) => {
      // Log all errors for debugging/monitoring
      request.log.error({ err }, 'Request error')

      // Handle our custom AppError class
      if (err instanceof AppError) {
        return reply
          .code(err.statusCode)
          .send(err.toJSON(env.NODE_ENV === 'development'))
      }

      // Cast error to access common error properties
      const error = err as Error & {
        name?: string
        message?: string
        stack?: string
        statusCode?: number
        validation?: unknown
        issues?: unknown[]
      }

      // Handle Zod validation errors (from fastify-type-provider-zod)
      if (error.name === 'ZodError' && error.issues) {
        return reply.code(400).send({
          error: {
            message: 'Validation failed',
            code: 'VALIDATION_ERROR',
            statusCode: 400,
            details: { issues: error.issues },
          },
        })
      }

      // Handle Fastify's built-in validation errors
      if (error.validation) {
        return reply.code(400).send({
          error: {
            message: 'Validation failed',
            code: 'VALIDATION_ERROR',
            statusCode: 400,
            details: { validation: error.validation },
          },
        })
      }

      // Unknown errors - return generic message in production
      const statusCode =
        typeof error.statusCode === 'number' ? error.statusCode : 500
      return reply.code(statusCode).send({
        error: {
          message:
            env.NODE_ENV === 'development'
              ? error.message || 'Unknown error'
              : 'Internal server error',
          code: 'INTERNAL_ERROR',
          statusCode,
          ...(env.NODE_ENV === 'development' && { stack: error.stack }),
        },
      })
    })
  },
  {
    name: 'error-handler',
    // Error handler should load early so it catches all errors
    dependencies: [],
  },
)

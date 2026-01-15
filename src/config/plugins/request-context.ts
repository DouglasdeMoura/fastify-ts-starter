import { randomUUID } from 'node:crypto'
import fp from 'fastify-plugin'

/**
 * Request Context Plugin - Adds request-scoped utilities and metadata.
 *
 * This plugin demonstrates a practical pattern for Fastify decorators:
 * - Adding a unique request ID for tracing/debugging
 * - Providing a typed interface for request-level state
 *
 * The request ID is essential for:
 * - Correlating logs across a single request
 * - Debugging issues in production
 * - Tracking requests through distributed systems
 *
 * Usage in routes:
 *   request.id           // Access the request ID
 *   request.startTime    // Access when the request started
 *   request.log.info({ requestId: request.id }, 'Processing request')
 *
 * @see https://fastify.dev/docs/latest/Reference/Decorators/
 */

export interface RequestContext {
  /**
   * Unique identifier for this request.
   * Use this in logs and error responses for debugging.
   */
  id: string

  /**
   * High-resolution timestamp when the request started.
   * Use this to calculate request duration.
   */
  startTime: number
}

export default fp(
  async (fastify) => {
    // Decorate request with context properties
    // Using decorateRequest for request-scoped data (per-request state)
    fastify.decorateRequest('startTime', 0)

    // Add request ID to every request
    // Uses X-Request-Id header if provided (for tracing through proxies)
    // Otherwise generates a new UUID
    fastify.addHook('onRequest', async (request) => {
      request.startTime = performance.now()

      // Use existing request ID from header or generate new one
      const existingId = request.headers['x-request-id']
      if (existingId && typeof existingId === 'string') {
        request.id = existingId
      } else {
        request.id = randomUUID()
      }

      // Add request ID to all logs for this request
      request.log = request.log.child({ requestId: request.id })
    })

    // Add request ID to response headers for client-side correlation
    fastify.addHook('onSend', async (request, reply) => {
      reply.header('X-Request-Id', request.id)

      // Log request duration
      const duration = performance.now() - request.startTime
      request.log.info({ durationMs: duration.toFixed(2) }, 'Request completed')
    })
  },
  {
    name: 'request-context',
  },
)

// Extend Fastify types for TypeScript support
declare module 'fastify' {
  interface FastifyRequest {
    /**
     * High-resolution timestamp (from performance.now()) when request started.
     * Use with performance.now() to calculate duration.
     */
    startTime: number
  }
}

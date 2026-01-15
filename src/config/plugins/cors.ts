import cors from '@fastify/cors'
import fp from 'fastify-plugin'
import { env } from '#~/config/environment.js'

/**
 * CORS Plugin - Configures Cross-Origin Resource Sharing for the API.
 *
 * CORS is required when your API is accessed from a different domain than
 * where it's hosted (e.g., frontend at app.example.com, API at api.example.com).
 *
 * Configuration options:
 * - origin: Which domains can access the API
 * - methods: Which HTTP methods are allowed
 * - allowedHeaders: Which headers the client can send
 * - exposedHeaders: Which headers the client can read from responses
 * - credentials: Whether cookies/auth headers are allowed
 * - maxAge: How long browsers should cache preflight responses
 *
 * Security considerations:
 * - In production, always specify exact origins instead of using '*'
 * - Only allow credentials if you actually need them
 * - Be restrictive with allowed headers and methods
 *
 * @see https://github.com/fastify/fastify-cors
 * @see https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS
 */
export default fp(
  async (fastify) => {
    await fastify.register(cors, {
      // Origin configuration
      // In development: allow any origin for easier testing
      // In production: specify exact allowed origins via environment variable
      origin:
        env.NODE_ENV === 'development'
          ? true // Allow all origins in development
          : env.CORS_ORIGINS?.split(',') || false,

      // Allowed HTTP methods
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],

      // Headers the client is allowed to send
      allowedHeaders: [
        'Content-Type',
        'Authorization',
        'X-Requested-With',
        'Accept',
        'X-Request-Id',
      ],

      // Headers the client is allowed to read from the response
      exposedHeaders: [
        'X-Request-Id', // Useful for debugging/support tickets
        'X-RateLimit-Limit', // Rate limiting info (if implemented)
        'X-RateLimit-Remaining',
      ],

      // Allow credentials (cookies, authorization headers)
      // Set to true if your API uses session cookies or needs credentials
      credentials: false,

      // Preflight cache duration (in seconds)
      // Browsers will cache CORS preflight responses for this long
      maxAge: 86400, // 24 hours
    })
  },
  {
    name: 'cors',
    dependencies: [],
  },
)

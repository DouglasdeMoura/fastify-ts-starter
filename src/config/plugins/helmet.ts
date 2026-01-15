import helmet from '@fastify/helmet'
import fp from 'fastify-plugin'
import { env } from '#~/config/environment.js'

/**
 * Security Headers Plugin - Adds essential HTTP security headers using Helmet.
 *
 * Helmet helps protect your app from well-known web vulnerabilities by setting
 * appropriate HTTP headers. This plugin configures sensible defaults that work
 * for most API applications.
 *
 * Headers added include:
 * - X-Content-Type-Options: nosniff
 * - X-Frame-Options: DENY (or SAMEORIGIN)
 * - X-XSS-Protection: 0 (modern browsers have built-in XSS protection)
 * - Strict-Transport-Security: max-age=... (HSTS)
 * - Content-Security-Policy: default-src 'self'
 *
 * @see https://github.com/fastify/fastify-helmet
 * @see https://helmetjs.github.io/
 */
export default fp(
  async (fastify) => {
    await fastify.register(helmet, {
      // Content Security Policy - controls which resources can be loaded
      contentSecurityPolicy: {
        directives: {
          // Default: only allow resources from same origin
          defaultSrc: ["'self'"],
          // Allow inline styles for Scalar API docs UI
          styleSrc: ["'self'", "'unsafe-inline'"],
          // Allow inline scripts for Scalar API docs UI
          scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
          // Allow images from same origin and data URIs (for Scalar)
          imgSrc: ["'self'", 'data:', 'https:'],
        },
      },

      // Cross-Origin settings for API usage
      // Disable if using @fastify/cors (they work together, but CORS handles this)
      crossOriginResourcePolicy: { policy: 'cross-origin' },

      // HSTS - Force HTTPS in production
      // Only enable in production to avoid issues with local development
      hsts:
        env.NODE_ENV === 'production'
          ? {
              maxAge: 31536000, // 1 year
              includeSubDomains: true,
              preload: true,
            }
          : false,
    })
  },
  {
    name: 'helmet',
    // Helmet should load before routes
    dependencies: [],
  },
)

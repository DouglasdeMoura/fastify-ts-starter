import { z } from 'zod'

/**
 * Environment Configuration Schema
 *
 * This schema validates and transforms environment variables at startup.
 * Using Zod ensures:
 * - Type safety: All env vars are properly typed
 * - Validation: Invalid values fail fast with clear error messages
 * - Defaults: Missing optional values get sensible defaults
 * - Coercion: Strings are converted to appropriate types (numbers, booleans)
 *
 * Add new environment variables here as your application grows.
 */
const environmentSchema = z.object({
  // Application environment
  NODE_ENV: z
    .enum(['development', 'production', 'test'])
    .default('production')
    .describe('Application environment'),

  // Server configuration
  PORT: z.coerce
    .number()
    .int()
    .min(1)
    .max(65535)
    .default(3000)
    .describe('Port the server listens on'),

  // Graceful shutdown delay in milliseconds
  FASTIFY_CLOSE_GRACE_DELAY: z.coerce
    .number()
    .int()
    .min(0)
    .default(500)
    .describe('Milliseconds to wait before forcing shutdown'),

  // CORS configuration (comma-separated list of allowed origins)
  CORS_ORIGINS: z
    .string()
    .optional()
    .describe('Comma-separated list of allowed CORS origins (production only)'),

  // Logging level
  LOG_LEVEL: z
    .enum(['fatal', 'error', 'warn', 'info', 'debug', 'trace'])
    .default('info')
    .describe('Pino log level'),
})

export const env = environmentSchema.parse(process.env)

// Export the type for use in other modules
export type Environment = z.infer<typeof environmentSchema>

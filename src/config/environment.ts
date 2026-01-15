import { z } from 'zod'

const environmentSchema = z.object({
  NODE_ENV: z.enum(['development', 'production']).default('production'),
  FASTIFY_CLOSE_GRACE_DELAY: z.coerce.number().default(500),
  PORT: z.coerce.number().default(3000),
})

export const env = environmentSchema.parse(process.env)

import type { FastifyPluginAsync } from 'fastify'
import type { ZodTypeProvider } from 'fastify-type-provider-zod'
import { z } from 'zod'

const example: FastifyPluginAsync = async (fastify, _opts): Promise<void> => {
  fastify.withTypeProvider<ZodTypeProvider>().route({
    method: 'GET',
    url: '/',
    schema: {
      tags: ['Ping'],
      summary: 'Health check',
      response: {
        200: z.object({
          message: z.literal('Pong'),
        }),
      },
    },
    handler: (_req, res) => {
      res.send({ message: 'Pong' })
    },
  })
}

export default example

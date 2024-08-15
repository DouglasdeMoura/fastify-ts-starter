import type { FastifyPluginAsync } from 'fastify'
import type { ZodTypeProvider } from 'fastify-type-provider-zod'
import { z } from 'zod'

const example: FastifyPluginAsync = async (fastify, _opts): Promise<void> => {
  fastify.withTypeProvider<ZodTypeProvider>().route({
    method: 'GET',
    url: '/',
    schema: {
      tags: ['Example'],
      summary: 'Example route',
      response: {
        200: z.object({
          message: z.literal('Hello, world!'),
        }),
      },
    },
    handler: (_req, res) => {
      res.send({ message: 'Hello, world!' })
    },
  })
}

export default example

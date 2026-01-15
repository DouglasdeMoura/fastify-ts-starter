import swagger from '@fastify/swagger'
import apiReference from '@scalar/fastify-api-reference'
import fp from 'fastify-plugin'
import { jsonSchemaTransform } from 'fastify-type-provider-zod'

export default fp(async (fastify) => {
  fastify.register(swagger, {
    openapi: {
      info: {
        title: 'Fastify API',
        version: '1.0.0',
      },
    },
    transform: jsonSchemaTransform,
  })

  fastify.register(apiReference, {
    routePrefix: '/docs',
  })
})

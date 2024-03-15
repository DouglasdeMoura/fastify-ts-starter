import swagger from '@fastify/swagger'
import apiReference from '@scalar/fastify-api-reference'
import fp from 'fastify-plugin'

export default fp(async (fastify) => {
  fastify.register(swagger, {
    openapi: {
      info: {
        title: 'API',
        version: '1.0.0',
      },
    },
  })

  fastify.register(apiReference, {
    routePrefix: '/docs',
  })
})

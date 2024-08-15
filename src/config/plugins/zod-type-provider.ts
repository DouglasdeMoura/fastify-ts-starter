import fp from 'fastify-plugin'
import {
  serializerCompiler,
  validatorCompiler,
} from 'fastify-type-provider-zod'

export default fp(async (fastify) => {
  fastify.setValidatorCompiler(validatorCompiler)
  fastify.setSerializerCompiler(serializerCompiler)
})

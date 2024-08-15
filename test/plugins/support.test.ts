import { test, expect } from 'vitest'
import Fastify from 'fastify'
import Support from '../../src/config/plugins/support.js'

test('support works standalone', async () => {
  const fastify = Fastify()
  void fastify.register(Support)
  await fastify.ready()

  expect(fastify.someSupport()).toBe('hugs')
})

import Fastify from 'fastify'
import { describe, expect, it } from 'vitest'
import RequestContext from '../../src/config/plugins/request-context.js'

describe('Request Context Plugin', () => {
  it('should add startTime to requests', async () => {
    const fastify = Fastify()
    await fastify.register(RequestContext)

    let capturedStartTime = 0
    fastify.get('/test', async (request) => {
      capturedStartTime = request.startTime
      return { ok: true }
    })

    await fastify.ready()
    await fastify.inject({ method: 'GET', url: '/test' })

    expect(capturedStartTime).toBeGreaterThan(0)
  })

  it('should generate request ID if not provided', async () => {
    const fastify = Fastify()
    await fastify.register(RequestContext)

    let capturedId = ''
    fastify.get('/test', async (request) => {
      capturedId = request.id
      return { ok: true }
    })

    await fastify.ready()
    const response = await fastify.inject({ method: 'GET', url: '/test' })

    // Should be a valid UUID
    expect(capturedId).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i,
    )

    // Should also be in response header
    expect(response.headers['x-request-id']).toBe(capturedId)
  })

  it('should use X-Request-Id header if provided', async () => {
    const fastify = Fastify()
    await fastify.register(RequestContext)

    let capturedId = ''
    fastify.get('/test', async (request) => {
      capturedId = request.id
      return { ok: true }
    })

    await fastify.ready()
    const customId = 'custom-trace-id-12345'
    const response = await fastify.inject({
      method: 'GET',
      url: '/test',
      headers: { 'x-request-id': customId },
    })

    expect(capturedId).toBe(customId)
    expect(response.headers['x-request-id']).toBe(customId)
  })
})

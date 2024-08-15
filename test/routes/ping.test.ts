import { describe, it, expect } from 'vitest'
import { app } from '../helper.js'

describe('GET /ping', () => {
  it('it should load the healthcheck message', async () => {
    const res = await app.inject({
      url: '/ping',
    })

    expect(res.json()).toEqual({ message: 'Pong' })
  })
})

import { describe, it, expect } from 'vitest'
import { app } from '../helper.js'

describe('GET /example', () => {
  it('it should load the example message', async () => {
    const res = await app.inject({
      url: '/example',
    })

    expect(res.json()).toEqual({ message: 'Hello, world!' })
  })
})

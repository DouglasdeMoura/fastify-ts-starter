import { test, expect } from 'vitest'
import { app } from '../helper.js'

test('example is loaded', async () => {
  const res = await app.inject({
    url: '/example'
  })

  expect(res.payload).toBe('this is an example')
})

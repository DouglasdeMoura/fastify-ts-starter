import { test, expect } from 'vitest'
import { app } from '../helper.js'

test('default root route', async () => {
  const res = await app.inject({
    url: '/',
  })
  expect(res.json()).toEqual({ root: true })
})

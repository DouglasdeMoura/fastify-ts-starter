import { test, expect } from 'vitest'
import { app } from '../helper.js'

test('default root route', async () => {
  const res = await app.inject({
    url: '/'
  })
  expect(JSON.parse(res.payload)).toEqual({ root: true })
})

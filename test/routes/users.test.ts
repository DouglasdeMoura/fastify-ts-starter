import { describe, expect, it } from 'vitest'
import { app } from '../helper.js'

describe('Users API', () => {
  // Note: In a real application, you would reset the database between tests.
  // This example uses the seeded user from the route file.

  describe('GET /users', () => {
    it('should return paginated list of users', async () => {
      const res = await app.inject({
        method: 'GET',
        url: '/users',
      })

      expect(res.statusCode).toBe(200)
      const body = res.json()
      expect(body).toHaveProperty('data')
      expect(body).toHaveProperty('pagination')
      expect(body.pagination).toMatchObject({
        page: 1,
        limit: 10,
      })
    })

    it('should filter users by role', async () => {
      const res = await app.inject({
        method: 'GET',
        url: '/users?role=admin',
      })

      expect(res.statusCode).toBe(200)
      const body = res.json()
      expect(body.data.every((u: { role: string }) => u.role === 'admin')).toBe(
        true,
      )
    })

    it('should reject invalid pagination params', async () => {
      const res = await app.inject({
        method: 'GET',
        url: '/users?page=-1',
      })

      expect(res.statusCode).toBe(400)
    })
  })

  describe('GET /users/:id', () => {
    it('should return user by ID', async () => {
      const res = await app.inject({
        method: 'GET',
        url: '/users/550e8400-e29b-41d4-a716-446655440000',
      })

      expect(res.statusCode).toBe(200)
      expect(res.json()).toHaveProperty('email', 'john@example.com')
    })

    it('should return 404 for non-existent user', async () => {
      const res = await app.inject({
        method: 'GET',
        url: '/users/00000000-0000-0000-0000-000000000000',
      })

      expect(res.statusCode).toBe(404)
      expect(res.json().error.code).toBe('NOT_FOUND')
    })

    it('should reject invalid UUID format', async () => {
      const res = await app.inject({
        method: 'GET',
        url: '/users/invalid-id',
      })

      expect(res.statusCode).toBe(400)
    })
  })

  describe('POST /users', () => {
    it('should create a new user', async () => {
      const res = await app.inject({
        method: 'POST',
        url: '/users',
        payload: {
          name: 'Jane Doe',
          email: `jane-${Date.now()}@example.com`, // Unique email to avoid conflicts
        },
      })

      expect(res.statusCode).toBe(201)
      const body = res.json()
      expect(body).toHaveProperty('id')
      expect(body.name).toBe('Jane Doe')
      expect(body.role).toBe('user') // default value
    })

    it('should reject invalid email', async () => {
      const res = await app.inject({
        method: 'POST',
        url: '/users',
        payload: {
          name: 'Test User',
          email: 'not-an-email',
        },
      })

      expect(res.statusCode).toBe(400)
    })

    it('should reject missing required fields', async () => {
      const res = await app.inject({
        method: 'POST',
        url: '/users',
        payload: {},
      })

      expect(res.statusCode).toBe(400)
    })
  })

  describe('PATCH /users/:id', () => {
    it('should update user fields', async () => {
      const res = await app.inject({
        method: 'PATCH',
        url: '/users/550e8400-e29b-41d4-a716-446655440000',
        payload: {
          name: 'John Updated',
        },
      })

      expect(res.statusCode).toBe(200)
      expect(res.json().name).toBe('John Updated')
    })
  })

  describe('DELETE /users/:id', () => {
    it('should return 404 for non-existent user', async () => {
      const res = await app.inject({
        method: 'DELETE',
        url: '/users/00000000-0000-0000-0000-000000000000',
      })

      expect(res.statusCode).toBe(404)
    })
  })
})

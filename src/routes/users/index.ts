import type { FastifyPluginAsync } from 'fastify'
import type { ZodTypeProvider } from 'fastify-type-provider-zod'
import { z } from 'zod'
import { Errors } from '#~/errors/app-error.js'
import { ErrorResponseSchema } from '#~/schemas/error.js'

/**
 * Users Route - Demonstrates comprehensive request validation patterns.
 *
 * This module showcases:
 * - Request body validation (POST /users)
 * - URL params validation (GET /users/:id)
 * - Query string validation (GET /users)
 * - Response validation (all routes)
 * - Error handling patterns
 *
 * In a real application, you would connect this to a database.
 * This example uses an in-memory store for demonstration purposes.
 */

// =============================================================================
// SCHEMAS - Define your validation schemas at the top for reusability
// =============================================================================

/**
 * User schema - defines the shape of a user object.
 * Zod schemas serve as both runtime validation AND TypeScript types.
 */
const UserSchema = z.object({
  id: z.string().uuid().describe('Unique user identifier'),
  name: z.string().min(1).max(100).describe('User display name'),
  email: z.string().email().describe('User email address'),
  role: z
    .enum(['admin', 'user', 'guest'])
    .describe('User role for authorization'),
  createdAt: z.string().datetime().describe('ISO 8601 creation timestamp'),
})

/**
 * Create user request body schema.
 * Note: id and createdAt are generated server-side, so they're omitted here.
 */
const CreateUserBodySchema = z.object({
  name: z
    .string()
    .min(1, 'Name is required')
    .max(100, 'Name must be 100 characters or less')
    .describe('User display name'),
  email: z
    .string()
    .email('Invalid email format')
    .describe('User email address'),
  role: z
    .enum(['admin', 'user', 'guest'])
    .default('user')
    .describe('User role (defaults to "user")'),
})

/**
 * Update user request body schema.
 * Uses .partial() to make all fields optional for PATCH semantics.
 */
const UpdateUserBodySchema = CreateUserBodySchema.partial()

/**
 * URL params schema for routes that need a user ID.
 */
const UserParamsSchema = z.object({
  id: z.string().uuid('Invalid user ID format'),
})

/**
 * Query params for listing users with pagination and filtering.
 * Demonstrates various query parameter patterns.
 */
const ListUsersQuerySchema = z.object({
  // Pagination
  page: z.coerce
    .number()
    .int()
    .min(1)
    .default(1)
    .describe('Page number (1-indexed)'),
  limit: z.coerce
    .number()
    .int()
    .min(1)
    .max(100)
    .default(10)
    .describe('Items per page (max 100)'),

  // Filtering
  role: z
    .enum(['admin', 'user', 'guest'])
    .optional()
    .describe('Filter by user role'),
  search: z
    .string()
    .min(1)
    .max(100)
    .optional()
    .describe('Search by name or email'),

  // Sorting
  sortBy: z
    .enum(['name', 'email', 'createdAt'])
    .default('createdAt')
    .describe('Field to sort by'),
  sortOrder: z.enum(['asc', 'desc']).default('desc').describe('Sort direction'),
})

// Type inference from schemas - use these in your handlers
type User = z.infer<typeof UserSchema>

// =============================================================================
// IN-MEMORY STORE - Replace with your database in a real application
// =============================================================================

const users = new Map<string, User>()

// Seed some example data
const seedUser: User = {
  id: '550e8400-e29b-41d4-a716-446655440000',
  name: 'John Doe',
  email: 'john@example.com',
  role: 'admin',
  createdAt: new Date().toISOString(),
}
users.set(seedUser.id, seedUser)

// =============================================================================
// ROUTE DEFINITIONS
// =============================================================================

const usersRoute: FastifyPluginAsync = async (fastify): Promise<void> => {
  /**
   * GET /users - List users with pagination and filtering
   *
   * Demonstrates: Query parameter validation with defaults, pagination pattern
   */
  fastify.withTypeProvider<ZodTypeProvider>().route({
    method: 'GET',
    url: '/',
    schema: {
      tags: ['Users'],
      summary: 'List users',
      description:
        'Retrieve a paginated list of users with optional filtering and sorting.',
      querystring: ListUsersQuerySchema,
      response: {
        200: z.object({
          data: z.array(UserSchema),
          pagination: z.object({
            page: z.number(),
            limit: z.number(),
            total: z.number(),
            totalPages: z.number(),
          }),
        }),
      },
    },
    handler: async (request, reply) => {
      const { page, limit, role, search, sortBy, sortOrder } = request.query

      // Filter users
      let filteredUsers = Array.from(users.values())

      if (role) {
        filteredUsers = filteredUsers.filter((u) => u.role === role)
      }

      if (search) {
        const searchLower = search.toLowerCase()
        filteredUsers = filteredUsers.filter(
          (u) =>
            u.name.toLowerCase().includes(searchLower) ||
            u.email.toLowerCase().includes(searchLower),
        )
      }

      // Sort users
      filteredUsers.sort((a, b) => {
        const aVal = a[sortBy]
        const bVal = b[sortBy]
        const comparison = aVal < bVal ? -1 : aVal > bVal ? 1 : 0
        return sortOrder === 'asc' ? comparison : -comparison
      })

      // Paginate
      const total = filteredUsers.length
      const totalPages = Math.ceil(total / limit)
      const start = (page - 1) * limit
      const paginatedUsers = filteredUsers.slice(start, start + limit)

      return reply.send({
        data: paginatedUsers,
        pagination: { page, limit, total, totalPages },
      })
    },
  })

  /**
   * GET /users/:id - Get a single user by ID
   *
   * Demonstrates: URL params validation, 404 error handling
   */
  fastify.withTypeProvider<ZodTypeProvider>().route({
    method: 'GET',
    url: '/:id',
    schema: {
      tags: ['Users'],
      summary: 'Get user by ID',
      description: 'Retrieve a single user by their unique identifier.',
      params: UserParamsSchema,
      response: {
        200: UserSchema,
        404: ErrorResponseSchema,
      },
    },
    handler: async (request, reply) => {
      const { id } = request.params
      const user = users.get(id)

      if (!user) {
        throw Errors.notFound('User', id)
      }

      return reply.send(user)
    },
  })

  /**
   * POST /users - Create a new user
   *
   * Demonstrates: Request body validation, 201 response, conflict handling
   */
  fastify.withTypeProvider<ZodTypeProvider>().route({
    method: 'POST',
    url: '/',
    schema: {
      tags: ['Users'],
      summary: 'Create a new user',
      description: 'Create a new user with the provided details.',
      body: CreateUserBodySchema,
      response: {
        201: UserSchema,
        400: ErrorResponseSchema,
        409: ErrorResponseSchema,
      },
    },
    handler: async (request, reply) => {
      const { name, email, role } = request.body

      // Check for duplicate email
      const existingUser = Array.from(users.values()).find(
        (u) => u.email === email,
      )
      if (existingUser) {
        throw Errors.conflict('A user with this email already exists', {
          email,
        })
      }

      // Create new user
      const newUser: User = {
        id: crypto.randomUUID(),
        name,
        email,
        role,
        createdAt: new Date().toISOString(),
      }

      users.set(newUser.id, newUser)

      return reply.code(201).send(newUser)
    },
  })

  /**
   * PATCH /users/:id - Update an existing user
   *
   * Demonstrates: Partial body validation, params + body together
   */
  fastify.withTypeProvider<ZodTypeProvider>().route({
    method: 'PATCH',
    url: '/:id',
    schema: {
      tags: ['Users'],
      summary: 'Update a user',
      description:
        'Update an existing user. Only provided fields will be updated.',
      params: UserParamsSchema,
      body: UpdateUserBodySchema,
      response: {
        200: UserSchema,
        404: ErrorResponseSchema,
        409: ErrorResponseSchema,
      },
    },
    handler: async (request, reply) => {
      const { id } = request.params
      const updates = request.body

      const user = users.get(id)
      if (!user) {
        throw Errors.notFound('User', id)
      }

      // Check for email conflict if email is being updated
      if (updates.email && updates.email !== user.email) {
        const existingUser = Array.from(users.values()).find(
          (u) => u.email === updates.email,
        )
        if (existingUser) {
          throw Errors.conflict('A user with this email already exists', {
            email: updates.email,
          })
        }
      }

      // Apply updates
      const updatedUser = { ...user, ...updates }
      users.set(id, updatedUser)

      return reply.send(updatedUser)
    },
  })

  /**
   * DELETE /users/:id - Delete a user
   *
   * Demonstrates: 204 No Content response pattern
   */
  fastify.withTypeProvider<ZodTypeProvider>().route({
    method: 'DELETE',
    url: '/:id',
    schema: {
      tags: ['Users'],
      summary: 'Delete a user',
      description: 'Permanently delete a user by their ID.',
      params: UserParamsSchema,
      response: {
        204: z.null().describe('User successfully deleted'),
        404: ErrorResponseSchema,
      },
    },
    handler: async (request, reply) => {
      const { id } = request.params

      if (!users.has(id)) {
        throw Errors.notFound('User', id)
      }

      users.delete(id)

      return reply.code(204).send(null)
    },
  })
}

export default usersRoute

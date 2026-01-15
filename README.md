# Fastify TypeScript starter

This is a Fastify starter project for your new projects. Out-of-the-box, it includes:

- TypeScript (with [tsx](https://www.npmjs.com/package/tsx) for development);
- OpenAPI support with [Scalar](https://github.com/scalar/scalar/blob/main/packages/fastify-api-reference/README.md) theme;
- File based routing and auto-loading plugins provided by [fastify-autoload](https://github.com/fastify/fastify-autoload);
- GitHub Actions for auto-merging Dependabot PRs, running tests, building the project and validating the Dockerfile;
- VS Code settings for debugging and formatting;
- [Vitest](https://vitest.dev/) for testing;
- [Biome](https://biomejs.dev) for code formatting and linting;
- [Commitlint](https://commitlint.js.org/) for commit message linting;
- [Lefthook](https://github.com/evilmartians/lefthook) for git hooks;
- [Wireit](https://github.com/google/wireit) to make npm/pnpm/yarn scripts smarter and more efficient;
- [Docker](https://www.docker.com/) for containerization;
- [Docker Compose](https://docs.docker.com/compose/) for running the app in a container;
- [Release It!](https://www.npmjs.com/package/release-it) to automate versioning and package publishing-related tasks (by default, the versioning is done following [CalVer](https://calver.org/) format).

## Quick Start

```bash
# Clone the template
npx degit DouglasdeMoura/fastify-ts-starter my-app
cd my-app

# Install dependencies
npm install

# Install git hooks
npx lefthook install

# Start development server
npm run dev
```

Open [http://localhost:3000/docs](http://localhost:3000/docs) to see the API documentation.

## Project Structure

```
src/
├── config/
│   ├── app.ts              # Main app setup (autoloads plugins + routes)
│   ├── environment.ts      # Environment variable validation (Zod)
│   ├── healthcheck.ts      # Docker healthcheck script
│   └── plugins/            # Auto-loaded plugins
│       ├── cors.ts         # CORS configuration
│       ├── error-handler.ts # Global error handling
│       ├── helmet.ts       # Security headers
│       ├── openapi.ts      # Swagger/OpenAPI setup
│       ├── request-context.ts # Request ID + timing
│       ├── sensible.ts     # HTTP utilities
│       └── zod-type-provider.ts # Zod validation setup
├── errors/
│   └── app-error.ts        # Structured error class
├── routes/                 # Auto-loaded routes (file = URL path)
│   ├── root.ts             # GET /
│   ├── ping/index.ts       # GET /ping (healthcheck)
│   ├── example/index.ts    # GET /example
│   └── users/index.ts      # Full CRUD example with validation
├── schemas/
│   └── error.ts            # Shared error response schema
└── index.ts                # Entry point
```

## Available Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start dev server with hot reload and pretty logs |
| `npm start` | Build and run production server |
| `npm run build` | Compile TypeScript to `dist/` |
| `npm test` | Run tests in watch mode |
| `npm run test:coverage` | Run tests with coverage report |
| `npm run test:ui` | Open Vitest UI |
| `npm run typecheck` | Type-check without emitting |
| `npm run check` | Lint and format with Biome |
| `npm run release` | Create a new release |

## Environment Variables

Copy `.env.example` to `.env` and customize:

```bash
# Application
NODE_ENV=development          # development | production | test
PORT=3000                     # Server port
FASTIFY_CLOSE_GRACE_DELAY=500 # Graceful shutdown delay (ms)

# CORS (production only)
CORS_ORIGINS=https://example.com,https://app.example.com

# Logging
LOG_LEVEL=info                # fatal | error | warn | info | debug | trace
```

All variables are validated at startup using Zod. See `src/config/environment.ts` for the full schema.

## Adding Routes

Create a new file in `src/routes/`. The file path determines the URL:

```typescript
// src/routes/products/index.ts → GET /products
import type { FastifyPluginAsync } from 'fastify'
import type { ZodTypeProvider } from 'fastify-type-provider-zod'
import { z } from 'zod'

const products: FastifyPluginAsync = async (fastify) => {
  fastify.withTypeProvider<ZodTypeProvider>().route({
    method: 'GET',
    url: '/',
    schema: {
      tags: ['Products'],
      summary: 'List all products',
      querystring: z.object({
        page: z.coerce.number().default(1),
        limit: z.coerce.number().default(10),
      }),
      response: {
        200: z.object({
          data: z.array(z.object({
            id: z.string(),
            name: z.string(),
          })),
        }),
      },
    },
    handler: async (request, reply) => {
      const { page, limit } = request.query
      // Your logic here
      return { data: [] }
    },
  })
}

export default products
```

See `src/routes/users/index.ts` for a complete CRUD example with all validation patterns.

## Error Handling

Use the `AppError` class or error factories for consistent error responses:

```typescript
import { AppError, Errors } from '#~/errors/app-error.js'

// Using factory functions (recommended)
throw Errors.notFound('User', userId)
throw Errors.badRequest('Invalid input', { field: 'email' })
throw Errors.unauthorized()
throw Errors.forbidden()
throw Errors.conflict('Email already exists')

// Or create custom errors
throw new AppError('Custom error message', 400, 'CUSTOM_ERROR_CODE', { extra: 'data' })
```

All errors are automatically converted to structured JSON responses:

```json
{
  "error": {
    "message": "User with id '123' not found",
    "code": "NOT_FOUND",
    "statusCode": 404,
    "details": { "resource": "User", "id": "123" }
  }
}
```

## Validation

This template uses [Zod](https://zod.dev) with [fastify-type-provider-zod](https://github.com/turkerdev/fastify-type-provider-zod) for type-safe validation. Schemas are used for:

1. **Runtime validation** - Requests are validated before reaching your handler
2. **TypeScript types** - Request/response types are inferred from schemas
3. **OpenAPI docs** - Schemas automatically generate API documentation

```typescript
// Define schemas
const CreateUserSchema = z.object({
  name: z.string().min(1).max(100),
  email: z.string().email(),
  role: z.enum(['admin', 'user']).default('user'),
})

// Use in route - types are inferred!
fastify.withTypeProvider<ZodTypeProvider>().route({
  method: 'POST',
  url: '/',
  schema: {
    body: CreateUserSchema,
    response: { 201: UserSchema },
  },
  handler: async (request, reply) => {
    // request.body is typed as { name: string, email: string, role: 'admin' | 'user' }
    const { name, email, role } = request.body
    // ...
  },
})
```

## Adding Plugins

Create a file in `src/config/plugins/`. Use `fastify-plugin` to share decorators:

```typescript
// src/config/plugins/database.ts
import fp from 'fastify-plugin'

export default fp(async (fastify) => {
  const db = await createDatabaseConnection()

  // Decorate fastify instance
  fastify.decorate('db', db)

  // Cleanup on close
  fastify.addHook('onClose', async () => {
    await db.close()
  })
}, {
  name: 'database',
  dependencies: [], // List plugin dependencies here
})

// Add TypeScript types
declare module 'fastify' {
  interface FastifyInstance {
    db: DatabaseConnection
  }
}
```

## Testing

Tests use [Vitest](https://vitest.dev) with Fastify's `inject()` method:

```typescript
import { describe, it, expect } from 'vitest'
import { app } from '../helper.js'

describe('Products API', () => {
  it('should list products', async () => {
    const response = await app.inject({
      method: 'GET',
      url: '/products',
    })

    expect(response.statusCode).toBe(200)
    expect(response.json()).toHaveProperty('data')
  })

  it('should reject invalid input', async () => {
    const response = await app.inject({
      method: 'POST',
      url: '/products',
      payload: { name: '' }, // Invalid: empty name
    })

    expect(response.statusCode).toBe(400)
    expect(response.json().error.code).toBe('VALIDATION_ERROR')
  })
})
```

Run tests:

```bash
npm test              # Watch mode
npm run test:coverage # With coverage report
npm run test:ui       # Visual UI
```

## Docker

Build and run with Docker:

```bash
# Build image
docker build -t my-app .

# Run container
docker run -p 3000:3000 -e NODE_ENV=production my-app

# Or use Docker Compose
docker compose up
```

The Dockerfile uses:
- **Multi-stage build** for smaller images
- **Distroless base** for security
- **Health checks** via `/ping` endpoint

## Git Hooks

[Lefthook](https://github.com/evilmartians/lefthook) runs on commit:

- **pre-commit**: Biome lint/format + related tests
- **pre-push**: Security audit (`npm audit`)

Install hooks after cloning:

```bash
npx lefthook install
```

## CI/CD

GitHub Actions workflows:

| Workflow | Trigger | Actions |
|----------|---------|---------|
| `pull-requests.yml` | PRs to main | Lint, typecheck, test, validate Dockerfile |
| `release.yml` | Push to main | Create release with CalVer versioning |
| `auto-merge.yml` | Dependabot PRs | Auto-merge minor/patch updates |

## Customization Checklist

When starting a new project:

1. [ ] Update `package.json` (name, description, author)
2. [ ] Update `Dockerfile` maintainer label
3. [ ] Configure `.env` for your environment
4. [ ] Remove example routes (`/example`, `/users`) or adapt them
5. [ ] Add your database plugin in `src/config/plugins/`
6. [ ] Update this README for your project

## Resources

- [Fastify Documentation](https://fastify.dev/docs/latest/)
- [Zod Documentation](https://zod.dev)
- [Biome Documentation](https://biomejs.dev)
- [Vitest Documentation](https://vitest.dev)

## License

MIT

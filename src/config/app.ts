import * as path from 'node:path'
import { fileURLToPath } from 'node:url'
import AutoLoad, { type AutoloadPluginOptions } from '@fastify/autoload'
import type { FastifyPluginAsync } from 'fastify'

/**
 * ESM (ES Modules) compatibility helpers.
 *
 * In ESM, __dirname and __filename are not available by default.
 * These lines recreate them from import.meta.url.
 *
 * import.meta.url gives us the file:// URL of the current module.
 * fileURLToPath converts it to a proper file path.
 */
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

/**
 * Application options type.
 * Extend this interface to add custom configuration options
 * that can be passed when registering the app.
 */
export type AppOptions = {
  // Add your custom options here, for example:
  // prefix?: string
  // disableRequestLogging?: boolean
} & Partial<AutoloadPluginOptions>

// Options object - passed to autoloaded plugins
const options: AppOptions = {}

/**
 * Main Application Plugin
 *
 * This is the core application setup. It uses @fastify/autoload to:
 * 1. Load all plugins from the plugins directory
 * 2. Load all routes from the routes directory
 *
 * The plugin pattern allows the entire app to be registered
 * on a Fastify instance, which is great for:
 * - Testing (register on a fresh instance per test)
 * - Microservices (compose multiple apps)
 * - Prefixing (mount entire app under /api/v1, etc.)
 *
 * @see https://fastify.dev/docs/latest/Reference/Plugins/
 * @see https://github.com/fastify/fastify-autoload
 */
const app: FastifyPluginAsync<AppOptions> = async (
  fastify,
  opts,
): Promise<void> => {
  // =========================================================================
  // PLUGINS
  // =========================================================================
  // Plugins are loaded first and can decorate the Fastify instance
  // with additional functionality (e.g., database connections, auth, etc.)
  //
  // Plugin load order is determined by:
  // 1. File name (alphabetical)
  // 2. Or explicitly via dependencies in fastify-plugin options
  //
  // All files in src/config/plugins/ are auto-loaded as plugins.
  // Use fastify-plugin wrapper to ensure decorators are shared globally.
  fastify.register(AutoLoad, {
    dir: path.join(__dirname, 'plugins'),
    options: opts,
    forceESM: true,
  })

  // =========================================================================
  // ROUTES
  // =========================================================================
  // Routes are loaded after plugins, so they have access to all decorators.
  //
  // File structure determines URL paths:
  // - src/routes/root.ts        -> /
  // - src/routes/users/index.ts -> /users
  // - src/routes/users/[id].ts  -> /users/:id (if using filesystem routing)
  //
  // Each route file should export a default FastifyPluginAsync function.
  fastify.register(AutoLoad, {
    dir: path.join(__dirname, '../routes'),
    options: opts,
    forceESM: true,
  })
}

export default app
export { app, options }

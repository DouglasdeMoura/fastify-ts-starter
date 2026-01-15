/**
 * Application Entry Point
 *
 * This file bootstraps the Fastify server and handles:
 * - Server initialization with logging
 * - Plugin registration (via app.ts)
 * - Graceful shutdown on SIGTERM/SIGINT
 *
 * Architecture overview:
 * ┌─────────────────────────────────────────────────────────────┐
 * │  index.ts (this file)                                       │
 * │  - Creates Fastify instance                                 │
 * │  - Registers app plugin                                     │
 * │  - Sets up graceful shutdown                                │
 * │  - Starts the server                                        │
 * └─────────────────────────────────────────────────────────────┘
 *            │
 *            ▼
 * ┌─────────────────────────────────────────────────────────────┐
 * │  config/app.ts                                              │
 * │  - Autoloads plugins from config/plugins/                   │
 * │  - Autoloads routes from routes/                            │
 * └─────────────────────────────────────────────────────────────┘
 *            │
 *      ┌─────┴─────┐
 *      ▼           ▼
 * ┌──────────┐ ┌──────────┐
 * │ Plugins  │ │  Routes  │
 * │ - CORS   │ │ - /      │
 * │ - Helmet │ │ - /ping  │
 * │ - Zod    │ │ - /users │
 * │ - Error  │ │ - etc.   │
 * │ - etc.   │ └──────────┘
 * └──────────┘
 */

import closeWithGrace from 'close-with-grace'
import Fastify from 'fastify'
import appService from '#~/config/app.js'
import { env } from '#~/config/environment.js'

const app = Fastify({ logger: true })

app.register(appService)

// delay is the number of milliseconds for the graceful close to finish
const closeListeners = closeWithGrace(
  { delay: env.FASTIFY_CLOSE_GRACE_DELAY },
  async ({ signal, err }) => {
    if (err) {
      app.log.error({ err }, 'server closing due to error')
    } else {
      app.log.info(`${signal} received, server closing`)
    }

    await app.close()
  },
)

// @ts-expect-error - Some properties are missing in the types
app.addHook('onClose', async (_instance, done) => {
  closeListeners.uninstall()
  done()
})

app.listen({ port: env.PORT, host: '0.0.0.0' }, (err) => {
  if (err) {
    app.log.error(err)
    process.exit(1)
  }
})

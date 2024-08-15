import closeWithGrace from 'close-with-grace'
import Fastify from 'fastify'
import appService from '~/config/app.js'
import { env } from '~/config/environment.js'

const app = Fastify({
  // We want to use pino-pretty only if there is a human watching this,
  // otherwise, we log as newline-delimited JSON.
  logger: process.stdout.isTTY
    ? { transport: { target: 'pino-pretty' } }
    : true,
})

app.register(appService)

// delay is the number of milliseconds for the graceful close to finish
const closeListeners = closeWithGrace(
  { delay: env.FASTIFY_CLOSE_GRACE_DELAY },
  async ({ err }) => {
    if (err) {
      app.log.error(err)
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

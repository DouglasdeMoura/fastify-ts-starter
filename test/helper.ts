import Fastify from 'fastify'
import { app as appService } from '../src/config/app.js'

const app = Fastify()
app.register(appService)

export { app }

import Fastify from 'fastify'
import { app as appService } from '../src/app.js'

const app = Fastify()
app.register(appService)

export { app }

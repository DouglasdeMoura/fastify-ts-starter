import http from 'node:http'
import { pino } from 'pino'

const logger = pino()

const options = {
  host: 'localhost',
  port: process.env.PORT || 3000,
  timeout: 2000,
}

const request = http.request(options, (res) => {
  logger.info(`Healthcheck status code: ${res.statusCode}`)

  if (res.statusCode === 200) {
    process.exit(0)
  }

  process.exit(1)
})

request.on('error', (err) => {
  logger.error(err)
  process.exit(1)
})

request.end()

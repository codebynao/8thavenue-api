require('dotenv').config()

import fastify, { FastifyInstance } from 'fastify'
import { IncomingMessage, Server, ServerResponse } from 'http'
import mongoose from 'mongoose'

const MONGO_URI = process.env.MONGO_URI || ''
const port = process.env.PORT || 3000

// Initialize the server
const server: FastifyInstance<
  Server,
  IncomingMessage,
  ServerResponse
> = fastify({
  ignoreTrailingSlash: true,
  logger: {
    prettyPrint: { colorize: true }
  }
})

// Routes
server.get(
  '/',
  async (request?, reply?): Promise<Object> => {
    return { hello: 'world! 🙂', testEnv: process.env.TEST_ENV }
  }
)

// Start server
const start = async () => {
  try {
    await server.listen(port, '0.0.0.0')
  } catch (err) {
    server.log.error(err)
    process.exit(1)
  }
}

// Connect the DB
mongoose
  .connect(MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  })
  .then(() => server.log.info('MongoDB connected...'))
  .catch((err: any) => server.log.error(err))

process.on('uncaughtException', (error) => {
  console.error(error)
})

process.on('unhandledRejection', (error) => {
  console.error(error)
})

start()

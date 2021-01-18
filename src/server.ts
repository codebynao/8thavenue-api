import fastify, { FastifyInstance } from 'fastify'
import { IncomingMessage, Server, ServerResponse } from 'http'
import mongoose from 'mongoose'

import authHandler from './routes/auth'
import categoryHandler from './routes/category'
import photoHandler from './routes/photo'
import userHandler from './routes/user'
import authPlugin from './plugins/auth'
import { queryStringToFilters } from './utils'

require('dotenv').config()

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
  },
  querystringParser: query => {
    return queryStringToFilters(query) // parse query string to mongodb filters with operators
  }
})

server.register(authPlugin).then(() => {
  // Routes
  server.get(
    '/',
    async (request?, reply?): Promise<Object> => {
      return { hello: 'world! 🙂' }
    }
  )
  server.register(authHandler, { prefix: '/auth' })
  server.register(categoryHandler, { prefix: '/categories' })
  server.register(photoHandler, { prefix: '/photos' })
  server.register(userHandler, { prefix: '/users' })
})

// Function to start server
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

// Start server
start()

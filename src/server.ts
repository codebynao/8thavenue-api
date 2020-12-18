import fastify, { FastifyInstance } from 'fastify'
import { IncomingMessage, Server, ServerResponse } from 'http'

const port = process.env.PORT || 3000
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

server.get(
  '/',
  async (request?, reply?): Promise<Object> => {
    return { hello: 'world! 🙂' }
  }
)

const start = async () => {
  try {
    await server.listen(port)
  } catch (err) {
    server.log.error(err)
    process.exit(1)
  }
}

process.on('uncaughtException', (error) => {
  console.error(error)
})

process.on('unhandledRejection', (error) => {
  console.error(error)
})

start()

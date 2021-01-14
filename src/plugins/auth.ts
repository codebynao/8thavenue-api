import fp from 'fastify-plugin'
import { FastifyRequest, FastifyReply, FastifyInstance, FastifyPluginOptions } from 'fastify'
import jwt from 'fastify-jwt'

export default fp(async (server: FastifyInstance, opts: FastifyPluginOptions): Promise<void> => {
  server.register(jwt, {
    secret: process.env.JWT_KEY || 'NeverShareYourSecret'
  })

  server.decorate('authenticate', async (request: FastifyRequest, reply: FastifyReply): Promise<void> => {
    try {
      await request.jwtVerify()
    } catch (err) {
      reply.send(err)
    }
  })
})

// When using .decorate you have to specify added properties for Typescript
declare module 'fastify' {
  export interface FastifyInstance {
    authenticate(): void;
  }
}

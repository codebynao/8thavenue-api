import authController from '../controllers/auth'
import { FastifyInstance } from 'fastify'

const loginSchema = {
  type: 'object',
  properties: {
    email: { type: 'string' },
    password: { type: 'string' }
  },
  required: ['email', 'password']
}

export default (server: FastifyInstance, options: Object, next: Function) => {
  server.post('/', {
    schema: {
      body: loginSchema
    }
  }, authController.login)

  next()
}

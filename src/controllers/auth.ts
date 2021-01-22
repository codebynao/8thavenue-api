import { FastifyRequest, FastifyReply } from 'fastify'
import UserModel from '../models/User'
import bcrypt from 'bcrypt-nodejs'
import httpErrors from 'http-errors'

type LoginFastifyRequest = FastifyRequest<{
  Body: {
    email: string
    password: string
  }
}>

const login = async (request: LoginFastifyRequest, reply: FastifyReply): Promise<void> => {
  try {
    const user = await UserModel.findOne({ email: request.body.email }).select({ __v: 0, createdAt: 0, updatedAt: 0, dateDeactivation: 0 })

    // Check if user credentials are valid
    if (!user || !bcrypt.compareSync(request.body.password, user.password)) {
      return reply.send(httpErrors(401, 'Invalid email and/or password.'))
    }

    if (user.isDeactivated) {
      return reply.send(httpErrors(401, 'Account deactivated. Contact admins to reactivate it.'))
    }

    // Generate JWT token
    const token = await reply.jwtSign({ id: user._id, email: user.email })

    user.lastConnection = new Date()
    await user.save()

    reply.send(token)
  } catch (error) {
    reply.log.error('error login user: ', error)
    reply.send(httpErrors(500, error.message))
  }
}

export default {
  login
}

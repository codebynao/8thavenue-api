import { FastifyRequest, FastifyReply } from 'fastify'
import UserModel from '../models/User'
import bcrypt from 'bcrypt-nodejs'

type LoginFastifyRequest = FastifyRequest<{
  Body: {
    email: string
    password: string
  }
}>

const login = async (request: LoginFastifyRequest, reply: FastifyReply): Promise<void> => {
  try {
    let user = await UserModel.findOne({ email: request.body.email }).select({ __v: 0, createdAt: 0, updatedAt: 0, dateDeactivation: 0 })

    // Check if user credentials are valid
    if (!user || !bcrypt.compareSync(request.body.password, user.password)) {
      throw new Error('Invalid email and/or password.')
    }

    if (user.isDeactivated) {
      throw new Error('Account deactivated. Contact admins to reactivate it.')
    }

    // Generate JWT token
    const token = await reply.jwtSign({ id: user._id, email: user.email })

    user.lastConnection = new Date()
    await user.save()

    user = user.toJSON()
    delete user.password
    delete user.isDeactivated

    reply.send({ token, user })
  } catch (error) {
    reply.log.error('error login user: ', error)
    reply.status(500)
    reply.send({ error: error.message })
  }
}

export default {
  login
}

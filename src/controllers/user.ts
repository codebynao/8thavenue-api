import { ISignUp, IUser, IFreelance, ICredentials } from '../interfaces/user'
import { FastifyRequest, FastifyReply } from 'fastify'
import FreelanceModel from '../models/User/Freelance'
import UserModel from '../models/User'
import { USER_TYPES } from '../config/constants'
import bcrypt from 'bcrypt-nodejs'

/**
 * REQUEST TYPES
 */
type SignUpRequest = FastifyRequest<{
  Body: ISignUp
}>

type ExtendedFastifyRequest = FastifyRequest<{
  Params: {
    id: string
  },
  Body: IUser | IFreelance,
  user: ICredentials
}>

type IdParamRequest = FastifyRequest<{
  Params: {
    id: string
  }
}>

/**
 * CONTROLLER
 */
const getAll = async (request: FastifyRequest, reply: FastifyReply) => {
  try {
    reply.send(await UserModel.find({ isDeactivated: false }).select({ __v: 0, createdAt: 0, updatedAt: 0, password: 0 }).lean())
  } catch (error) {
    reply.log.error('error getAll users: ', error)
    reply.status(500)
    reply.send({ error: error.message })
  }
}

const getOne = async (request: IdParamRequest, reply: FastifyReply) => {
  try {
    const user = await UserModel.findById(
      request.params.id
    ).select({ __v: 0, createdAt: 0, updatedAt: 0, password: 0 }).lean()
    if (!user || user.isDeactivated) {
      reply.status(404)
      return reply.send('User not found')
    }
    reply.send(user)
  } catch (error) {
    reply.log.error('error get user: ', error)
    reply.status(500)
    reply.send({ error: error.message })
  }
}

const signUp = async (request: SignUpRequest, reply: FastifyReply) => {
  try {
    const userFound = await UserModel.findOne({ email: request.body.email }, '_id').lean()
    if (userFound) {
      reply.status(400)
      return reply.send('Email address already registered')
    }

    // Hash the password
    const salt = bcrypt.genSaltSync(10)
    const hashedPwd = bcrypt.hashSync(request.body.password, salt)
    request.body.password = hashedPwd

    const userType = request.body.userType
    delete request.body.userType
    const userCreated = userType === USER_TYPES.FREELANCE ? await FreelanceModel.create({ ...request.body }) : await UserModel.create({ ...request.body })

    // We need to transform it to json to be able to remove undesired fields
    const user = userCreated.toJSON()
    delete user.password
    delete user.__v

    // Generate JWT token
    const token = await reply.jwtSign({ id: user._id, email: user.email })

    reply.send({ token, user })
  } catch (error) {
    reply.log.error('error sign up user: ', error)
    reply.status(500)
    reply.send({ error: error.message })
  }
}

const update = async (request: ExtendedFastifyRequest, reply: FastifyReply) => {
  try {
    // Check if the user sending the request is the owner of the user data to update
    const credentials: any = request.user
    if (!credentials.id || credentials.id !== request.params.id) {
      reply.status(401)
      return reply.send('Not authorised')
    }

    const user = await UserModel.findById(
      request.params.id
    ).lean()
    if (!user || user.isDeactivated) {
      reply.status(404)
      return reply.send('User not found')
    }

    delete request.body.updatedAt

    const options = {
      new: true,
      fields: { __v: 0, createdAt: 0, updatedAt: 0, password: 0 }
    }

    const updatedUser = request.body.userType === USER_TYPES.FREELANCE
      ? await FreelanceModel.findByIdAndUpdate(request.params.id, { $set: request.body }, options)
      : await UserModel.findByIdAndUpdate(request.params.id, { $set: request.body }, options)

    reply.send(updatedUser)
  } catch (error) {
    reply.log.error('error update user: ', error)
    reply.status(500)
    reply.send({ error: error.message })
  }
}

const deactivate = async (request: ExtendedFastifyRequest, reply: FastifyReply) => {
  try {
    // Check if the user sending the request is the owner of the user data to update
    const credentials: any = request.user
    if (!credentials.id || credentials.id !== request.params.id) {
      reply.status(401)
      return reply.send('Not authorised')
    }

    const user = await UserModel.findById(request.params.id).lean()
    if (!user) {
      reply.status(404)
      return reply.send('User not found')
    }
    await UserModel.findByIdAndUpdate({ _id: request.params.id }, { $set: { isDeactivated: true, dateDeactivation: new Date() } })
    reply.send(true)
  } catch (error) {
    reply.log.error('error deactivate user: ', error)
    reply.status(500)
    reply.send({ error: error.message })
  }
}
export default {
  deactivate,
  getAll,
  getOne,
  signUp,
  update
}

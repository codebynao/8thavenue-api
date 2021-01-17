import FreelanceModel from '../models/User/Freelance'
import PhotoModel from '../models/Photo'
import { ICategory } from './../interfaces/category'
import { IUser } from './../interfaces/user'
import { FastifyRequest, FastifyReply } from 'fastify'
import cloudinary from './../config/cloudinary'
import md5 from 'crypto-js/md5'

/**
 * TYPES
 */
type ExtendedFastifyRequest = FastifyRequest<{
  Params: {
    id: string
  }
  Body: {
    _id: string
    user: IUser['_id'],
    url?: string,
    isDisplayed: boolean,
    categories: Array<ICategory['_id']>,
    dominantColors: Array<string>,
    fileEncoded: string,
    fileName: string
  }
}>

type QueryFastifyRequest = FastifyRequest<{
  Querystring: {
    limit: number,
    page: number
  }
}>
/**
 * CONTROLLER
 */
const getAll = async (request: QueryFastifyRequest, reply: FastifyReply) => {
  try {
    const { limit, page } = request.query
    const skip: number = limit * (page - 1)

    const photosCount = await PhotoModel.countDocuments()
    const hasMoreResults = photosCount - (limit * page) > 0

    const photos = await PhotoModel.find({}, '-__v -createdAt -updatedAt').populate('categories', '-__v -createdAt -updatedAt').populate('user', '-__v -createdAt -updatedAt').skip(skip).limit(limit).sort({ createdAt: -1 }).lean()

    reply.send({ photos, hasMoreResults })
  } catch (error) {
    reply.log.error('error getAll photos: ', error)
    reply.status(500)
    reply.send({ error: error.message })
  }
}

const post = async (request: ExtendedFastifyRequest, reply: FastifyReply) => {
  try {
    const credentials: any = request.user
    if (!credentials.id || credentials.id !== request.body.user) {
      reply.status(401)
      return reply.send('Not authorised')
    }

    const hash = md5(Date.now() + Math.random().toString(36).replace(/[^a-z]+/g, '').substr(0, 5))
    const fileEncoded : string = request.body.fileEncoded
    const uploadResponse = await cloudinary.uploader.upload(fileEncoded, {
      public_id: `photography/${hash}`
    })

    if (uploadResponse.url === undefined) {
      reply.log.error(uploadResponse)
      reply.status(500)
      reply.send({ success: false, error: 'Error while uploading the image' })
      return
    }
    request.body.url = uploadResponse.url
    const createdPhoto = await PhotoModel.create(request.body)

    // Add photo to the freelance
    await FreelanceModel.findByIdAndUpdate(createdPhoto.user, { $addToSet: { photos: createdPhoto._id } })

    const photo = createdPhoto.toJSON()
    delete photo.__v
    reply.send(photo)
  } catch (error) {
    reply.log.error('error add photo: ', error)
    reply.status(500)
    reply.send({ error: error.message })
  }
}

const update = async (request: ExtendedFastifyRequest, reply: FastifyReply) => {
  try {
    const credentials: any = request.user
    if (!credentials.id || credentials.id !== request.body.user) {
      reply.status(401)
      return reply.send('Not authorised')
    }

    let photo = await PhotoModel.findById(request.params.id)
    if (!photo) {
      reply.status(404)
      reply.send('Photo not found')
    }
    photo = Object.assign(photo, request.body)
    await photo.save()

    reply.send(photo)
  } catch (error) {
    reply.log.error('error update photo: ', error)
    reply.status(500)
    reply.send({ error: error.message })
  }
}

const remove = async (request: ExtendedFastifyRequest, reply: FastifyReply) => {
  try {
    const photo = await PhotoModel.findById(request.params.id, 'user').lean()
    if (!photo) {
      reply.status(404)
      reply.send('Photo not found')
    }

    const credentials: any = request.user
    if (!credentials.id || credentials.id !== photo.user.toString()) {
      reply.status(401)
      return reply.send('Not authorised')
    }

    await PhotoModel.deleteOne({ _id: request.params.id })

    // Remove photo from the freelance
    await FreelanceModel.findByIdAndUpdate(photo.user, { $pull: { photos: request.params.id } })

    reply.send(true)
  } catch (error) {
    reply.log.error('error delete photo: ', error)
    reply.status(500)
    reply.send({ error: error.message })
  }
}

export default {
  getAll,
  post,
  update,
  remove
}

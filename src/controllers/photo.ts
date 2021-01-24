import FreelanceModel from '../models/User/Freelance'
import PhotoModel from '../models/Photo'
import { ICategory } from './../interfaces/category'
import { IPhotoQueryFilters } from './../interfaces/photo'
import { IUser } from './../interfaces/user'
import { FastifyRequest, FastifyReply } from 'fastify'
import httpErrors from 'http-errors'
import { uploadPhotoToCloudinary } from '../utils'

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

type UserPhotoFastifyRequest = FastifyRequest<{
  Body: {
    photoType: string
    fileEncoded: string,
    user: string
  }
}>

type QueryFastifyRequest = FastifyRequest<{
  Querystring: IPhotoQueryFilters
}>

/**
 * CONTROLLER
 */
const getAll = async (request: QueryFastifyRequest, reply: FastifyReply) => {
  try {
    const { limit, page, ...filters } = request.query
    const skip: number = limit * (page - 1)

    const photosCount = await PhotoModel.find(filters).countDocuments()
    const hasMoreResults = photosCount - (limit * page) > 0

    const photos = await PhotoModel.find(filters, '-__v -createdAt -updatedAt')
      .populate('categories', '-__v -createdAt -updatedAt')
      .populate('user', '-__v -createdAt -updatedAt -password')
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 })
      .lean()

    reply.send({
      photos, hasMoreResults, total: photosCount
    })
  } catch (error) {
    reply.log.error('error getAll photos: ', error)
    reply.send(httpErrors(500, error.message))
  }
}

const post = async (request: ExtendedFastifyRequest, reply: FastifyReply) => {
  try {
    const credentials: any = request.user
    if (!credentials.id || credentials.id !== request.body.user) {
      return reply.send(httpErrors(403))
    }

    const uploadResponse = await uploadPhotoToCloudinary(request.body.fileEncoded, 'photography')

    if (uploadResponse.url === undefined) {
      reply.log.error(uploadResponse)
      return reply.send(httpErrors(500, 'Error while uploading the image'))
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
    reply.send(httpErrors(500, error.message))
  }
}

const update = async (request: ExtendedFastifyRequest, reply: FastifyReply) => {
  try {
    const credentials: any = request.user
    if (!credentials.id || credentials.id !== request.body.user) {
      return reply.send(httpErrors(403))
    }

    let photo = await PhotoModel.findById(request.params.id)
    if (!photo) {
      return reply.send(httpErrors(404, 'Photo not found'))
    }
    photo = Object.assign(photo, request.body)
    await photo.save()

    reply.send(photo)
  } catch (error) {
    reply.log.error('error update photo: ', error)
    reply.send(httpErrors(500, error.message))
  }
}

const remove = async (request: ExtendedFastifyRequest, reply: FastifyReply) => {
  try {
    const photo = await PhotoModel.findById(request.params.id, 'user').lean()
    if (!photo) {
      return reply.send(httpErrors(404, 'Photo not found'))
    }

    const credentials: any = request.user
    if (!credentials.id || credentials.id !== photo.user.toString()) {
      return reply.send(httpErrors(403))
    }

    await PhotoModel.deleteOne({ _id: request.params.id })

    // Remove photo from the freelance
    await FreelanceModel.findByIdAndUpdate(photo.user, { $pull: { photos: request.params.id } })

    reply.send(true)
  } catch (error) {
    reply.log.error('error delete photo: ', error)
    reply.send(httpErrors(500, error.message))
  }
}

const updateUserPhoto = async (request: UserPhotoFastifyRequest, reply: FastifyReply) => {
  try {
    const credentials: any = request.user
    if (!credentials.id || credentials.id !== request.body.user) {
      return reply.send(httpErrors(403))
    }

    const uploadResponse = await uploadPhotoToCloudinary(request.body.fileEncoded, 'user')
    if (uploadResponse.url === undefined) {
      reply.log.error(uploadResponse)
      return reply.send(httpErrors(500, 'Error while uploading the image'))
    }

    const updatedUser = await FreelanceModel.findByIdAndUpdate(
      request.body.user,
      { $set: { [request.body.photoType]: uploadResponse.url } },
      { new: true, fields: { __v: 0, createdAt: 0, updatedAt: 0, password: 0 } }
    ).populate([{ path: 'photos' }, { path: 'specialties' }])

    reply.send(updatedUser)
  } catch (error) {
    reply.log.error('error update photo: ', error)
    reply.send(httpErrors(500, error.message))
  }
}

export default {
  getAll,
  post,
  update,
  remove,
  updateUserPhoto
}

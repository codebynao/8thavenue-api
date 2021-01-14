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

/**
 * CONTROLLER
 */
const getAll = async (request: ExtendedFastifyRequest, reply: FastifyReply) => {
  try {
    reply.send(await PhotoModel.find({}, '-__v').populate('categories', '-__v').populate('user', '-__v').lean())
  } catch (error) {
    console.error('error getAll photos: ', error)
    reply.status(500)
    reply.send({ error: error.message })
  }
}

const post = async (request: ExtendedFastifyRequest, reply: FastifyReply) => {
  try {
    const hash = md5(Date.now() + Math.random().toString(36).replace(/[^a-z]+/g, '').substr(0, 5))
    const fileEncoded : string = request.body.fileEncoded
    const uploadResponse = await cloudinary.uploader.upload(fileEncoded, {
      public_id: `photography/${hash}`
    })

    if (uploadResponse.url === undefined) {
      console.error(uploadResponse)
      reply.status(500)
      reply.send({ success: false, error: 'Error while uploading the image' })
      return
    }
    request.body.url = uploadResponse.url
    const createdPhoto = await PhotoModel.create(request.body)
    const photo = createdPhoto.toJSON()
    delete photo.__v
    reply.send(photo)
  } catch (error) {
    console.error('error add photo: ', error)
    reply.status(500)
    reply.send({ error: error.message })
  }
}

const update = async (request: ExtendedFastifyRequest, reply: FastifyReply) => {
  try {
    const photo = await PhotoModel.findById(request.params.id)
    if (!photo) {
      reply.status(404)
      reply.send('Photo not found')
    }

    if (request.body.url !== undefined) {
      photo.url = request.body.url
    }
    if (request.body.user !== undefined) {
      photo.user = request.body.user
    }
    if (request.body.isDisplayed !== undefined) {
      photo.isDisplayed = request.body.isDisplayed
    }
    if (request.body.categories !== undefined) {
      photo.categories = request.body.categories
    }
    if (request.body.dominantColors !== undefined) {
      photo.dominantColors = request.body.dominantColors
    }

    await photo.save()

    reply.send(photo)
  } catch (error) {
    console.error('error update photo: ', error)
    reply.status(500)
    reply.send({ error: error.message })
  }
}

const remove = async (request: ExtendedFastifyRequest, reply: FastifyReply) => {
  try {
    const photo = await PhotoModel.findById(request.params.id).lean()
    if (!photo) {
      reply.status(404)
      reply.send('Photo not found')
    }
    await PhotoModel.deleteOne({ _id: request.params.id })
    reply.send(true)
  } catch (error) {
    console.error('error update photo: ', error)
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

import CategoryModel from '../models/Category'
import { FastifyRequest, FastifyReply } from 'fastify'

/**
 * TYPES
 */
type ExtendedFastifyRequest = FastifyRequest<{
  Params: {
    id: string
  }
  Body: {
    _id: string
    slug: string
    isActivated: boolean
  }
}>

/**
 * CONTROLLER
 */
const getAll = async (request: FastifyRequest, reply: FastifyReply) => {
  try {
    reply.send(await CategoryModel.find({}, 'slug isActivated').lean())
  } catch (error) {
    console.error('error getAll categories: ', error)
    reply.status(500)
    reply.send({ error: error.message })
  }
}

const add = async (request: ExtendedFastifyRequest, reply: FastifyReply) => {
  try {
    const createdCategory = await CategoryModel.create(request.body)
    reply.send({
      _id: createdCategory._id,
      slug: createdCategory.slug,
      isActivated: createdCategory.isActivated
    })
  } catch (error) {
    console.error('error add category: ', error)
    reply.status(500)
    reply.send({ error: error.message })
  }
}

const update = async (request: ExtendedFastifyRequest, reply: FastifyReply) => {
  try {
    const category = await CategoryModel.findById(
      request.params.id,
      'slug isActivated'
    )
    if (!category) {
      reply.status(404)
      reply.send('Category not found')
    }

    category.slug = request.body.slug
    category.isActivated = request.body.isActivated

    await category.save()

    reply.send(category)
  } catch (error) {
    console.error('error update category: ', error)
    reply.status(500)
    reply.send({ error: error.message })
  }
}

const remove = async (request: ExtendedFastifyRequest, reply: FastifyReply) => {
  try {
    const category = await CategoryModel.findById(request.params.id).lean()
    if (!category) {
      reply.status(404)
      reply.send('Category not found')
    }
    await CategoryModel.deleteOne({ _id: request.params.id })
    reply.send(true)
  } catch (error) {
    console.error('error update category: ', error)
    reply.status(500)
    reply.send({ error: error.message })
  }
}
export default {
  add,
  getAll,
  update,
  remove
}

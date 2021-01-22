import categoryController from '../controllers/category'
import { FastifyInstance } from 'fastify'

const categorySchema = {
  _id: { type: 'string' },
  slug: { type: 'string' },
  isActivated: { type: 'boolean' },
  labels: { type: 'array' }
}

const paramsSchema = {
  type: 'object',
  properties: {
    id: { type: 'string' }
  }
}

const bodySchema = {
  type: 'object',
  properties: categorySchema,
  required: ['slug', 'isActivated']
}

const responseSchema = {
  200: {
    type: 'object',
    properties: categorySchema
  }
}

export default (server: FastifyInstance, options: Object, next: Function) => {
  server.get('/', categoryController.getAll)
  server.post(
    '/',
    {
      schema: {
        body: bodySchema,
        response: responseSchema
      }
    },
    categoryController.add
  )
  server.put(
    '/:id',
    {
      schema: {
        params: paramsSchema,
        body: bodySchema,
        response: responseSchema
      }
    },
    categoryController.update
  )
  server.delete('/:id', categoryController.remove)
  next()
}

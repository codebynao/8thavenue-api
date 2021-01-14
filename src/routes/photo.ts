import photoController from '../controllers/photo'
import { FastifyInstance } from 'fastify'

const photoSchema = {
  _id: { type: 'string' },
  fileEncoded: { type: 'string' },
  url: { type: 'string' },
  user: { type: 'string' },
  isDisplayed: { type: 'boolean' },
  categories: { type: 'array' },
  dominantColors: { type: 'array' }
}

const paramsSchema = {
  type: 'object',
  properties: {
    id: { type: 'string' }
  }
}

const bodySchema = {
  type: 'object',
  properties: photoSchema,
  required: ['fileEncoded', 'user', 'isDisplayed']
}

const bodyUpdateSchema = {
  type: 'object',
  properties: photoSchema,
  required: []
}

const responseSchema = {
  200: {
    type: 'object',
    properties: photoSchema
  }
}

const responsePostSchema = {
  201: {
    type: 'object',
    properties: photoSchema
  }
}

export default (server: FastifyInstance, options: Object, next: Function) => {
  server.get('/', photoController.getAll)
  server.post(
    '/',
    {
      schema: {
        body: bodySchema,
        response: responsePostSchema
      }
    },
    photoController.post
  )
  server.put(
    '/:id',
    {
      schema: {
        params: paramsSchema,
        body: bodyUpdateSchema,
        response: responseSchema
      }
    },
    photoController.update
  )
  server.delete('/:id', photoController.remove)
  next()
}

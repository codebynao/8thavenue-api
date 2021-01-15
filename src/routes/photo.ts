import photoController from '../controllers/photo'
import { FastifyInstance } from 'fastify'
import { LIMIT_QUERY_RESULTS } from '../config/constants'

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
  server.get('/', {
    schema: {
      querystring: {
        type: 'object',
        properties: {
          limit: { type: 'number', default: LIMIT_QUERY_RESULTS },
          page: { type: 'number', default: 1 }
        }
      }
    }
  }, photoController.getAll)
  server.post(
    '/',
    {
      schema: {
        body: bodySchema,
        response: responsePostSchema
      },
      preHandler: [server.authenticate]
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
      },
      preHandler: [server.authenticate]
    },
    photoController.update
  )
  server.delete('/:id', {
    schema: {
      params: paramsSchema
    },
    preHandler: [server.authenticate]
  }, photoController.remove)
  next()
}

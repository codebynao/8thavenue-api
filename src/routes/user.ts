import userController from '../controllers/user'
import { FastifyInstance } from 'fastify'
import { FREELANCE_PLANS_VALUES, LINKS_NAMES, MIN_PASSWORD_LENGTH } from '../config/constants'

const signUpSchema = {
  type: 'object',
  properties: {
    userType: { type: 'string' },
    firstName: { type: 'string' },
    lastName: { type: 'string' },
    email: { type: 'string' },
    password: { type: 'string', minLength: MIN_PASSWORD_LENGTH }
  },
  required: ['userType', 'firstName', 'lastName', 'email', 'password']
}

const paramsSchema = {
  type: 'object',
  properties: {
    id: { type: 'string' }
  }
}

const userBodySchema = {
  type: 'object',
  properties: {
    _id: { type: 'string' },
    userType: { type: 'string' },
    plan: { type: 'string', enum: FREELANCE_PLANS_VALUES },
    profilePicture: { type: ['string', 'null'] },
    firstName: { type: 'string' },
    lastName: { type: 'string' },
    email: { type: 'string' },
    phone: { type: ['string', 'null'] },
    displayContactInfo: { type: 'boolean' },
    siret: { type: ['string', 'null'] },
    isVerified: { type: 'boolean' },
    lastConnection: { type: 'string' },
    createdAt: { type: ['string', 'null'] },
    updatedAt: { type: ['string', 'null'] },
    isDeactivated: { type: ['boolean', 'null'] }
  },
  required: ['_id', 'userType', 'plan', 'firstName', 'lastName', 'email', 'phone', 'displayContactInfo', 'isVerified']
}

const freelanceBodySchema = {
  type: 'object',
  properties: {
    ...userBodySchema.properties,
    photos: { type: 'array', items: { type: 'string' } },
    banner: { type: ['string', 'null'] },
    localisation: {
      type: 'object',
      properties: {
        zipCode: { type: 'string' },
        country: { type: 'string' },
        coordinates: {
          type: 'object',
          properties: {
            latitude: { type: 'number' },
            longitude: { type: 'number' }
          }
        }
      }
    },
    isAvailable: { type: 'boolean' },
    dailyCost: { type: ['number', 'null'] },
    skills: { type: 'array', items: { type: 'string' } },
    workDistance: { type: 'number' },
    remote: { type: 'boolean' },
    biography: { type: 'string' },
    links: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          name: { type: 'string', enum: LINKS_NAMES },
          url: { type: 'string' }
        }
      }
    },
    specialties: {
      type: 'array',
      items: { type: 'string' }
    }
  },
  required: userBodySchema.required.concat(['photos', 'isAvailable', 'skills', 'workDistance', 'remote', 'biography', 'specialties'])
}

export default (server: FastifyInstance, options: Object, next: Function) => {
  server.get('/', userController.getAll)

  server.get('/:id', userController.getOne)

  server.post(
    '/',
    {
      schema: {
        body: signUpSchema
      }
    },
    userController.signUp
  )

  server.put('/:id', {
    schema: {
      params: paramsSchema,
      body: {
        anyOf: [userBodySchema, freelanceBodySchema]
      }
    },
    preHandler: [server.authenticate]
  }, userController.update)

  server.delete('/:id', {
    schema: {
      params: paramsSchema
    },
    preHandler: [server.authenticate]
  }, userController.deactivate)

  next()
}

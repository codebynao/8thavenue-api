import { Model, Schema } from 'mongoose'
import { IFreelance } from '../../interfaces/user'
import { LINKS_NAMES } from '../../config/constants'
import User from './index'

const FreelanceSchema: Model<IFreelance> = User.discriminator(
  'userType',
  new Schema({
    photos: {
      type: [
        {
          type: Schema.Types.ObjectId,
          ref: 'Photo'
        }
      ],
      default: []
    },
    banner: { type: String, default: undefined },
    localisation: {
      type: {

        zipCode: { type: String, required: true },
        country: { type: String, required: true },
        coordinates: {
          type: {
            latitude: { type: Number, required: true },
            longitude: { type: Number, required: true }
          },
          default: {}
        }
      },
      default: {}
    },
    isAvailable: { type: Boolean, default: true },
    dailyCost: { type: Number, default: undefined },
    skills: {
      type: [
        String
      ],
      default: []
    },
    workDistance: { type: Number, default: 0 },
    remote: { type: Boolean, default: false },
    biography: { type: String, default: '' },
    links: {
      type: [{
        name: { type: String, enum: LINKS_NAMES, required: true },
        url: { type: String, required: true }
      }],
      default: []
    },
    specialties: {
      type: [{
        type: Schema.Types.ObjectId,
        ref: 'Category'

      }],
      default: []
    }
  }),
  'freelance'
)

export default FreelanceSchema

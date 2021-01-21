'use strict'
import { model, Schema } from 'mongoose'
import { IPhoto } from 'src/interfaces/photo'

const PhotoSchema = new Schema(
  {
    url: {
      type: String,
      required: true
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    // Is displayed on the user profile page
    isDisplayed: {
      type: Boolean,
      required: true
    },
    categories: {
      type: [
        {
          type: Schema.Types.ObjectId,
          ref: 'Category'
        }
      ],
      default: [],
      required: false
    },
    dominantColors: {
      type: [
        {
          type: String
        }
      ],
      default: [],
      required: false
    },
    // Will be true if its user is deactivated
    isHidden: {
      type: Boolean,
      default: false
    }
  },
  {
    timestamps: true
  }
)

// Exports the model and returns the interface
export default model<IPhoto>('Photo', PhotoSchema)

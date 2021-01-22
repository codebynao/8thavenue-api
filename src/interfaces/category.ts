import { Document } from 'mongoose'

export interface ICategory extends Document {
  slug: string
  isActivated: boolean
  labels: Array<Object>
}

import { Document } from 'mongoose'

export interface ILabel {
  locale: string
  value: string
}

export interface ICategory extends Document {
  slug: string
  isActivated: boolean
  labels: Array<ILabel>
}

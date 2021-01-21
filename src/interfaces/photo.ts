import { Document } from 'mongoose'
import { ICategory } from './category'
import { IUser } from './user'

export interface IPhoto extends Document {
  url: string,
  user: IUser['_id'],
  isDisplayed: boolean,
  categories: Array<ICategory['_id']>,
  dominantColors: Array<string>,
}

export interface IPhotoQueryFilters {
  limit: number,
  page: number,
  dominantColors: object,
  categories: object
}

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

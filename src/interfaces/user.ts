import { Document } from 'mongoose'
import { ICategory } from '../interfaces/category'

export interface IUser extends Document {
  userType?: string
  plan: string
  profilePicture?: string
  firstName: string
  lastName: string
  email: string
  phone: string
  displayContactInfo: boolean
  siret?: string
  isVerified: boolean
  lastConnection: Date
  password?: string,
  createdAt?: Date,
  updatedAt?: Date,
  isDeactivated?: boolean
}

export interface IFreelance extends IUser {
  photos: string[]
  banner?: string
  localisation?: {
    zipCode: string
    country: string
    coordinates: {
      latitude: string,
      longitude: string
    }
  }
  isAvailable: boolean
  dailyCost?: number
  skills: string[]
  workDistance: number
  remote: boolean
  biography: string
  links?: {
    name: string
    url: string
  }[]
  specialties: Array<ICategory['_id']|ICategory>
}

export interface ISignUp {
  userType?: string
  firstName: string
  lastName: string
  email: string
  password: string
}

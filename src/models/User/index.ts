import { model, Schema } from 'mongoose'
import { IUser } from '../../interfaces/user'
import { DEFAULT_FREELANCE_PLAN, FREELANCE_PLANS_VALUES, MIN_PASSWORD_LENGTH } from '../../config/constants'

const UserSchema: Schema = new Schema(
  {
    plan: { type: String, enum: FREELANCE_PLANS_VALUES, default: DEFAULT_FREELANCE_PLAN.value },
    profilePicture: { type: String, default: undefined },
    firstName: { type: String, required: true, index: true },
    lastName: { type: String, required: true, index: true },
    email: { type: String, required: true, unique: true },
    phone: { type: String, default: null },
    displayContactInfo: { type: Boolean, default: true },
    siret: { type: String, default: undefined },
    isVerified: { type: Boolean, default: false },
    lastConnection: { type: Date, default: Date.now },
    password: { type: String, required: true, min: MIN_PASSWORD_LENGTH },
    isDeactivated: { type: Boolean, default: false },
    dateDeactivation: { type: Date, default: undefined }
  },
  {
    discriminatorKey: 'userType',
    timestamps: true
  }
)

export default model<IUser>('User', UserSchema)

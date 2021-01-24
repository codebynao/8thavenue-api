const DEFAULT_FREELANCE_PLAN = {
  value: 'free',
  price: '0'
}

const config = {
  DEFAULT_FREELANCE_PLAN,
  FREELANCE_PLANS: {
    FREE: DEFAULT_FREELANCE_PLAN,
    PREMIUM: {
      value: 'premium',
      price: '20'
    }
  },
  LIMIT_QUERY_RESULTS: 20,
  LINKS_NAMES: ['website', 'instagram', 'twitter', 'pinterest'],
  MAX_ALL_USERS_PHOTOS: 6,
  MIN_PASSWORD_LENGTH: 8,
  USER_PHOTO_TYPES: ['banner', 'profilePicture'],
  USER_TYPES: {
    CLIENT: 'client',
    FREELANCE: 'freelance'
  }
}

config.FREELANCE_PLANS_VALUES = Object.values(config.FREELANCE_PLANS).map(plan => plan.value)
module.exports = config

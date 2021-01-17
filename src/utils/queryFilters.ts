import qs from 'qs'
import { isArray, mapKeys, isNil, isObject, isBoolean, isEmpty, omitBy } from 'lodash'
import { IUserQueryFilters } from '../interfaces/user'

const parse = (value: any): any => {
  try {
    return JSON.parse(value)
  } catch (error) {
    return value
  }
}

export const getFreelanceQueryFilters = (queryObject: IUserQueryFilters): object => {
  try {
    const { limit, page, zipCode, country, ...query } = queryObject
    const allowedFilters = ['remote', 'skills', 'specialties', 'isAvailable', 'lastConnection', 'workDistance', 'dailyCost', 'zipCode', 'country']
    const filters = qs.parse(qs.stringify(query, { encode: false }), { comma: true })

    for (const [key, value] of Object.entries(filters)) {
      if (!allowedFilters.includes(key)) {
        filters[key] = undefined
        continue
      }

      const parsedValue = parse(value)

      if (isArray(parsedValue)) { // if it's an array this implies that the match should be with $in operator
        filters[key] = { $in: parsedValue }
      } else if (isObject(parsedValue)) { // if it's an object this implies that the match should be with comparison operators
        filters[key] = mapKeys(parsedValue, (v, k) => {
          return `$${k}`
        })
      } else { // we just use the parsed value
        filters[key] = parsedValue
      }
    }

    return {
      ...omitBy({
        ...filters,
        localisation: { // append specific filters
          ...(!isNil(zipCode) && { zipCode }), // by zipCode
          ...(!isNil(country) && { country }) // by country
        }
      }, item => !isBoolean(item) && isEmpty(item)), // we ensure to remove empty values
      isDeactivated: false // we ensure to have only non deactivated accounts
    }
  } catch (error) {
    return { isDeactivated: false }
  }
}

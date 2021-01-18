import qs from 'qs'
import { isArray, mapKeys, isObject } from 'lodash'

const parse = (value: any): any => {
  try {
    return JSON.parse(value)
  } catch (error) {
    return value
  }
}

export const queryStringToFilters = (queryString: string): any => {
  try {
    const filters = qs.parse(decodeURI(queryString), {
      comma: true,
      plainObjects: true,
      strictNullHandling: true
    })

    for (const [key, value] of Object.entries(filters)) {
      const parsedValue = parse(value) // evalutes elements like arrays, objects, booleans
      // parse('{}')
      // => {}
      // parse('true')
      // => true
      // parse('[]')
      // => true

      if (isArray(parsedValue)) { // if it's an array this implies that the match should be with $in operator
        filters[key] = { $in: parsedValue }
      } else if (isObject(parsedValue)) { // if it's an object this implies that the match should be with comparison operators
        filters[key] = mapKeys(parsedValue, (v, k) => {
          return k.replace(/\b(gt|gte|lt|lte|in)\b/g, '$$' + '$1')
        })
      } else { // we just use the parsed value
        filters[key] = parsedValue
      }
    }

    return filters // we ensure to remove empty values
  } catch (error) {
    return {}
  }
}

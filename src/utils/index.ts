import qs from 'qs'
import { isArray, transform, isObject } from 'lodash'
import cloudinary from './../config/cloudinary'
import md5 from 'crypto-js/md5'

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
        filters[key] = transform(parsedValue, (r: any, v: any, k: string) => {
          const newKey = k.replace(/\b(eq|ne|not|gt|gte|lt|lte|in|nin|all)\b/g, '$$' + '$1')
          r[newKey] = parse(v)
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

export const uploadPhotoToCloudinary = async (fileEncoded: string, folder: string) => {
  const hash = md5(Date.now() + Math.random().toString(36).replace(/[^a-z]+/g, '').substr(0, 5))
  return await cloudinary.uploader.upload(fileEncoded, {
    public_id: `${folder}/${hash}`
  })
}

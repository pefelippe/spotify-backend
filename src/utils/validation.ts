import { FOLLOW_TYPES } from '../constants'

export const validateFollowUnfollowBody = (
  body: any
): body is { type: 'artist' | 'user'; ids: string[] } => {
  return (
    body &&
    typeof body.type === 'string' &&
    FOLLOW_TYPES.includes(body.type as 'artist' | 'user') &&
    Array.isArray(body.ids) &&
    body.ids.length > 0 &&
    body.ids.every((id: unknown) => typeof id === 'string')
  )
}

export const validateTokenFormat = (token: string): boolean => {
  const parts = token.split('.')
  if (parts.length !== 3) {
    return false
  }

  try {
    parts.forEach((part) => {
      if (!part || part.length === 0) {
        throw new Error('Empty token part')
      }
      Buffer.from(part, 'base64')
    })
    return true
  } catch (error) {
    return false
  }
}

export const createFieldValidator =
  (rule: {
    field: string
    required?: boolean
    type?: 'string' | 'number' | 'boolean' | 'array'
    validator?: (value: unknown) => boolean
    message?: string
  }) =>
  (value: unknown): string | null => {
    if (rule.required && (value === undefined || value === null || value === '')) {
      return rule.message || `${rule.field} is required`
    }

    if (!rule.required && (value === undefined || value === null || value === '')) {
      return null
    }

    if (rule.type) {
      switch (rule.type) {
        case 'string':
          if (typeof value !== 'string') {
            return `${rule.field} must be a string`
          }
          break
        case 'number':
          if (typeof value !== 'number' || isNaN(value)) {
            return `${rule.field} must be a number`
          }
          break
        case 'boolean':
          if (typeof value !== 'boolean') {
            return `${rule.field} must be a boolean`
          }
          break
        case 'array':
          if (!Array.isArray(value)) {
            return `${rule.field} must be an array`
          }
          break
      }
    }

    if (rule.validator && !rule.validator(value)) {
      return rule.message || `${rule.field} is invalid`
    }

    return null
  }

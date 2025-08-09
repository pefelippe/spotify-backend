import { Request, Response, NextFunction } from 'express'
import { createValidationError } from '../utils/errors'
import { createFieldValidator } from '../utils/validation'
import { FOLLOW_TYPES, VALIDATION_RULES } from '../constants'

interface ValidationRule {
  field: string
  required?: boolean
  type?: 'string' | 'number' | 'boolean' | 'array'
  validator?: (value: unknown) => boolean
  message?: string
}

const validateBody =
  (rules: ValidationRule[]) =>
  (req: Request, res: Response, next: NextFunction): void => {
    const errors: string[] = []

    for (const rule of rules) {
      const validator = createFieldValidator(rule)
      const value = req.body[rule.field]
      const error = validator(value)

      if (error) {
        errors.push(error)
      }
    }

    if (errors.length > 0) {
      const error = createValidationError('Validation failed', { errors })
      return next(error)
    }

    next()
  }

const validateQuery =
  (rules: ValidationRule[]) =>
  (req: Request, res: Response, next: NextFunction): void => {
    const errors: string[] = []

    for (const rule of rules) {
      const validator = createFieldValidator(rule)
      const value = req.query[rule.field]
      const error = validator(value)

      if (error) {
        errors.push(error)
      }
    }

    if (errors.length > 0) {
      const error = createValidationError('Validation failed', { errors })
      return next(error)
    }

    next()
  }

const validateParams =
  (rules: ValidationRule[]) =>
  (req: Request, res: Response, next: NextFunction): void => {
    const errors: string[] = []

    for (const rule of rules) {
      const validator = createFieldValidator(rule)
      const value = req.params[rule.field]
      const error = validator(value)

      if (error) {
        errors.push(error)
      }
    }

    if (errors.length > 0) {
      const error = createValidationError('Validation failed', { errors })
      return next(error)
    }

    next()
  }

export const createValidationMiddleware = {
  body: validateBody,
  query: validateQuery,
  params: validateParams,
}

export const validationRules = {
  required: {
    refresh_token: { field: 'refresh_token', required: true, type: 'string' as const },
    code: { field: 'code', required: true, type: 'string' as const },
    type: {
      field: 'type',
      required: true,
      type: 'string' as const,
      validator: (value: unknown): boolean => {
        return typeof value === 'string' && FOLLOW_TYPES.includes(value as 'artist' | 'user')
      },
    },
    ids: {
      field: 'ids',
      required: true,
      type: 'array' as const,
      validator: (value: unknown): boolean => {
        return Array.isArray(value) && value.length > 0
      },
    },
    playlistId: { field: 'playlistId', required: true, type: 'string' as const },
    imageBase64: { field: 'imageBase64', required: true, type: 'string' as const },
  },
  optional: {
    limit: {
      field: 'limit',
      type: 'number' as const,
      validator: (value: unknown): boolean => {
        return (
          typeof value === 'number' &&
          value >= VALIDATION_RULES.MIN_LIMIT &&
          value <= VALIDATION_RULES.MAX_LIMIT
        )
      },
    },
    offset: {
      field: 'offset',
      type: 'number' as const,
      validator: (value: unknown): boolean => {
        return typeof value === 'number' && value >= VALIDATION_RULES.MIN_OFFSET
      },
    },
    after: { field: 'after', type: 'string' as const },
  },
}

import { Request, Response, NextFunction } from 'express'
import { createValidationError } from '../utils/errors'
import { createFieldValidator } from '../utils/validation'

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
  },
  optional: {},
}

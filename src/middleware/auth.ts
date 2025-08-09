import { Request, Response, NextFunction } from 'express'
import { RequestWithAuth } from '../types'
import { createAuthenticationError } from '../utils/errors'
import { createLogger } from '../utils/logger'
import { extractBearerToken } from '../utils/http'
import { validateTokenFormat } from '../utils/validation'

const logger = createLogger('AuthMiddleware')

export const requireBearerToken = (req: Request, _res: Response, next: NextFunction): void => {
  const token = extractBearerToken(req.headers.authorization)

  if (!token) {
    const error = createAuthenticationError('Missing or invalid Authorization header')
    logger.warn('Missing authorization header', { path: req.path, method: req.method })
    return next(error)
  }

  if (!validateTokenFormat(token)) {
    const error = createAuthenticationError('Invalid token format')
    logger.warn('Invalid token format', { path: req.path, method: req.method })
    return next(error)
  }

  ;(req as RequestWithAuth).accessToken = token
  next()
}

export const optionalBearerToken = (req: Request, _res: Response, next: NextFunction): void => {
  const token = extractBearerToken(req.headers.authorization)

  if (token && validateTokenFormat(token)) {
    ;(req as RequestWithAuth).accessToken = token
  }

  next()
}

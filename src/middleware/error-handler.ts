import { Request, Response } from 'express'
import { AppError, ApiResponse } from '../types'
import { isAppError, createInternalServerError } from '../utils/errors'
import { createLogger } from '../utils/logger'
import { createMetaResponse } from '../utils/http'

const logger = createLogger('ErrorHandler')

export const errorHandler = (error: Error | AppError, req: Request, res: Response): void => {
  let appError: AppError

  if (isAppError(error)) {
    appError = error
  } else {
    logger.error(
      'Unexpected error:',
      {
        message: error.message,
        stack: error.stack,
        path: req.path,
        method: req.method,
        timestamp: new Date().toISOString(),
      },
      error
    )
    appError = createInternalServerError(error.message)
  }

  const response: ApiResponse = {
    error: appError,
    meta: createMetaResponse(req.path, req.method),
  }

  res.status(appError.status).json(response)
}

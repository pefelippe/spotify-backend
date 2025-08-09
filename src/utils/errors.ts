import { AppError } from '../types'

export const createAppError = (
  status: number,
  message: string,
  code: string,
  details?: Record<string, unknown>
): AppError => ({
  status,
  message,
  code,
  details,
})

export const createValidationError = (
  message: string,
  details?: Record<string, unknown>
): AppError => createAppError(400, message, 'VALIDATION_ERROR', details)

export const createAuthenticationError = (message: string = 'Authentication required'): AppError =>
  createAppError(401, message, 'AUTHENTICATION_ERROR')

export const createAuthorizationError = (message: string = 'Insufficient permissions'): AppError =>
  createAppError(403, message, 'AUTHORIZATION_ERROR')

export const createNotFoundError = (resource: string): AppError =>
  createAppError(404, `${resource} not found`, 'NOT_FOUND_ERROR')

export const createConflictError = (message: string): AppError =>
  createAppError(409, message, 'CONFLICT_ERROR')

export const createInternalServerError = (message: string = 'Internal server error'): AppError =>
  createAppError(500, message, 'INTERNAL_SERVER_ERROR')

export const createExternalServiceError = (service: string, message: string): AppError =>
  createAppError(502, `External service error: ${message}`, 'EXTERNAL_SERVICE_ERROR', { service })

export const isAppError = (error: unknown): error is AppError => {
  return typeof error === 'object' && error !== null && 'status' in error && 'code' in error
}

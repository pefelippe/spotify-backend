import { Request, Response, NextFunction } from 'express'

jest.mock('../../../src/utils/errors')
jest.mock('../../../src/utils/logger')
jest.mock('../../../src/utils/http')
jest.mock('../../../src/utils/validation')

const mockLogger = {
  warn: jest.fn(),
  error: jest.fn(),
  info: jest.fn(),
  debug: jest.fn(),
}

jest.mocked(require('../../../src/utils/logger')).createLogger = jest.fn().mockReturnValue(mockLogger)

import { requireBearerToken, optionalBearerToken } from '../../../src/middleware/auth'

const mockCreateAuthenticationError = jest.fn()
jest.mocked(require('../../../src/utils/errors')).createAuthenticationError = mockCreateAuthenticationError

const mockExtractBearerToken = jest.fn()
jest.mocked(require('../../../src/utils/http')).extractBearerToken = mockExtractBearerToken

const mockValidateTokenFormat = jest.fn()
jest.mocked(require('../../../src/utils/validation')).validateTokenFormat = mockValidateTokenFormat

describe('Auth Middleware', () => {
  let mockRequest: Partial<Request>
  let mockResponse: Partial<Response>
  let mockNext: NextFunction

  beforeEach(() => {
    jest.clearAllMocks()
    
    mockRequest = {
      path: '/test',
      method: 'GET',
      headers: {},
    }

    mockResponse = {}
    mockNext = jest.fn()

    mockExtractBearerToken.mockReturnValue(null)
    mockValidateTokenFormat.mockReturnValue(false)
    mockCreateAuthenticationError.mockImplementation((message) => new Error(message) as any)
  })

  describe('requireBearerToken', () => {
    it('should call next() when valid bearer token is provided', () => {
      const validToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c'
      
      mockExtractBearerToken.mockReturnValue(validToken)
      mockValidateTokenFormat.mockReturnValue(true)

      requireBearerToken(mockRequest as Request, mockResponse as Response, mockNext)

      expect(mockNext).toHaveBeenCalledWith()
      expect((mockRequest as any).accessToken).toBe(validToken)
    })

    it('should return error when no authorization header is provided', () => {
      mockExtractBearerToken.mockReturnValue(null)

      requireBearerToken(mockRequest as Request, mockResponse as Response, mockNext)

      expect(mockCreateAuthenticationError).toHaveBeenCalledWith('Missing or invalid Authorization header')
      expect(mockNext).toHaveBeenCalledWith(expect.any(Error))
      expect((mockRequest as any).accessToken).toBeUndefined()
    })

    it('should return error when token format is invalid', () => {
      const invalidToken = 'invalid-token'
      
      mockExtractBearerToken.mockReturnValue(invalidToken)
      mockValidateTokenFormat.mockReturnValue(false)

      requireBearerToken(mockRequest as Request, mockResponse as Response, mockNext)

      expect(mockCreateAuthenticationError).toHaveBeenCalledWith('Invalid token format')
      expect(mockNext).toHaveBeenCalledWith(expect.any(Error))
      expect((mockRequest as any).accessToken).toBeUndefined()
    })
  })

  describe('optionalBearerToken', () => {
    it('should set accessToken when valid bearer token is provided', () => {
      const validToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c'
      
      mockExtractBearerToken.mockReturnValue(validToken)
      mockValidateTokenFormat.mockReturnValue(true)

      optionalBearerToken(mockRequest as Request, mockResponse as Response, mockNext)

      expect(mockNext).toHaveBeenCalledWith()
      expect((mockRequest as any).accessToken).toBe(validToken)
    })

    it('should not set accessToken when no authorization header is provided', () => {
      mockExtractBearerToken.mockReturnValue(null)

      optionalBearerToken(mockRequest as Request, mockResponse as Response, mockNext)

      expect(mockNext).toHaveBeenCalledWith()
      expect((mockRequest as any).accessToken).toBeUndefined()
    })

    it('should not set accessToken when token format is invalid', () => {
      const invalidToken = 'invalid-token'
      
      mockExtractBearerToken.mockReturnValue(invalidToken)
      mockValidateTokenFormat.mockReturnValue(false)

      optionalBearerToken(mockRequest as Request, mockResponse as Response, mockNext)

      expect(mockNext).toHaveBeenCalledWith()
      expect((mockRequest as any).accessToken).toBeUndefined()
    })
  })
}) 
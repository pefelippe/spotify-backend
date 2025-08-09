import { Request, Response, NextFunction } from 'express'

jest.mock('../../../src/services/spotify.service')
jest.mock('../../../src/utils/errors')
jest.mock('../../../src/utils/http')
jest.mock('../../../src/config/app.config')
jest.mock('../../../src/utils/build-query-string')

const mockAuthService = {
  getToken: jest.fn(),
  getRefreshToken: jest.fn(),
  validateToken: jest.fn(),
}

const mockConfig = {
  spotify: {
    clientId: 'test-client-id',
    clientSecret: 'test-client-secret',
    redirectUri: 'http://localhost:3001/auth/callback',
    scopes: ['user-read-private', 'user-read-email'],
  },
}

const mockGetAppConfig = jest.fn().mockReturnValue(mockConfig)
jest.mock('../../../src/config/app.config', () => ({
  getAppConfig: mockGetAppConfig,
}))

const mockCreateValidationError = jest.fn()
jest.mock('../../../src/utils/errors', () => ({
  createValidationError: mockCreateValidationError,
}))

const mockCreateMetaResponse = jest.fn()
jest.mock('../../../src/utils/http', () => ({
  createMetaResponse: mockCreateMetaResponse,
  createAuthHeaders: jest.fn(),
  extractBearerToken: jest.fn(),
}))

const mockBuildQueryString = jest.fn()
jest.mock('../../../src/utils/build-query-string', () => ({
  buildQueryString: mockBuildQueryString,
}))

import { createAuthController } from '../../../src/controllers/auth.controller'

describe('Auth Controller', () => {
  let authController: ReturnType<typeof createAuthController>
  let mockRequest: Partial<Request>
  let mockResponse: Partial<Response>
  let mockNext: NextFunction

  beforeEach(() => {
    jest.clearAllMocks()
    
    authController = createAuthController({
      authService: mockAuthService as any,
      config: mockConfig as any,
    })

    mockRequest = {
      method: 'GET',
      path: '/auth/login',
      query: {},
      body: {},
    }

    mockResponse = {
      redirect: jest.fn(),
      json: jest.fn(),
      status: jest.fn().mockReturnThis(),
    }

    mockNext = jest.fn()

    mockCreateValidationError.mockImplementation((message) => new Error(message) as any)
    mockCreateMetaResponse.mockReturnValue({ timestamp: '2023-01-01T00:00:00.000Z', path: '/test', method: 'GET' })
    mockBuildQueryString.mockReturnValue('client_id=test&response_type=code&redirect_uri=http%3A%2F%2Flocalhost%3A3001%2Fauth%2Fcallback&scope=user-read-private+user-read-email')
  })

  describe('login', () => {
    it('should redirect to Spotify authorization URL', () => {
      authController.login(mockRequest as Request, mockResponse as Response)

      expect(mockBuildQueryString).toHaveBeenCalledWith({
        client_id: 'test-client-id',
        response_type: 'code',
        redirect_uri: 'http://localhost:3001/auth/callback',
        scope: 'user-read-private user-read-email',
      })
      expect(mockResponse.redirect).toHaveBeenCalledWith(
        expect.stringContaining('https://accounts.spotify.com/authorize?')
      )
    })
  })

  describe('callback', () => {
    it('should handle successful authorization callback', async () => {
      const mockTokenResponse = {
        access_token: 'test-access-token',
        token_type: 'Bearer',
        expires_in: 3600,
        refresh_token: 'test-refresh-token',
        scope: 'user-read-private user-read-email',
      }

      mockAuthService.getToken.mockResolvedValue(mockTokenResponse)
      mockCreateMetaResponse.mockReturnValue({ timestamp: '2023-01-01T00:00:00.000Z', path: '/callback', method: 'GET' })

      const requestWithCode = {
        ...mockRequest,
        query: { code: 'test-auth-code' },
        path: '/callback',
        method: 'GET',
      } as Request

      await authController.callback(
        requestWithCode,
        mockResponse as Response,
        mockNext
      )

      expect(mockAuthService.getToken).toHaveBeenCalledWith('test-auth-code')
      expect(mockResponse.json).toHaveBeenCalledWith({
        data: mockTokenResponse,
        meta: { timestamp: '2023-01-01T00:00:00.000Z', path: '/callback', method: 'GET' },
      })
      expect(mockNext).not.toHaveBeenCalled()
    })

    it('should handle missing authorization code', async () => {
      const requestWithoutCode = {
        ...mockRequest,
        query: {},
      } as Request

      await authController.callback(
        requestWithoutCode,
        mockResponse as Response,
        mockNext
      )

      expect(mockCreateValidationError).toHaveBeenCalledWith('Missing authorization code')
      expect(mockNext).toHaveBeenCalledWith(expect.any(Error))
      expect(mockAuthService.getToken).not.toHaveBeenCalled()
    })

    it('should handle Spotify error in callback', async () => {
      const requestWithError = {
        ...mockRequest,
        query: { error: 'access_denied' },
      } as Request

      await authController.callback(
        requestWithError,
        mockResponse as Response,
        mockNext
      )

      expect(mockCreateValidationError).toHaveBeenCalledWith('Spotify error: access_denied')
      expect(mockNext).toHaveBeenCalledWith(expect.any(Error))
      expect(mockAuthService.getToken).not.toHaveBeenCalled()
    })

    it('should handle service errors', async () => {
      const error = new Error('Service error')
      mockAuthService.getToken.mockRejectedValue(error)

      const requestWithCode = {
        ...mockRequest,
        query: { code: 'test-auth-code' },
      } as Request

      await authController.callback(
        requestWithCode,
        mockResponse as Response,
        mockNext
      )

      expect(mockNext).toHaveBeenCalledWith(error)
      expect(mockResponse.json).not.toHaveBeenCalled()
    })
  })

  describe('refreshToken', () => {
    it('should successfully refresh token', async () => {
      const mockTokenResponse = {
        access_token: 'new-access-token',
        token_type: 'Bearer',
        expires_in: 3600,
        scope: 'user-read-private user-read-email',
      }

      mockAuthService.getRefreshToken.mockResolvedValue(mockTokenResponse)
      mockCreateMetaResponse.mockReturnValue({ timestamp: '2023-01-01T00:00:00.000Z', path: '/refresh', method: 'POST' })

      const requestWithRefreshToken = {
        ...mockRequest,
        body: { refresh_token: 'test-refresh-token' },
        path: '/refresh',
        method: 'POST',
      } as Request

      await authController.refreshToken(
        requestWithRefreshToken,
        mockResponse as Response,
        mockNext
      )

      expect(mockAuthService.getRefreshToken).toHaveBeenCalledWith('test-refresh-token')
      expect(mockResponse.json).toHaveBeenCalledWith({
        data: mockTokenResponse,
        meta: { timestamp: '2023-01-01T00:00:00.000Z', path: '/refresh', method: 'POST' },
      })
      expect(mockNext).not.toHaveBeenCalled()
    })

    it('should handle missing refresh token', async () => {
      const requestWithoutRefreshToken = {
        ...mockRequest,
        body: {},
      } as Request

      await authController.refreshToken(
        requestWithoutRefreshToken,
        mockResponse as Response,
        mockNext
      )

      expect(mockCreateValidationError).toHaveBeenCalledWith('Missing refresh_token')
      expect(mockNext).toHaveBeenCalledWith(expect.any(Error))
      expect(mockAuthService.getRefreshToken).not.toHaveBeenCalled()
    })

    it('should handle service errors', async () => {
      const error = new Error('Refresh error')
      mockAuthService.getRefreshToken.mockRejectedValue(error)

      const requestWithRefreshToken = {
        ...mockRequest,
        body: { refresh_token: 'test-refresh-token' },
      } as Request

      await authController.refreshToken(
        requestWithRefreshToken,
        mockResponse as Response,
        mockNext
      )

      expect(mockNext).toHaveBeenCalledWith(error)
      expect(mockResponse.json).not.toHaveBeenCalled()
    })
  })
}) 
import { Request, Response } from 'express'
import { login, callback, refreshToken } from '../../../controllers/auth.controller'
import { getToken, getRefreshToken } from '../../../services/spotify.service'

jest.mock('../../../services/spotify.service')
const mockedGetToken = getToken as jest.MockedFunction<typeof getToken>
const mockedGetRefreshToken = getRefreshToken as jest.MockedFunction<typeof getRefreshToken>

describe('Auth Controller', () => {
  let mockRequest: Partial<Request>
  let mockResponse: Partial<Response>
  let mockJson: jest.Mock
  let mockStatus: jest.Mock

  beforeEach(() => {
    mockRequest = {}
    mockJson = jest.fn().mockReturnThis()
    mockStatus = jest.fn().mockReturnThis()
    mockResponse = {
      json: mockJson,
      status: mockStatus,
      redirect: jest.fn(),
    }
  })

  describe('login', () => {
    it('should redirect to Spotify authorization URL', () => {
      const mockRedirect = jest.fn()
      mockResponse.redirect = mockRedirect

      login(mockRequest as Request, mockResponse as Response)

      expect(mockRedirect).toHaveBeenCalledWith(
        expect.stringContaining('https://accounts.spotify.com/authorize')
      )
    })
  })

  describe('callback', () => {
    it('should return error when Spotify returns error', async () => {
      mockRequest.query = { error: 'access_denied' }

      await callback(mockRequest as Request, mockResponse as Response)

      expect(mockStatus).toHaveBeenCalledWith(400)
      expect(mockJson).toHaveBeenCalledWith({
        error: 'Spotify error: access_denied',
      })
    })

    it('should return error when code is missing', async () => {
      mockRequest.query = {}

      await callback(mockRequest as Request, mockResponse as Response)

      expect(mockStatus).toHaveBeenCalledWith(400)
      expect(mockJson).toHaveBeenCalledWith({
        error: 'Missing code',
      })
    })

    it('should successfully exchange code for token', async () => {
      const mockTokenData = {
        access_token: 'mock_access_token',
        refresh_token: 'mock_refresh_token',
        expires_in: 3600,
      }

      mockRequest.query = { code: 'mock_code' }
      mockedGetToken.mockResolvedValue(mockTokenData)

      await callback(mockRequest as Request, mockResponse as Response)

      expect(mockedGetToken).toHaveBeenCalledWith('mock_code')
      expect(mockJson).toHaveBeenCalledWith(mockTokenData)
    })

    it('should handle token exchange error', async () => {
      mockRequest.query = { code: 'mock_code' }
      mockedGetToken.mockRejectedValue(new Error('Token exchange failed'))

      await callback(mockRequest as Request, mockResponse as Response)

      expect(mockStatus).toHaveBeenCalledWith(500)
      expect(mockJson).toHaveBeenCalledWith({
        error: 'Failed to exchange token',
      })
    })
  })

  describe('refreshToken', () => {
    it('should return error when refresh_token is missing', async () => {
      mockRequest.body = {}

      await refreshToken(mockRequest as Request, mockResponse as Response)

      expect(mockStatus).toHaveBeenCalledWith(400)
      expect(mockJson).toHaveBeenCalledWith({
        error: 'Missing refresh_token',
      })
    })

    it('should successfully refresh token', async () => {
      const mockTokenData = {
        access_token: 'new_access_token',
        expires_in: 3600,
      }

      mockRequest.body = { refresh_token: 'mock_refresh_token' }
      mockedGetRefreshToken.mockResolvedValue(mockTokenData)

      await refreshToken(mockRequest as Request, mockResponse as Response)

      expect(mockedGetRefreshToken).toHaveBeenCalledWith('mock_refresh_token')
      expect(mockJson).toHaveBeenCalledWith(mockTokenData)
    })

    it('should handle refresh token error', async () => {
      mockRequest.body = { refresh_token: 'mock_refresh_token' }
      mockedGetRefreshToken.mockRejectedValue(new Error('Refresh failed'))

      await refreshToken(mockRequest as Request, mockResponse as Response)

      expect(mockStatus).toHaveBeenCalledWith(500)
      expect(mockJson).toHaveBeenCalledWith({
        error: 'Failed to refresh token',
      })
    })
  })
})

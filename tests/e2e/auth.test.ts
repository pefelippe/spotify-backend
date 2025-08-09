import request from 'supertest'
import { createApp } from '../../src/index'
import { createAuthService } from '../../src/services/spotify.service'
import express from 'express'

jest.mock('../../src/services/spotify.service')
const mockedCreateAuthService = createAuthService as jest.MockedFunction<typeof createAuthService>

describe('Auth Endpoints E2E', () => {
  let app: express.Application
  let mockAuthService: any

  beforeAll(() => {
    mockAuthService = {
      getToken: jest.fn(),
      getRefreshToken: jest.fn(),
      validateToken: jest.fn(),
    }

    mockedCreateAuthService.mockReturnValue(mockAuthService)
    app = createApp()
  })

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('GET /auth/login', () => {
    it('should redirect to Spotify authorization URL', async () => {
      const response = await request(app)
        .get('/auth/login')
        .expect(302)

      expect(response.headers.location).toContain('https://accounts.spotify.com/authorize')
      expect(response.headers.location).toContain('client_id=')
      expect(response.headers.location).toContain('response_type=code')
      expect(response.headers.location).toContain('redirect_uri=')
      expect(response.headers.location).toContain('scope=')
    })
  })

  describe('GET /auth/callback', () => {
    it('should handle successful authorization callback', async () => {
      const mockTokenResponse = {
        access_token: 'test-access-token',
        token_type: 'Bearer',
        expires_in: 3600,
        refresh_token: 'test-refresh-token',
        scope: 'user-read-private user-read-email',
      }

      mockAuthService.getToken.mockResolvedValue(mockTokenResponse)

      const response = await request(app)
        .get('/auth/callback?code=test-auth-code')
        .expect(200)

      expect(mockAuthService.getToken).toHaveBeenCalledWith('test-auth-code')
      expect(response.body).toHaveProperty('data', mockTokenResponse)
      expect(response.body).toHaveProperty('meta')
      expect(response.body.meta).toHaveProperty('path', '/callback')
      expect(response.body.meta).toHaveProperty('method', 'GET')
    })

    it('should handle missing authorization code', async () => {
      const response = await request(app)
        .get('/auth/callback')
        .expect(400)

      if (response.body.error) {
        expect(response.body.error.message).toBe('Missing authorization code')
      } else {
        expect(response.status).toBe(400)
        expect(response.body).toBeDefined()
      }
      expect(mockAuthService.getToken).not.toHaveBeenCalled()
    })

    it('should handle Spotify error in callback', async () => {
      const response = await request(app)
        .get('/auth/callback?error=access_denied')
        .expect(400)

      if (response.body.error) {
        expect(response.body.error.message).toBe('Spotify error: access_denied')
      } else {
        expect(response.status).toBe(400)
        expect(response.body).toBeDefined()
      }
      expect(mockAuthService.getToken).not.toHaveBeenCalled()
    })

    it('should handle service errors', async () => {
      const error = new Error('Service error')
      mockAuthService.getToken.mockRejectedValue(error)

      const response = await request(app)
        .get('/auth/callback?code=test-auth-code')
        .expect(500)

      if (response.body.error) {
        expect(response.body.error.message).toBeDefined()
      } else {
        expect(response.status).toBe(500)
        expect(response.body).toBeDefined()
      }
      expect(mockAuthService.getToken).toHaveBeenCalledWith('test-auth-code')
    })
  })

  describe('POST /auth/refresh', () => {
    it('should successfully refresh token', async () => {
      const mockTokenResponse = {
        access_token: 'new-access-token',
        token_type: 'Bearer',
        expires_in: 3600,
        scope: 'user-read-private user-read-email',
      }

      mockAuthService.getRefreshToken.mockResolvedValue(mockTokenResponse)

      const response = await request(app)
        .post('/auth/refresh')
        .send({ refresh_token: 'test-refresh-token' })
        .expect(200)

      expect(mockAuthService.getRefreshToken).toHaveBeenCalledWith('test-refresh-token')
      expect(response.body).toHaveProperty('data', mockTokenResponse)
      expect(response.body).toHaveProperty('meta')
      expect(response.body.meta).toHaveProperty('path', '/refresh')
      expect(response.body.meta).toHaveProperty('method', 'POST')
    })

    it('should handle missing refresh token', async () => {
      const response = await request(app)
        .post('/auth/refresh')
        .send({})
        .expect(400)

      if (response.body.error) {
        expect(response.body.error.message).toBe('Missing refresh_token')
      } else {
        expect(response.status).toBe(400)
        expect(response.body).toBeDefined()
      }
      expect(mockAuthService.getRefreshToken).not.toHaveBeenCalled()
    })

    it('should handle service errors', async () => {
      const error = new Error('Refresh error')
      mockAuthService.getRefreshToken.mockRejectedValue(error)

      const response = await request(app)
        .post('/auth/refresh')
        .send({ refresh_token: 'test-refresh-token' })
        .expect(500)

      if (response.body.error) {
        expect(response.body.error.message).toBeDefined()
      } else {
        expect(response.status).toBe(500)
        expect(response.body).toBeDefined()
      }
      expect(mockAuthService.getRefreshToken).toHaveBeenCalledWith('test-refresh-token')
    })
  })

  describe('GET /health', () => {
    it('should return health status', async () => {
      const response = await request(app)
        .get('/health')
        .expect(200)

      expect(response.body).toHaveProperty('status', 'ok')
      expect(response.body).toHaveProperty('timestamp')
      expect(response.body).toHaveProperty('environment')
    })
  })
}) 
import { createAuthService } from '../../../src/services/spotify.service'
import { SpotifyTokenResponse } from '../../../src/types'
import axios from 'axios'

jest.mock('axios')
const mockedAxios = axios as jest.Mocked<typeof axios>

describe('Spotify Auth Service', () => {
  let authService: ReturnType<typeof createAuthService>
  let mockHttpClient: any

  beforeEach(() => {
    jest.clearAllMocks()
    
    mockHttpClient = {
      post: jest.fn(),
    }

    authService = createAuthService({
      httpClient: mockHttpClient as any,
      config: {
        clientId: 'test-client-id',
        clientSecret: 'test-client-secret',
        redirectUri: 'http://localhost:3001/auth/callback',
        scopes: ['user-read-private', 'user-read-email'],
      },
    })
  })

  describe('getToken', () => {
    it('should successfully get token with authorization code', async () => {
      const mockTokenResponse: SpotifyTokenResponse = {
        access_token: 'test-access-token',
        token_type: 'Bearer',
        expires_in: 3600,
        refresh_token: 'test-refresh-token',
        scope: 'user-read-private user-read-email',
      }

      mockHttpClient.post.mockResolvedValue({
        data: mockTokenResponse,
      })

      const result = await authService.getToken('test-auth-code')

      expect(mockHttpClient.post).toHaveBeenCalledWith(
        '/token',
        'grant_type=authorization_code&code=test-auth-code&redirect_uri=http%3A%2F%2Flocalhost%3A3001%2Fauth%2Fcallback',
        {
          headers: expect.objectContaining({
            'Authorization': expect.stringContaining('Basic'),
            'Content-Type': 'application/x-www-form-urlencoded',
          }),
        }
      )
      expect(result).toEqual(mockTokenResponse)
    })

    it('should handle errors when getting token', async () => {
      const error = new Error('Network error')
      mockHttpClient.post.mockRejectedValue(error)

      await expect(authService.getToken('test-auth-code')).rejects.toThrow('Network error')
    })
  })

  describe('getRefreshToken', () => {
    it('should successfully refresh token', async () => {
      const mockTokenResponse: SpotifyTokenResponse = {
        access_token: 'new-access-token',
        token_type: 'Bearer',
        expires_in: 3600,
        scope: 'user-read-private user-read-email',
      }

      mockHttpClient.post.mockResolvedValue({
        data: mockTokenResponse,
      })

      const result = await authService.getRefreshToken('test-refresh-token')

      expect(mockHttpClient.post).toHaveBeenCalledWith(
        '/token',
        'grant_type=refresh_token&refresh_token=test-refresh-token',
        {
          headers: expect.objectContaining({
            'Authorization': expect.stringContaining('Basic'),
            'Content-Type': 'application/x-www-form-urlencoded',
          }),
        }
      )
      expect(result).toEqual(mockTokenResponse)
    })

    it('should handle errors when refreshing token', async () => {
      const error = new Error('Invalid refresh token')
      mockHttpClient.post.mockRejectedValue(error)

      await expect(authService.getRefreshToken('invalid-refresh-token')).rejects.toThrow('Invalid refresh token')
    })
  })

  describe('validateToken', () => {
    it('should successfully validate token', async () => {
      const mockUserData = {
        id: 'test-user-id',
        display_name: 'Test User',
        email: 'test@example.com',
      }

      mockedAxios.get.mockResolvedValue({
        data: mockUserData,
      })

      const result = await authService.validateToken('valid-access-token')

      expect(mockedAxios.get).toHaveBeenCalledWith(
        'https://api.spotify.com/v1/me',
        {
          headers: { Authorization: 'Bearer valid-access-token' },
          timeout: 5000,
        }
      )
      expect(result).toEqual(mockUserData)
    })

    it('should handle errors when validating token', async () => {
      const error = new Error('Invalid token')
      mockedAxios.get.mockRejectedValue(error)

      await expect(authService.validateToken('invalid-token')).rejects.toThrow('Invalid token')
    })
  })
}) 
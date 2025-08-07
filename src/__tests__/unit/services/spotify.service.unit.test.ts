import { getToken, getRefreshToken } from '../../../services/spotify.service'
import axios from 'axios'

jest.mock('axios')
const mockedAxios = axios as jest.Mocked<typeof axios>

describe('Spotify Service', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('getToken', () => {
    it('should successfully exchange code for token', async () => {
      const mockResponse = {
        data: {
          access_token: 'mock_access_token',
          refresh_token: 'mock_refresh_token',
          expires_in: 3600,
          token_type: 'Bearer',
        },
      }

      mockedAxios.post.mockResolvedValue(mockResponse)

      const result = await getToken('mock_code')

      expect(mockedAxios.post).toHaveBeenCalledWith(
        'https://accounts.spotify.com/api/token',
        expect.stringContaining('grant_type=authorization_code'),
        expect.objectContaining({
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            Authorization: expect.stringContaining('Basic '),
          },
        })
      )

      expect(result).toEqual(mockResponse.data)
    })

    it('should throw error when API call fails', async () => {
      const mockError = new Error('API Error')
      mockedAxios.post.mockRejectedValue(mockError)

      await expect(getToken('mock_code')).rejects.toThrow('API Error')
    })
  })

  describe('getRefreshToken', () => {
    it('should successfully refresh token', async () => {
      const mockResponse = {
        data: {
          access_token: 'new_access_token',
          expires_in: 3600,
          token_type: 'Bearer',
        },
      }

      mockedAxios.post.mockResolvedValue(mockResponse)

      const result = await getRefreshToken('mock_refresh_token')

      expect(mockedAxios.post).toHaveBeenCalledWith(
        'https://accounts.spotify.com/api/token',
        expect.stringContaining('grant_type=refresh_token'),
        expect.objectContaining({
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            Authorization: expect.stringContaining('Basic '),
          },
        })
      )

      expect(result).toEqual(mockResponse.data)
    })

    it('should throw error when refresh fails', async () => {
      const mockError = new Error('Refresh Error')
      mockedAxios.post.mockRejectedValue(mockError)

      await expect(getRefreshToken('mock_refresh_token')).rejects.toThrow('Refresh Error')
    })
  })
})

import axios, { AxiosInstance } from 'axios'
import qs from 'querystring'
import dotenv from 'dotenv'
import { SpotifyTokenResponse, AuthService } from '../types'
import { getAppConfig } from '../config/app.config'
import { createAuthHeaders } from '../utils/http'
import { handleAuthError } from '../utils/error-handlers'
import { SPOTIFY_URLS, TIMEOUTS } from '../constants'

dotenv.config({
  path: process.env.NODE_ENV === 'production' ? '.env.production' : '.env.local',
})

interface AuthServiceDependencies {
  httpClient?: AxiosInstance
  config?: ReturnType<typeof getAppConfig>['spotify']
}

const createAuthHttpClient = (): AxiosInstance => {
  return axios.create({
    baseURL: SPOTIFY_URLS.AUTH_BASE,
    timeout: TIMEOUTS.DEFAULT,
  })
}

export const createAuthService = (dependencies: AuthServiceDependencies = {}): AuthService => {
  const config = dependencies.config || getAppConfig().spotify
  const httpClient = dependencies.httpClient || createAuthHttpClient()

  const makeAuthRequest = async (body: string): Promise<SpotifyTokenResponse> => {
    try {
      const response = await httpClient.post('/token', body, {
        headers: createAuthHeaders(config.clientId, config.clientSecret),
      })
      return response.data
    } catch (error) {
      return handleAuthError(error, 'authentication request')
    }
  }

  const getToken = async (code: string): Promise<SpotifyTokenResponse> => {
    const body = qs.stringify({
      grant_type: 'authorization_code',
      code,
      redirect_uri: config.redirectUri,
    })

    return makeAuthRequest(body)
  }

  const getRefreshToken = async (refreshToken: string): Promise<SpotifyTokenResponse> => {
    const body = qs.stringify({
      grant_type: 'refresh_token',
      refresh_token: refreshToken,
    })

    return makeAuthRequest(body)
  }

  const validateToken = async (accessToken: string) => {
    try {
      const response = await axios.get('https://api.spotify.com/v1/me', {
        headers: { Authorization: `Bearer ${accessToken}` },
        timeout: TIMEOUTS.SHORT,
      })
      return response.data
    } catch (error) {
      return handleAuthError(error, 'token validation')
    }
  }

  return {
    getToken,
    getRefreshToken,
    validateToken,
  }
}

export const authService = createAuthService()

import { Request } from 'express'

export interface AppError {
  message: string
  status: number
  code: string
  details?: Record<string, unknown>
}

export interface ApiResponse<T = unknown> {
  data?: T
  error?: AppError
  meta?: {
    timestamp: string
    path: string
    method: string
  }
}

export interface SpotifyTokenResponse {
  access_token: string
  token_type: string
  expires_in: number
  refresh_token?: string
  scope: string
}

export interface SpotifyUser {
  id: string
  display_name: string
  email: string
  images?: Array<{ url: string; width?: number; height?: number }>
}

export interface RequestWithAuth extends Request {
  accessToken?: string
  user?: SpotifyUser
}

export interface AppConfig {
  port: number
  nodeEnv: string
  frontendUrl: string
  allowedOrigins: string[]
  spotify: {
    clientId: string
    clientSecret: string
    redirectUri: string
    scopes: string[]
  }
}

export interface AuthService {
  getToken(code: string): Promise<SpotifyTokenResponse>
  getRefreshToken(refreshToken: string): Promise<SpotifyTokenResponse>
  validateToken(accessToken: string): Promise<SpotifyUser>
}

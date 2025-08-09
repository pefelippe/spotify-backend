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

export interface PaginationParams {
  limit?: number
  offset?: number
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

export interface SpotifyPlaylist {
  id: string
  name: string
  description?: string
  images?: Array<{ url: string; width?: number; height?: number }>
  owner: SpotifyUser
  public: boolean
  collaborative: boolean
  tracks: {
    total: number
  }
}

export interface SpotifyFollowingResponse {
  artists?: {
    items: Array<{ id: string; name: string; images?: Array<{ url: string }> }>
    total: number
    next?: string
  }
  users?: {
    items: Array<{ id: string; display_name: string; images?: Array<{ url: string }> }>
    total: number
    next?: string
  }
}

export interface RequestWithAuth extends Request {
  accessToken?: string
  user?: SpotifyUser
}

export interface AppConfig {
  port: number
  nodeEnv: string
  frontendUrl: string
  spotify: {
    clientId: string
    clientSecret: string
    redirectUri: string
    scopes: string[]
  }
}

export interface SpotifyApiService {
  getUserPlaylists(
    accessToken: string,
    params?: PaginationParams
  ): Promise<{ items: SpotifyPlaylist[] }>
  getFollowing(
    accessToken: string,
    params: { type: 'artist' | 'user'; after?: string; limit?: number }
  ): Promise<SpotifyFollowingResponse>
  follow(accessToken: string, body: { type: 'artist' | 'user'; ids: string[] }): Promise<void>
  unfollow(accessToken: string, body: { type: 'artist' | 'user'; ids: string[] }): Promise<void>
  uploadPlaylistImage(accessToken: string, playlistId: string, imageBase64: string): Promise<void>
}

export interface AuthService {
  getToken(code: string): Promise<SpotifyTokenResponse>
  getRefreshToken(refreshToken: string): Promise<SpotifyTokenResponse>
  validateToken(accessToken: string): Promise<SpotifyUser>
}

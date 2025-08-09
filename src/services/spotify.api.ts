import axios, { AxiosError, AxiosInstance } from 'axios'
import {
  SpotifyApiService,
  PaginationParams,
  SpotifyPlaylist,
  SpotifyFollowingResponse,
} from '../types'
import { createExternalServiceError } from '../utils/errors'
import { createAuthHeader } from '../utils/http'
import { handleSpotifyError } from '../utils/error-handlers'
import { SPOTIFY_URLS, TIMEOUTS } from '../constants'

interface SpotifyApiConfig {
  baseURL: string
  timeout: number
}

interface SpotifyApiDependencies {
  httpClient?: AxiosInstance
  config?: SpotifyApiConfig
}

const createSpotifyHttpClient = (config: SpotifyApiConfig): AxiosInstance => {
  return axios.create({
    baseURL: config.baseURL,
    timeout: config.timeout,
  })
}

export const createSpotifyApiService = (
  dependencies: SpotifyApiDependencies = {}
): SpotifyApiService => {
  const config = dependencies.config || {
    baseURL: SPOTIFY_URLS.API_BASE,
    timeout: TIMEOUTS.DEFAULT,
  }

  const httpClient = dependencies.httpClient || createSpotifyHttpClient(config)

  const getUserPlaylists = async (
    accessToken: string,
    params?: PaginationParams
  ): Promise<{ items: SpotifyPlaylist[] }> => {
    try {
      const response = await httpClient.get('/me/playlists', {
        headers: createAuthHeader(accessToken),
        params,
      })
      return response.data
    } catch (error) {
      return handleSpotifyError(error, 'getUserPlaylists')
    }
  }

  const getFollowing = async (
    accessToken: string,
    params: { type: 'artist' | 'user'; after?: string; limit?: number }
  ): Promise<SpotifyFollowingResponse> => {
    try {
      const response = await httpClient.get('/me/following', {
        headers: createAuthHeader(accessToken),
        params,
      })
      return response.data
    } catch (error) {
      return handleSpotifyError(error, 'getFollowing')
    }
  }

  const follow = async (
    accessToken: string,
    body: { type: 'artist' | 'user'; ids: string[] }
  ): Promise<void> => {
    try {
      await httpClient.put('/me/following', null, {
        headers: createAuthHeader(accessToken),
        params: { type: body.type, ids: body.ids.join(',') },
      })
    } catch (error) {
      return handleSpotifyError(error, 'follow')
    }
  }

  const unfollow = async (
    accessToken: string,
    body: { type: 'artist' | 'user'; ids: string[] }
  ): Promise<void> => {
    try {
      await httpClient.delete('/me/following', {
        headers: createAuthHeader(accessToken),
        params: { type: body.type, ids: body.ids.join(',') },
      })
    } catch (error) {
      return handleSpotifyError(error, 'unfollow')
    }
  }

  const uploadPlaylistImage = async (
    accessToken: string,
    playlistId: string,
    imageBase64: string
  ): Promise<void> => {
    try {
      await httpClient.put(`/playlists/${playlistId}/images`, imageBase64, {
        headers: {
          ...createAuthHeader(accessToken),
          'Content-Type': 'image/jpeg',
        },
      })
    } catch (error) {
      return handleSpotifyError(error, 'uploadPlaylistImage')
    }
  }

  return {
    getUserPlaylists,
    getFollowing,
    follow,
    unfollow,
    uploadPlaylistImage,
  }
}

export const spotifyApiService = createSpotifyApiService()

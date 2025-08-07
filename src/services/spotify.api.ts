import axios, { AxiosError } from 'axios'

const spotifyApi = axios.create({
  baseURL: 'https://api.spotify.com/v1',
})

const authHeader = (accessToken: string) => ({
  Authorization: `Bearer ${accessToken}`,
})

export const getUserPlaylists = async (
  accessToken: string,
  params?: { limit?: number; offset?: number }
) => {
  try {
    const response = await spotifyApi.get('/me/playlists', {
      headers: authHeader(accessToken),
      params,
    })
    return response.data
  } catch (error: unknown) {
    const axiosError = error as AxiosError
    if (axiosError.response?.data) {
      console.error('getUserPlaylists error:', axiosError.response.data)
    }
    throw error
  }
}

export const getFollowing = async (
  accessToken: string,
  params: { type: 'artist' | 'user'; after?: string; limit?: number }
) => {
  try {
    const response = await spotifyApi.get('/me/following', {
      headers: authHeader(accessToken),
      params,
    })
    return response.data
  } catch (error: unknown) {
    const axiosError = error as AxiosError
    if (axiosError.response?.data) {
      console.error('getFollowing error:', axiosError.response.data)
    }
    throw error
  }
}

export const follow = async (
  accessToken: string,
  body: { type: 'artist' | 'user'; ids: string[] }
) => {
  try {
    const response = await spotifyApi.put('/me/following', null, {
      headers: authHeader(accessToken),
      params: { type: body.type, ids: body.ids.join(',') },
    })
    return response.status
  } catch (error: unknown) {
    const axiosError = error as AxiosError
    if (axiosError.response?.data) {
      console.error('follow error:', axiosError.response.data)
    }
    throw error
  }
}

export const unfollow = async (
  accessToken: string,
  body: { type: 'artist' | 'user'; ids: string[] }
) => {
  try {
    const response = await spotifyApi.delete('/me/following', {
      headers: authHeader(accessToken),
      params: { type: body.type, ids: body.ids.join(',') },
    })
    return response.status
  } catch (error: unknown) {
    const axiosError = error as AxiosError
    if (axiosError.response?.data) {
      console.error('unfollow error:', axiosError.response.data)
    }
    throw error
  }
}

export const uploadPlaylistImage = async (
  accessToken: string,
  playlistId: string,
  imageBase64: string
) => {
  try {
    const response = await spotifyApi.put(`/playlists/${playlistId}/images`, imageBase64, {
      headers: {
        ...authHeader(accessToken),
        'Content-Type': 'image/jpeg',
      },
    })
    return response.status
  } catch (error: unknown) {
    const axiosError = error as AxiosError
    if (axiosError.response?.data) {
      console.error('uploadPlaylistImage error:', axiosError.response.data)
    }
    throw error
  }
}

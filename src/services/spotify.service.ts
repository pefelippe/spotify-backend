import axios, { AxiosError } from 'axios'
import qs from 'querystring'

import { CLIENT_ID, CLIENT_SECRET, REDIRECT_URI } from '../config/env'

const makeSpotifyRequest = async (body: string) => {
  return await axios.post('https://accounts.spotify.com/api/token', body, {
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      Authorization: `Basic ${Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString('base64')}`,
    },
  })
}

export const getToken = async (code: string) => {
  const body = qs.stringify({
    grant_type: 'authorization_code',
    code,
    redirect_uri: REDIRECT_URI,
  })

  try {
    const response = await makeSpotifyRequest(body)
    return response.data
  } catch (error: unknown) {
    const axiosError = error as AxiosError
    console.error('Spotify API error:', axiosError.message)
    if (axiosError.response?.data) {
      console.error('Response:', axiosError.response.data)
    }
    throw error
  }
}

export const getRefreshToken = async (refresh_token: string) => {
  const body = qs.stringify({
    grant_type: 'refresh_token',
    refresh_token,
  })

  try {
    const response = await makeSpotifyRequest(body)
    return response.data
  } catch (error: unknown) {
    const axiosError = error as AxiosError
    console.error('Spotify refresh error:', axiosError.message)
    if (axiosError.response?.data) {
      console.error('Response:', axiosError.response.data)
    }
    throw error
  }
}

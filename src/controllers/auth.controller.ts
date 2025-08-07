import { Request, Response } from 'express'
import { getToken, getRefreshToken } from '../services/spotify.service'
import { buildQueryString } from '../utils/build-query-string'
import { CLIENT_ID, REDIRECT_URI } from '../config/env'

interface SpotifyError {
  message: string
  status?: number
}

const SCOPES = [
  'user-read-private',
  'user-read-email',
  'user-top-read',
  'playlist-read-private',
  'playlist-modify-public',
  'playlist-modify-private',
  'streaming',
  'user-read-playback-state',
  'user-modify-playback-state',
  'user-library-read',
  'user-library-modify',
  'user-read-recently-played',
  'user-read-currently-playing',
  'user-read-playback-position',
].join(' ')

export const login = (_: Request, res: Response) => {
  const query = buildQueryString({
    client_id: CLIENT_ID,
    response_type: 'code',
    redirect_uri: REDIRECT_URI,
    scope: SCOPES,
  })

  const spotifyUrl = `https://accounts.spotify.com/authorize?${query}`
  res.redirect(spotifyUrl)
}

export const callback = async (req: Request, res: Response) => {
  const code = req.query.code as string
  const error = req.query.error as string

  if (error) {
    return res.status(400).json({ error: `Spotify error: ${error}` })
  }

  if (!code) {
    return res.status(400).json({ error: 'Missing code' })
  }

  try {
    const data = await getToken(code)
    res.json(data)
  } catch (err: unknown) {
    const error = err as SpotifyError
    console.error('Token exchange error:', error.message)
    res.status(500).json({ error: 'Failed to exchange token' })
  }
}

export const refreshToken = async (req: Request, res: Response) => {
  const { refresh_token } = req.body
  if (!refresh_token) {
    return res.status(400).json({ error: 'Missing refresh_token' })
  }

  try {
    const data = await getRefreshToken(refresh_token)
    res.json(data)
  } catch (err: unknown) {
    const error = err as SpotifyError
    console.error('Token refresh error:', error.message)
    res.status(500).json({ error: 'Failed to refresh token' })
  }
}

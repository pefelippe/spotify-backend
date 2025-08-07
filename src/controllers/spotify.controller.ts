import { Request, Response } from 'express'
import {
  getUserPlaylists,
  getFollowing,
  follow,
  unfollow,
  uploadPlaylistImage,
} from '../services/spotify.api'

const getAccessTokenFromHeader = (req: Request) => {
  const auth = req.headers.authorization || ''
  return auth.startsWith('Bearer ') ? auth.substring('Bearer '.length) : ''
}

export const listPlaylists = async (req: Request, res: Response) => {
  const accessToken = getAccessTokenFromHeader(req)
  if (!accessToken) return res.status(401).json({ error: 'Missing Bearer token' })

  try {
    const { limit, offset } = req.query
    const data = await getUserPlaylists(accessToken, {
      limit: limit ? Number(limit) : undefined,
      offset: offset ? Number(offset) : undefined,
    })
    res.json(data)
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch playlists' })
  }
}

export const listFollowing = async (req: Request, res: Response) => {
  const accessToken = getAccessTokenFromHeader(req)
  if (!accessToken) return res.status(401).json({ error: 'Missing Bearer token' })

  try {
    const { type = 'artist', after, limit } = req.query
    const data = await getFollowing(accessToken, {
      type: (type as 'artist' | 'user') || 'artist',
      after: after as string | undefined,
      limit: limit ? Number(limit) : undefined,
    })
    res.json(data)
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch following' })
  }
}

export const followEntities = async (req: Request, res: Response) => {
  const accessToken = getAccessTokenFromHeader(req)
  if (!accessToken) return res.status(401).json({ error: 'Missing Bearer token' })

  const { type, ids } = req.body as { type: 'artist' | 'user'; ids: string[] }
  if (!type || !ids?.length) {
    return res.status(400).json({ error: 'Missing type or ids' })
  }
  try {
    await follow(accessToken, { type, ids })
    res.status(204).send()
  } catch (err) {
    res.status(500).json({ error: 'Failed to follow' })
  }
}

export const unfollowEntities = async (req: Request, res: Response) => {
  const accessToken = getAccessTokenFromHeader(req)
  if (!accessToken) return res.status(401).json({ error: 'Missing Bearer token' })

  const { type, ids } = req.body as { type: 'artist' | 'user'; ids: string[] }
  if (!type || !ids?.length) {
    return res.status(400).json({ error: 'Missing type or ids' })
  }
  try {
    await unfollow(accessToken, { type, ids })
    res.status(204).send()
  } catch (err) {
    res.status(500).json({ error: 'Failed to unfollow' })
  }
}

export const setPlaylistImage = async (req: Request, res: Response) => {
  const accessToken = getAccessTokenFromHeader(req)
  if (!accessToken) return res.status(401).json({ error: 'Missing Bearer token' })

  const { playlistId } = req.params
  const { imageBase64 } = req.body as { imageBase64: string }
  if (!playlistId || !imageBase64) {
    return res.status(400).json({ error: 'Missing playlistId or imageBase64' })
  }
  try {
    await uploadPlaylistImage(accessToken, playlistId, imageBase64)
    res.status(202).send()
  } catch (err) {
    res.status(500).json({ error: 'Failed to upload playlist image' })
  }
}

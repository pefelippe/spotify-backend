import { Response, NextFunction } from 'express'
import { RequestWithAuth, SpotifyApiService, PaginationParams } from '../types'
import { createValidationError } from '../utils/errors'
import { createSpotifyApiService } from '../services/spotify.api'
import { createLogger } from '../utils/logger'
import { validateFollowUnfollowBody } from '../utils/validation'
import { createMetaResponse } from '../utils/http'

const logger = createLogger('SpotifyController')

interface SpotifyControllerDependencies {
  spotifyApiService: SpotifyApiService
}

const createSpotifyController = (dependencies: SpotifyControllerDependencies) => {
  const { spotifyApiService } = dependencies

  const listPlaylists = async (
    req: RequestWithAuth,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    const { accessToken } = req

    if (!accessToken) {
      const error = createValidationError('Missing Bearer token')
      return next(error)
    }

    try {
      const { limit, offset } = req.query
      const params: PaginationParams = {
        limit: limit ? Number(limit) : undefined,
        offset: offset ? Number(offset) : undefined,
      }

      logger.debug('Fetching user playlists', { limit: params.limit, offset: params.offset })
      const data = await spotifyApiService.getUserPlaylists(accessToken, params)

      res.json({
        data,
        meta: createMetaResponse(req.path, req.method),
      })
    } catch (error) {
      logger.error(
        'Failed to fetch playlists',
        { error: error instanceof Error ? error.message : 'Unknown error' },
        error as Error
      )
      next(error)
    }
  }

  const listFollowing = async (
    req: RequestWithAuth,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    const { accessToken } = req

    if (!accessToken) {
      const error = createValidationError('Missing Bearer token')
      return next(error)
    }

    try {
      const { type = 'artist', after, limit } = req.query
      const validType = type === 'artist' || type === 'user' ? type : 'artist'

      const data = await spotifyApiService.getFollowing(accessToken, {
        type: validType,
        after: typeof after === 'string' ? after : undefined,
        limit: limit ? Number(limit) : undefined,
      })

      res.json({
        data,
        meta: createMetaResponse(req.path, req.method),
      })
    } catch (error) {
      logger.error(
        'Failed to fetch following',
        { error: error instanceof Error ? error.message : 'Unknown error' },
        error as Error
      )
      next(error)
    }
  }

  const followEntities = async (
    req: RequestWithAuth,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    const { accessToken } = req

    if (!accessToken) {
      const error = createValidationError('Missing Bearer token')
      return next(error)
    }

    if (!validateFollowUnfollowBody(req.body)) {
      const error = createValidationError(
        'Invalid request body. Expected: { type: "artist" | "user", ids: string[] }'
      )
      return next(error)
    }

    const { type, ids } = req.body

    try {
      logger.info('Following entities', { type, count: ids.length })
      await spotifyApiService.follow(accessToken, { type, ids })
      res.status(204).send()
    } catch (error) {
      logger.error(
        'Failed to follow entities',
        {
          type,
          count: ids.length,
          error: error instanceof Error ? error.message : 'Unknown error',
        },
        error as Error
      )
      next(error)
    }
  }

  const unfollowEntities = async (
    req: RequestWithAuth,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    const { accessToken } = req

    if (!accessToken) {
      const error = createValidationError('Missing Bearer token')
      return next(error)
    }

    if (!validateFollowUnfollowBody(req.body)) {
      const error = createValidationError(
        'Invalid request body. Expected: { type: "artist" | "user", ids: string[] }'
      )
      return next(error)
    }

    const { type, ids } = req.body

    try {
      logger.info('Unfollowing entities', { type, count: ids.length })
      await spotifyApiService.unfollow(accessToken, { type, ids })
      res.status(204).send()
    } catch (error) {
      logger.error(
        'Failed to unfollow entities',
        {
          type,
          count: ids.length,
          error: error instanceof Error ? error.message : 'Unknown error',
        },
        error as Error
      )
      next(error)
    }
  }

  const setPlaylistImage = async (
    req: RequestWithAuth,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    const { accessToken } = req

    if (!accessToken) {
      const error = createValidationError('Missing Bearer token')
      return next(error)
    }

    const { playlistId } = req.params
    const { imageBase64 } = req.body

    if (!playlistId || typeof playlistId !== 'string') {
      const error = createValidationError('Missing or invalid playlistId')
      return next(error)
    }

    if (!imageBase64 || typeof imageBase64 !== 'string') {
      const error = createValidationError('Missing or invalid imageBase64')
      return next(error)
    }

    try {
      logger.info('Uploading playlist image', { playlistId })
      await spotifyApiService.uploadPlaylistImage(accessToken, playlistId, imageBase64)
      res.status(202).send()
    } catch (error) {
      logger.error(
        'Failed to upload playlist image',
        { playlistId, error: error instanceof Error ? error.message : 'Unknown error' },
        error as Error
      )
      next(error)
    }
  }

  return {
    listPlaylists,
    listFollowing,
    followEntities,
    unfollowEntities,
    setPlaylistImage,
  }
}

export const spotifyController = createSpotifyController({
  spotifyApiService: createSpotifyApiService(),
})

export { createSpotifyController }

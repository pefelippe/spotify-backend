import { Router } from 'express'
import { Container } from '../container'
import { requireBearerToken } from '../middleware/auth'
import { createValidationMiddleware, validationRules } from '../middleware/validation'
import { FOLLOW_TYPES } from '../constants'

const createSpotifyRoutes = (container: Container) => {
  const router = Router()

  router.use(requireBearerToken)

  router.get(
    '/playlists',
    createValidationMiddleware.query([
      validationRules.optional.limit,
      validationRules.optional.offset,
    ]),
    container.controllers.spotifyController.listPlaylists
  )

  router.get(
    '/following',
    createValidationMiddleware.query([
      {
        field: 'type',
        type: 'string' as const,
        validator: (value) => !value || FOLLOW_TYPES.includes(value as 'artist' | 'user'),
      },
      validationRules.optional.limit,
      validationRules.optional.after,
    ]),
    container.controllers.spotifyController.listFollowing
  )

  router.put(
    '/following',
    createValidationMiddleware.body([validationRules.required.type, validationRules.required.ids]),
    container.controllers.spotifyController.followEntities
  )

  router.delete(
    '/following',
    createValidationMiddleware.body([validationRules.required.type, validationRules.required.ids]),
    container.controllers.spotifyController.unfollowEntities
  )

  router.put(
    '/playlists/:playlistId/image',
    createValidationMiddleware.params([validationRules.required.playlistId]),
    createValidationMiddleware.body([validationRules.required.imageBase64]),
    container.controllers.spotifyController.setPlaylistImage
  )

  return router
}

export default createSpotifyRoutes

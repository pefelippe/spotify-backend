import { Router } from 'express'
import {
  listPlaylists,
  listFollowing,
  followEntities,
  unfollowEntities,
  setPlaylistImage,
} from '../controllers/spotify.controller'

const router = Router()

router.get('/playlists', listPlaylists)
router.get('/following', listFollowing)
router.put('/following', followEntities)
router.delete('/following', unfollowEntities)
router.put('/playlists/:playlistId/image', setPlaylistImage)

export default router

import { createAuthService } from './services/spotify.service'
import { createSpotifyApiService } from './services/spotify.api'
import { createAuthController } from './controllers/auth.controller'
import { createSpotifyController } from './controllers/spotify.controller'
import { AuthService, SpotifyApiService } from './types'

interface Container {
  services: {
    authService: AuthService
    spotifyApiService: SpotifyApiService
  }
  controllers: {
    authController: ReturnType<typeof createAuthController>
    spotifyController: ReturnType<typeof createSpotifyController>
  }
}

const createContainer = (): Container => {
  const authService = createAuthService()
  const spotifyApiService = createSpotifyApiService()

  const authController = createAuthController({ authService })
  const spotifyController = createSpotifyController({ spotifyApiService })

  return {
    services: {
      authService,
      spotifyApiService,
    },
    controllers: {
      authController,
      spotifyController,
    },
  }
}

export { createContainer }
export type { Container }

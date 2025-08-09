import { createAuthService } from './services/spotify.service'
import { createAuthController } from './controllers/auth.controller'
import { AuthService } from './types'

interface Container {
  services: {
    authService: AuthService
  }
  controllers: {
    authController: ReturnType<typeof createAuthController>
  }
}

const createContainer = (): Container => {
  const authService = createAuthService()

  const authController = createAuthController({ authService })

  return {
    services: {
      authService,
    },
    controllers: {
      authController,
    },
  }
}

export { createContainer }
export type { Container }

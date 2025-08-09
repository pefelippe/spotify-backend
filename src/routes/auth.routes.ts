import { Router } from 'express'
import { Container } from '../container'
import { createValidationMiddleware, validationRules } from '../middleware/validation'

const createAuthRoutes = (container: Container) => {
  const router = Router()

  router.get('/login', container.controllers.authController.login)
  router.get('/callback', container.controllers.authController.callback)
  router.post(
    '/refresh',
    createValidationMiddleware.body([validationRules.required.refresh_token]),
    container.controllers.authController.refreshToken
  )

  return router
}

export default createAuthRoutes

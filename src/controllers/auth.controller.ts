import { Request, Response, NextFunction } from 'express'
import dotenv from 'dotenv'
import { buildQueryString } from '../utils/build-query-string'
import { getAppConfig } from '../config/app.config'
import { AuthService } from '../types'
import { createValidationError } from '../utils/errors'
import { createAuthService } from '../services/spotify.service'
import { createMetaResponse } from '../utils/http'
import { SPOTIFY_URLS } from '../constants'

dotenv.config({
  path: process.env.NODE_ENV === 'production' ? '.env.production' : '.env.local',
})

interface AuthControllerDependencies {
  authService: AuthService
  config?: ReturnType<typeof getAppConfig>
}

const createAuthController = (dependencies: AuthControllerDependencies) => {
  const { authService, config = getAppConfig() } = dependencies

  const login = (_: Request, res: Response): void => {
    const query = buildQueryString({
      client_id: config.spotify.clientId,
      response_type: 'code',
      redirect_uri: config.spotify.redirectUri,
      scope: config.spotify.scopes.join(' '),
    })

    const spotifyUrl = `${SPOTIFY_URLS.AUTHORIZE}?${query}`
    res.redirect(spotifyUrl)
  }

  const callback = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const { code, error } = req.query

    if (error) {
      const validationError = createValidationError(`Spotify error: ${error}`)
      return next(validationError)
    }

    if (!code || typeof code !== 'string') {
      const validationError = createValidationError('Missing authorization code')
      return next(validationError)
    }

    try {
      const data = await authService.getToken(code)
      res.json({
        data,
        meta: createMetaResponse(req.path, req.method),
      })
    } catch (error) {
      next(error)
    }
  }

  const refreshToken = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const { refresh_token } = req.body

    if (!refresh_token) {
      const validationError = createValidationError('Missing refresh_token')
      return next(validationError)
    }

    try {
      const data = await authService.getRefreshToken(refresh_token)
      res.json({
        data,
        meta: createMetaResponse(req.path, req.method),
      })
    } catch (error) {
      next(error)
    }
  }

  return {
    login,
    callback,
    refreshToken,
  }
}

export const authController = createAuthController({ authService: createAuthService() })

export { createAuthController }

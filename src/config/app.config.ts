import { AppConfig } from '../types'
import { requireEnv } from '../utils/require-env'
import dotenv from 'dotenv'
import { SPOTIFY_SCOPES, ENVIRONMENT } from '../constants'

dotenv.config({
  path: process.env.NODE_ENV === 'production' ? '.env.production' : '.env.local',
})

const createSpotifyConfig = () => ({
  clientId: requireEnv('SPOTIFY_CLIENT_ID'),
  clientSecret: requireEnv('SPOTIFY_CLIENT_SECRET'),
  redirectUri: requireEnv('SPOTIFY_REDIRECT_URI'),
  scopes: [...SPOTIFY_SCOPES],
})

export const createAppConfig = (): AppConfig => ({
  port: parseInt(process.env.PORT || '3001', 10),
  nodeEnv: process.env.NODE_ENV || ENVIRONMENT.DEVELOPMENT,
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:5173',
  spotify: createSpotifyConfig(),
})

class AppConfigManager {
  private static instance: AppConfig | null = null
  private static readonly lock = new Promise<void>(() => {})

  static getInstance(): AppConfig {
    if (!AppConfigManager.instance) {
      AppConfigManager.instance = createAppConfig()
    }
    return AppConfigManager.instance
  }

  static reset(): void {
    AppConfigManager.instance = null
  }
}

export const getAppConfig = (): AppConfig => {
  return AppConfigManager.getInstance()
}

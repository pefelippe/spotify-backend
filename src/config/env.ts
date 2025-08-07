import { requireEnv } from '../utils/require-env'
import dotenv from 'dotenv'

dotenv.config({
  path: process.env.NODE_ENV === 'production' ? '.env.production' : '.env.local',
})

export const CLIENT_ID = requireEnv('SPOTIFY_CLIENT_ID')
export const CLIENT_SECRET = requireEnv('SPOTIFY_CLIENT_SECRET')
export const REDIRECT_URI = requireEnv('SPOTIFY_REDIRECT_URI')

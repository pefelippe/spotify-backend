export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  ACCEPTED: 202,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  INTERNAL_SERVER_ERROR: 500,
  BAD_GATEWAY: 502,
} as const

export const SPOTIFY_URLS = {
  API_BASE: 'https://api.spotify.com/v1',
  AUTH_BASE: 'https://accounts.spotify.com/api',
  AUTHORIZE: 'https://accounts.spotify.com/authorize',
} as const

export const TIMEOUTS = {
  DEFAULT: 10000,
  SHORT: 5000,
} as const

export const CONTENT_TYPES = {
  JSON: 'application/json',
  FORM_URLENCODED: 'application/x-www-form-urlencoded',
  IMAGE_JPEG: 'image/jpeg',
} as const

export const AUTH_TYPES = {
  BEARER: 'Bearer',
  BASIC: 'Basic',
} as const

export const SPOTIFY_SCOPES = [
  'user-read-private',
  'user-read-email',
  'user-top-read',
  'playlist-read-private',
  'playlist-read-collaborative',
  'playlist-modify-public',
  'playlist-modify-private',
  'ugc-image-upload',
  'streaming',
  'app-remote-control',
  'user-read-playback-state',
  'user-modify-playback-state',
  'user-library-read',
  'user-library-modify',
  'user-follow-read',
  'user-follow-modify',
  'user-read-recently-played',
  'user-read-currently-playing',
  'user-read-playback-position',
] as const

export const VALIDATION_RULES = {
  MAX_LIMIT: 50,
  MIN_LIMIT: 1,
  MIN_OFFSET: 0,
} as const

export const FOLLOW_TYPES = ['artist', 'user'] as const

export const ENVIRONMENT = {
  DEVELOPMENT: 'development',
  PRODUCTION: 'production',
} as const

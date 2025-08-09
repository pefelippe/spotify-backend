import { AxiosError } from 'axios'
import { createExternalServiceError } from './errors'

export const handleSpotifyError = (error: unknown, operation: string): never => {
  if (error instanceof AxiosError) {
    const serviceError = createExternalServiceError(
      'Spotify',
      `${operation} failed: ${error.response?.data?.error?.message || error.message}`
    )
    throw serviceError
  }
  throw error
}

export const handleAuthError = (error: unknown, operation: string): never => {
  if (error instanceof AxiosError) {
    const serviceError = createExternalServiceError(
      'Spotify Auth',
      `${operation} failed: ${error.response?.data?.error_description || error.message}`
    )
    throw serviceError
  }
  throw error
}

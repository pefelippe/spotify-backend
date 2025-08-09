export const extractBearerToken = (authHeader: string | undefined): string | null => {
  const auth = authHeader || ''
  if (!auth.startsWith('Bearer ')) {
    return null
  }
  return auth.substring('Bearer '.length) || null
}

export const createAuthHeader = (accessToken: string) => ({
  Authorization: `Bearer ${accessToken}`,
})

export const createAuthHeaders = (clientId: string, clientSecret: string) => ({
  'Content-Type': 'application/x-www-form-urlencoded',
  Authorization: `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString('base64')}`,
})

export const createMetaResponse = (path: string, method: string) => ({
  timestamp: new Date().toISOString(),
  path,
  method,
})

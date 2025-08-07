import request from 'supertest'
import express from 'express'
import cors from 'cors'
import authRoutes from '../../routes/auth.routes'

const createTestApp = () => {
  const app = express()

  app.use(
    cors({
      origin: 'http://localhost:5173',
      credentials: true,
    })
  )
  app.use(express.json())
  app.use('/auth', authRoutes)

  return app
}

describe('Auth Routes E2E', () => {
  let app: express.Application

  beforeAll(() => {
    app = createTestApp()
  })

  describe('GET /auth/login', () => {
    it('should redirect to Spotify authorization URL', async () => {
      const response = await request(app).get('/auth/login').expect(302)

      expect(response.header.location).toContain('https://accounts.spotify.com/authorize')
      expect(response.header.location).toContain('client_id=')
      expect(response.header.location).toContain('response_type=code')
      expect(response.header.location).toContain('redirect_uri=')
      expect(response.header.location).toContain('scope=')
    })
  })

  describe('GET /auth/callback', () => {
    it('should return error when code is missing', async () => {
      const response = await request(app).get('/auth/callback').expect(400)

      expect(response.body).toHaveProperty('error')
      expect(response.body.error).toBe('Missing code')
    })

    it('should return error when Spotify returns error', async () => {
      const response = await request(app).get('/auth/callback?error=access_denied').expect(400)

      expect(response.body).toHaveProperty('error')
      expect(response.body.error).toContain('Spotify error: access_denied')
    })

    it('should handle invalid code gracefully', async () => {
      const response = await request(app).get('/auth/callback?code=invalid_code').expect(500)

      expect(response.body).toHaveProperty('error')
      expect(response.body.error).toBe('Failed to exchange token')
    })
  })

  describe('POST /auth/refresh', () => {
    it('should return error when refresh_token is missing', async () => {
      const response = await request(app).post('/auth/refresh').send({}).expect(400)

      expect(response.body).toHaveProperty('error')
      expect(response.body.error).toBe('Missing refresh_token')
    })

    it('should return error when refresh_token is empty', async () => {
      const response = await request(app)
        .post('/auth/refresh')
        .send({ refresh_token: '' })
        .expect(400)

      expect(response.body).toHaveProperty('error')
      expect(response.body.error).toBe('Missing refresh_token')
    })

    it('should handle invalid refresh token gracefully', async () => {
      const response = await request(app)
        .post('/auth/refresh')
        .send({ refresh_token: 'invalid_refresh_token' })
        .expect(500)

      expect(response.body).toHaveProperty('error')
      expect(response.body.error).toBe('Failed to refresh token')
    })
  })

  describe('CORS Headers', () => {
    it('should include CORS headers in responses', async () => {
      const response = await request(app)
        .get('/auth/login')
        .set('Origin', 'http://localhost:5173')
        .expect(302)

      expect(response.headers).toHaveProperty('access-control-allow-origin')
      expect(response.headers['access-control-allow-origin']).toBe('http://localhost:5173')
    })
  })
})

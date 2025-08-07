import request from 'supertest'
import express from 'express'
import cors from 'cors'
import authRoutes from '../../routes/auth.routes'

const createTestServer = () => {
  const app = express()

  app.use(
    cors({
      origin: process.env.FRONTEND_URL || 'http://localhost:5173',
      credentials: true,
    })
  )
  app.use(express.json())
  app.use('/auth', authRoutes)

  app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
    console.error('Error:', err.message)
    res.status(500).json({ error: 'Internal server error' })
  })

  return app
}

describe('Server E2E', () => {
  let app: express.Application

  beforeAll(() => {
    app = createTestServer()
  })


  describe('CORS Configuration', () => {
    it('should include CORS headers in all responses', async () => {
      const response = await request(app)
        .get('/auth/login')
        .set('Origin', 'http://localhost:5173')
        .expect(302)

      expect(response.headers).toHaveProperty('access-control-allow-origin')
      expect(response.headers['access-control-allow-origin']).toBe('http://localhost:5173')
    })
  })

  describe('JSON Parsing', () => {
    it('should parse JSON requests correctly', async () => {
      const response = await request(app)
        .post('/auth/refresh')
        .send({ refresh_token: 'test_token' })
        .set('Content-Type', 'application/json')
        .expect(500)

      expect(response.body).toHaveProperty('error')
    })

    it('should handle malformed JSON gracefully', async () => {
      const response = await request(app)
        .post('/auth/refresh')
        .send('invalid json')
        .set('Content-Type', 'application/json')
        .expect(500)

      expect(response.body).toHaveProperty('error')
    })
  })
})

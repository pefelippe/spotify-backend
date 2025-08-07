import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'

import authRoutes from './routes/auth.routes'

interface ErrorWithMessage {
  message: string
  status?: number
}

dotenv.config({
  path: process.env.NODE_ENV === 'production' ? '.env.production' : '.env.local',
})

const app = express()

app.use((req, res, next) => {
  next()
})

app.use(
  cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true,
  })
)
app.use(express.json())

app.use('/auth', authRoutes)

app.use(
  (
    err: ErrorWithMessage,
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ) => {
    console.error('Error:', err.message)
    res.status(500).json({ error: 'Internal server error' })
  }
)

const PORT = process.env.PORT || 3001

app.listen(PORT, () => {
})

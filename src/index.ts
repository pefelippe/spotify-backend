import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'

import { getAppConfig } from './config/app.config'
import { createContainer } from './container'
import createAuthRoutes from './routes/auth.routes'
import { errorHandler } from './middleware/error-handler'
import { createLogger } from './utils/logger'

dotenv.config({
  path: process.env.NODE_ENV === 'production' ? '.env.production' : '.env.local',
})

const logger = createLogger('App')

const createApp = () => {
  const app = express()

  const container = createContainer()

  const config = getAppConfig()

  app.use(express.json())
  app.use(
    cors({
      origin: config.frontendUrl,
      credentials: true,
    })
  )

  app.use((req, res, next) => {
    logger.info(`${req.method} ${req.path}`, {
      method: req.method,
      path: req.path,
      userAgent: req.get('User-Agent'),
      ip: req.ip,
    })
    next()
  })

  app.use('/auth', createAuthRoutes(container))

  app.get('/health', (req, res) => {
    res.json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      environment: config.nodeEnv,
    })
  })

  app.use(errorHandler)

  return app
}

const startServer = () => {
  const app = createApp()
  const config = getAppConfig()
  const PORT = config.port

  app.listen(PORT, () => {
    logger.info(`🚀 Server running on port ${PORT} in ${config.nodeEnv} mode`)
    logger.info(`📊 Health check available at http://localhost:${PORT}/health`)
  })
}

if (require.main === module) {
  startServer()
}

export { createApp, startServer }

import express from 'express'
import cors from 'cors'
import type { CorsOptions } from 'cors'
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

  const allowedOrigins = ['http://localhost:5173', 'https://d35f04a2c751.ngrok-free.app']

  const isOriginAllowed = (origin?: string): boolean => {
    if (!origin) return true
    try {
      const { hostname } = new URL(origin)
      if (hostname.endsWith('.vercel.app')) return true
    } catch {}
    return allowedOrigins.includes(origin)
  }

  const corsOptions: CorsOptions = {
    credentials: true,
    origin: (origin, callback) => {
      if (isOriginAllowed(origin || undefined)) return callback(null, true)
      return callback(new Error('Not allowed by CORS'))
    },
  }

  app.use(cors(corsOptions))
  app.options('*', cors(corsOptions))

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

  app.get('/', (req, res) => {
    res.send(`
      <!DOCTYPE html>
      <html lang="pt-BR">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Spotify Backend API</title>
          <style>
            * {
              margin: 0;
              padding: 0;
              box-sizing: border-box;
            }
            
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              min-height: 100vh;
              display: flex;
              align-items: center;
              justify-content: center;
              padding: 20px;
            }
            
            .container {
              background: white;
              border-radius: 16px;
              box-shadow: 0 20px 40px rgba(0,0,0,0.1);
              padding: 40px;
              max-width: 600px;
              width: 100%;
              text-align: center;
            }
            
            .logo {
              font-size: 3rem;
              margin-bottom: 20px;
            }
            
            h1 {
              color: #1DB954;
              margin-bottom: 20px;
              font-size: 2.5rem;
              font-weight: 700;
            }
            
            .description {
              color: #666;
              font-size: 1.1rem;
              line-height: 1.6;
              margin-bottom: 30px;
            }
            
            .endpoints {
              background: #f8f9fa;
              border-radius: 12px;
              padding: 25px;
              margin-bottom: 25px;
            }
            
            .endpoints h3 {
              color: #333;
              margin-bottom: 20px;
              font-size: 1.3rem;
            }
            
            .endpoint {
              background: white;
              padding: 15px;
              border-radius: 8px;
              margin: 10px 0;
              font-family: 'Monaco', 'Menlo', monospace;
              font-size: 0.9rem;
              border-left: 4px solid #1DB954;
              text-align: left;
            }
            
            .method {
              color: #1DB954;
              font-weight: bold;
            }
            
            .path {
              color: #333;
            }
            
            .description-endpoint {
              color: #666;
              font-size: 0.85rem;
              margin-top: 5px;
            }
            
            .environment {
              background: #e9ecef;
              padding: 15px;
              border-radius: 8px;
              color: #495057;
              font-size: 0.9rem;
            }
            
            .status {
              display: inline-block;
              background: #28a745;
              color: white;
              padding: 8px 16px;
              border-radius: 20px;
              font-size: 0.9rem;
              margin-bottom: 20px;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="logo">🎵</div>
            <h1>Spotify Backend API</h1>
            <div class="status">🟢 Online</div>
            
            <p class="description">
              Bem-vindo à API do Spotify Backend. Este serviço fornece autenticação e dados musicais através de endpoints RESTful.
            </p>
            
            <div class="endpoints">
              <h3>📡 Endpoints Disponíveis</h3>
              
              <div class="endpoint">
                <span class="method">GET</span> <span class="path">/health</span>
                <div class="description-endpoint">Verificação de status da API</div>
              </div>
              
              <div class="endpoint">
                <span class="method">GET</span> <span class="path">/auth/login</span>
                <div class="description-endpoint">Login OAuth do Spotify</div>
              </div>
              
              <div class="endpoint">
                <span class="method">GET</span> <span class="path">/auth/callback</span>
                <div class="description-endpoint">Callback OAuth do Spotify</div>
              </div>
              
              <div class="endpoint">
                <span class="method">POST</span> <span class="path">/auth/refresh</span>
                <div class="description-endpoint">Renovação do token de acesso</div>
              </div>
            </div>
            
            <div class="environment">
              <strong>Ambiente:</strong> ${config.nodeEnv} | 
              <strong>Timestamp:</strong> ${new Date().toLocaleString('pt-BR')}
            </div>
          </div>
        </body>
      </html>
    `)
  })

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

const app = createApp()

const startServer = () => {
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

export default app

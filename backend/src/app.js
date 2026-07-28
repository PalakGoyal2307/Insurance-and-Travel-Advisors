import express from 'express'
import helmet from 'helmet'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import morgan from 'morgan'
import apiRoutes from './routes/index.js'
import { env } from './config/env.js'
import { apiRateLimiter } from './middleware/rateLimiters.js'
import { notFoundHandler } from './middleware/notFound.js'
import { errorHandler } from './middleware/errorHandler.js'

const app = express()

if (env.trustProxy) {
  app.set('trust proxy', 1)
}

app.use(
  cors({
    origin: env.frontendUrl,
    credentials: true,
  })
)

app.use(
  helmet({
    crossOriginResourcePolicy: false,
  })
)

app.use(express.json({ limit: '1mb' }))
app.use(express.urlencoded({ extended: true }))
app.use(cookieParser())

if (env.nodeEnv !== 'production') {
  app.use(morgan('dev'))
}

app.use('/api', apiRateLimiter, apiRoutes)

app.get('/', (_req, res) => {
  res.status(200).json({
    success: true,
    message: 'Welcome to PNP Advisors API',
  })
})

app.use(notFoundHandler)
app.use(errorHandler)

export default app

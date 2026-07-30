import app from './app.js'
import { env } from './config/env.js'
import { connectToDatabase } from './config/db.js'
import { initializeInsuranceSheetHeaders } from './services/googleSheetsService.js'

const startServer = async () => {
  await connectToDatabase()
  await initializeInsuranceSheetHeaders().catch((error) => {
    console.error('Failed to initialize static Google Sheets insurance headers:', error)
  })

  const server = app.listen(env.port, () => {
    console.log(`PNP Advisors backend running on port ${env.port}`)
  })

  const gracefulShutdown = (signal) => {
    console.log(`${signal} received. Shutting down gracefully...`)
    server.close(() => {
      console.log('HTTP server closed')
      process.exit(0)
    })
  }

  process.on('SIGINT', () => gracefulShutdown('SIGINT'))
  process.on('SIGTERM', () => gracefulShutdown('SIGTERM'))
}

startServer().catch((error) => {
  console.error('Failed to start backend server:', error)
  process.exit(1)
})

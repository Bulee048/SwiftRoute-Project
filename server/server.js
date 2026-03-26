import express from 'express'
import http from 'http'
import { Server } from 'socket.io'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import helmet from 'helmet'
import morgan from 'morgan'
import dotenv from 'dotenv'

import connectDB from './config/db.js'
import { socketHandler } from './sockets/socketHandler.js'
import { errorMiddleware } from './middleware/error.middleware.js'

import authRoutes from './routes/auth.routes.js'
import userRoutes from './routes/user.routes.js'
import merchantRoutes from './routes/merchant.routes.js'
import driverRoutes from './routes/driver.routes.js'
import vehicleRoutes from './routes/vehicle.routes.js'
import orderRoutes from './routes/order.routes.js'
import shipmentRoutes from './routes/shipment.routes.js'
import paymentRoutes from './routes/payment.routes.js'

dotenv.config()

const app = express()
const httpServer = http.createServer(app)
const io = new Server(httpServer, {
  cors: { origin: process.env.CLIENT_URL, credentials: true },
})

app.use(helmet())
app.use(cors({ origin: process.env.CLIENT_URL, credentials: true }))
app.use(morgan('dev'))
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true }))
app.use(cookieParser())

app.set('io', io)

app.get('/api/health', (req, res) => res.json({ status: 'OK', timestamp: new Date() }))

app.use('/api/v1/auth', authRoutes)
app.use('/api/v1/users', userRoutes)
app.use('/api/v1/merchants', merchantRoutes)
app.use('/api/v1/drivers', driverRoutes)
app.use('/api/v1/vehicles', vehicleRoutes)
app.use('/api/v1/orders', orderRoutes)
app.use('/api/v1/shipments', shipmentRoutes)
app.use('/api/v1/payments', paymentRoutes)

socketHandler(io)
app.use(errorMiddleware)

const PORT = process.env.PORT || 5000

httpServer.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`❌ Port ${PORT} is already in use. Stop the existing process and restart.`)
    process.exit(1)
  }
  console.error('❌ Server start failed:', err.message)
  process.exit(1)
})

httpServer.listen(PORT, () => console.log(`🚀 SwiftRoute server running on port ${PORT}`))

connectDB().catch((err) => {
  console.error('⚠️ MongoDB connection failed:', err.message)
  console.error('⚠️ API will be partially available until MongoDB is running.')
})


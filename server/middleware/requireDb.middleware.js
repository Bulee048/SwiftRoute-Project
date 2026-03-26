import mongoose from 'mongoose'
import { ApiResponse } from '../utils/ApiResponse.js'

export function requireDb(req, res, next) {
  if (mongoose.connection.readyState !== 1) {
    return ApiResponse.error(res, 'MongoDB not connected. Start MongoDB and try again.', 503)
  }
  next()
}


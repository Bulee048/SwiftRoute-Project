export const errorMiddleware = (err, req, res, next) => {
  let statusCode = err.statusCode || 500
  let message = err.message || 'Internal Server Error'

  if (err.message === 'Validation error' && err.details) {
    return res.status(400).json({ success: false, message: 'Validation error', errors: err.details })
  }

  if (err.code === 11000) {
    message = `Duplicate value for field: ${Object.keys(err.keyValue).join(', ')}`
    statusCode = 400
  }
  if (err.name === 'ValidationError') {
    message = Object.values(err.errors)
      .map((e) => e.message)
      .join(', ')
    statusCode = 400
  }
  if (err.name === 'JsonWebTokenError') {
    message = 'Invalid token'
    statusCode = 401
  }
  if (err.name === 'TokenExpiredError') {
    message = 'Token expired'
    statusCode = 401
  }

  res.status(statusCode).json({
    success: false,
    message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  })
}


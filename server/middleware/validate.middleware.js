import { validationResult } from 'express-validator'
import { ApiResponse } from '../utils/ApiResponse.js'

export function validate(req, res, next) {
  const result = validationResult(req)
  if (result.isEmpty()) return next()
  return ApiResponse.error(res, 'Validation error', 400, result.array())
}


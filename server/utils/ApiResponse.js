export class ApiResponse {
  static success(res, data, message = 'Success', statusCode = 200) {
    return res.status(statusCode).json({ success: true, message, data })
  }

  static error(res, message = 'Server Error', statusCode = 500, errors = null) {
    return res.status(statusCode).json({ success: false, message, ...(errors && { errors }) })
  }

  static paginated(res, data, pagination) {
    return res.status(200).json({ success: true, data, pagination })
  }
}


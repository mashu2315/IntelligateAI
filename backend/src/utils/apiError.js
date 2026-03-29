class ApiError extends Error {
  constructor(statusCode, message) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }

  static badRequest(msg) { return new ApiError(400, msg); }
  static unauthorized(msg) { return new ApiError(401, msg || 'Unauthorized'); }
  static forbidden(msg) { return new ApiError(403, msg || 'Forbidden'); }
  static notFound(msg) { return new ApiError(404, msg || 'Not Found'); }
  static conflict(msg) { return new ApiError(409, msg); }
  static tooMany(msg) { return new ApiError(429, msg || 'Rate limit exceeded'); }
  static internal(msg) { return new ApiError(500, msg || 'Internal Server Error'); }
  static badGateway(msg) { return new ApiError(502, msg || 'Bad Gateway'); }
}

module.exports = ApiError;

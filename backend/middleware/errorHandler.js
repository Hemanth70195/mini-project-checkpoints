/**
 * errorHandler.js
 * Centralized Express Error Handling Middleware
 */

export function notFound(req, res, next) {
  res.status(404).json({
    success: false,
    message: `Not Found - ${req.originalUrl}`
  });
}

export function errorHandler(err, req, res, next) {
  console.error('[SERVER ERROR]', err.stack || err.message);

  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;

  // Handle Mongoose validation errors
  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors).map(val => val.message);
    return res.status(400).json({
      success: false,
      message: 'Validation Error',
      errors: messages
    });
  }

  // Handle Mongoose duplicate key error
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    return res.status(400).json({
      success: false,
      message: `Duplicate value entered for '${field}'. Must be unique.`
    });
  }

  // General server error
  res.status(statusCode).json({
    success: false,
    message: err.message || 'Internal Server Error',
    stack: process.env.NODE_ENV === 'production' ? null : err.stack
  });
}

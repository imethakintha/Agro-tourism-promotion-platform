import SystemLog from '../models/SystemLog.js';

const notFound = (req, res, next) => {
  const error = new Error(`Not Found - ${req.originalUrl}`);
  res.status(404);
  next(error);
};

const errorHandler = async (err, req, res, next) => {
  let statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  let message = err.message;

  // Mongoose bad ObjectId
  if (err.name === 'CastError' && err.kind === 'ObjectId') {
    statusCode = 404;
    message = 'Resource not found';
  }

  // Log to DB
  if (statusCode === 500) {
      try {
          await SystemLog.create({
              level: 'ERROR',
              message: message,
              stack: err.stack,
              metadata: {
                  path: req.originalUrl,
                  method: req.method
              }
          });
      } catch (logErr) {
          console.error('Failed to log error:', logErr);
      }
  }

  res.status(statusCode).json({
    success: false,
    message,
    stack: process.env.NODE_ENV === 'production' ? null : err.stack,
  });
};

export { notFound, errorHandler };
import { Request, Response, NextFunction } from 'express';
import logger from '../utils/logger';
import config from '../config';
import { AppError } from '../utils/errors';

const errorHandler = (
  err: Error | AppError,
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  // Check if it's an operational error (expected error)
  if (err instanceof AppError && err.isOperational) {
    logger.warn(err.message, {
      statusCode: err.statusCode,
      stack: err.stack,
      url: req.url,
      method: req.method,
    });

    return res.status(err.statusCode).json({
      status: 'error',
      statusCode: err.statusCode,
      message: err.message,
      ...(config.ENV === 'development' && { stack: err.stack }),
    });
  }

  // Unexpected error (programming error or unknown error)
  logger.error('Unexpected error occurred', {
    error: err.message,
    stack: err.stack,
    url: req.url,
    method: req.method,
  });

  return res.status(500).json({
    status: 'error',
    statusCode: 500,
    message:
      config.ENV === 'development' ? err.message : 'Internal Server Error',
    ...(config.ENV === 'development' && { stack: err.stack }),
  });
};

export default errorHandler;

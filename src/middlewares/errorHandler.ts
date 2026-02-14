import { Request, Response, NextFunction } from 'express';
import logger from '../utils/logger';
import config from '../config';

interface AppError extends Error {
  statusCode?: number;
}

const errorHandler = (err: AppError, req: Request, res: Response, next: NextFunction) => {
  logger.error(err.message, { stack: err.stack });

  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';

  res.status(statusCode).json({
    status: 'error',
    statusCode,
    message,
    ...(config.ENV === 'development' && { stack: err.stack }),
  });
};

export default errorHandler;

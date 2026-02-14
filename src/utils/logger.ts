import winston from 'winston';
import config from '../config';

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  defaultMeta: { service: 'user-service' },
  transports: [
    new winston.transports.File({ filename: 'logs/error.log', level: 'error' } as winston.transports.FileTransportOptions),
    new winston.transports.File({ filename: 'logs/combined.log' }),
  ],
});

if (config.ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.combine(
      winston.format.colorize(),
      winston.format.simple()
    ),
  } as winston.transports.ConsoleTransportOptions));
}

export default logger;

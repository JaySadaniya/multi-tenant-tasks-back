import express, { Request, Response, NextFunction } from 'express';
import helmet from 'helmet';
import cors from 'cors';
import compression from 'compression';
import morgan from 'morgan';
import routes from './routes';
import errorHandler from './middlewares/errorHandler';
import logger from './utils/logger';

const app = express();

// Middlewares
app.use(helmet());
app.use(cors());
app.use(compression());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('combined', { stream: { write: (message: string) => logger.info(message.trim()) } }));
// Note: config could be used here to conditionalize morgan if needed, but keeping standard


// Routes
app.use('/api/v1', routes);

// Error Handling
app.use((_req: Request, _res: Response, next: NextFunction) => {
  const error: any = new Error('Not Found');
  error.statusCode = 404;
  next(error);
});

app.use(errorHandler);

export default app;

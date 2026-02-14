import app from './app';
import logger from './utils/logger';
import config from './config';
// import { sequelize } from './models'; // Uncomment when models are set up

const startServer = async () => {
  try {
    // Authenticate database connection
    // await sequelize.authenticate();
    // logger.info('Database connection established successfully.');

    app.listen(config.PORT, () => {
      logger.info(`Server is running on port ${config.PORT}`);
    });
  } catch (error) {
    logger.error('Unable to connect to the database:', error);
    process.exit(1);
  }
};

startServer();

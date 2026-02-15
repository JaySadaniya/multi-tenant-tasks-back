import dotenv from 'dotenv';
dotenv.config();

const config = {
  ENV: process.env.NODE_ENV || 'development',
  PORT: parseInt(process.env.PORT as string, 10) || 3000,
  SALT_ROUNDS: parseInt(process.env.SALT_ROUNDS as string, 10) || 10,
  JWT_SECRET: process.env.JWT_SECRET || 'your_jwt_secret',
  DB: {
    USERNAME: process.env.DB_USERNAME as string,
    PASSWORD: process.env.DB_PASSWORD as string,
    DATABASE: process.env.DB_NAME as string,
    HOST: process.env.DB_HOST as string,
    PORT: parseInt(process.env.DB_PORT as string, 10) || 5432,
    DIALECT: process.env.DB_DIALECT || 'postgres',
  },
};

export default config;

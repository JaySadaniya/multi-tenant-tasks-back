import config from './index';

module.exports = {
  development: {
    username: config.DB.USERNAME,
    password: config.DB.PASSWORD,
    database: config.DB.DATABASE,
    host: config.DB.HOST,
    port: config.DB.PORT,
    dialect: config.DB.DIALECT,
    logging: false
  },
  test: {
    username: config.DB.USERNAME,
    password: config.DB.PASSWORD,
    database: config.DB.DATABASE,
    host: config.DB.HOST,
    port: config.DB.PORT,
    dialect: config.DB.DIALECT,
    logging: false
  },
  production: {
    username: config.DB.USERNAME,
    password: config.DB.PASSWORD,
    database: config.DB.DATABASE,
    host: config.DB.HOST,
    port: config.DB.PORT,
    dialect: config.DB.DIALECT,
    logging: false
  }
};

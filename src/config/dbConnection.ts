import { Sequelize, Dialect } from 'sequelize';
import config from './index';

const sequelize = new Sequelize(
  config.DB.DATABASE,
  config.DB.USERNAME,
  config.DB.PASSWORD,
  {
    host: config.DB.HOST,
    port: config.DB.PORT,
    dialect: config.DB.DIALECT as Dialect,
    logging: false,
  }
);

export default sequelize;
export { sequelize };

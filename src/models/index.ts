import fs from 'fs';
import path from 'path';
import { Sequelize, DataTypes } from 'sequelize';
import config from '../config';

const basename = path.basename(__filename);
const db: any = {};

let sequelize: Sequelize;
if (config.ENV === 'test') { // Example condition, adapt as needed or purely use config
   sequelize = new Sequelize(config.DB.DATABASE, config.DB.USERNAME, config.DB.PASSWORD, {
     host: config.DB.HOST,
     port: config.DB.PORT,
     dialect: config.DB.DIALECT as any,
     // ... other options
   });
} else {
   sequelize = new Sequelize(config.DB.DATABASE, config.DB.USERNAME, config.DB.PASSWORD, {
      host: config.DB.HOST,
      port: config.DB.PORT,
      dialect: config.DB.DIALECT as any,
   });
}

fs
  .readdirSync(__dirname)
  .filter(file => {
    return (
      file.indexOf('.') !== 0 &&
      file !== basename &&
      file.slice(-3) === '.ts' &&
      file.indexOf('.test.ts') === -1
    );
  })
  .forEach(file => {
    const model = require(path.join(__dirname, file))(sequelize, require('sequelize').DataTypes);
    db[model.name] = model;
  });

Object.keys(db).forEach(modelName => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

db.sequelize = sequelize;
db.Sequelize = Sequelize;

export default db;

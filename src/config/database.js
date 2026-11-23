require('dotenv').config();
const { Sequelize } = require('sequelize');

const isTest = process.env.NODE_ENV === 'test';

const sequelize = isTest
  ? new Sequelize({
      dialect: 'sqlite',
      storage: ':memory:',
      logging: false,
      define: {
        timestamps: true,
        underscored: true
      }
    })
  : new Sequelize(
      process.env.DB_NAME || 'dripstore_db',
      process.env.DB_USER || 'root',
      process.env.DB_PASSWORD || 'root',
      {
        host: process.env.DB_HOST || 'localhost',
        port: process.env.DB_PORT || 3306,
        dialect: process.env.DB_DIALECT || 'mysql',
        logging: false,
        define: {
          timestamps: true,
          underscored: true
        }
      }
    );

module.exports = sequelize;


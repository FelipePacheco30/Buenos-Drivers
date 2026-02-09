import dotenv from 'dotenv';

dotenv.config();

export default {
  NODE_ENV: process.env.NODE_ENV || 'development',

  APP_PORT: process.env.APP_PORT || 3333,

  JWT_SECRET: process.env.JWT_SECRET || 'buenos_drivers_secret',
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '7d',

  DATABASE: {
    HOST: process.env.DB_HOST || 'localhost',
    PORT: process.env.DB_PORT || 5432,
    NAME: process.env.DB_NAME || 'buenos',
    USER: process.env.DB_USER || 'postgres',
    PASSWORD: process.env.DB_PASSWORD || 'postgres',
  },

  WEBSOCKET: {
    PATH: '/ws',
  }
};

const dotenv = require('dotenv');
dotenv.config();

/**
 * Validated application configuration.
 * All environment variables are read here and exported as a single object.
 */
const config = {
  port: parseInt(process.env.PORT, 10) || 5000,
  mongoUri: process.env.MONGODB_URI || 'mongodb://localhost:27017/skillvista',
  jwtSecret: process.env.JWT_SECRET || 'default-secret',
  jwtRefreshSecret: process.env.JWT_REFRESH_SECRET || 'default-refresh-secret',
  jwtExpire: process.env.JWT_EXPIRE || '15m',
  jwtRefreshExpire: process.env.JWT_REFRESH_EXPIRE || '7d',
  geminiApiKey: process.env.GEMINI_API_KEY || '',
  aiModuleUrl: process.env.AI_MODULE_URL || 'http://localhost:5001',
  nodeEnv: process.env.NODE_ENV || 'development',
};

module.exports = config;

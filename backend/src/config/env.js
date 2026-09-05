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
  // --- iGOT / NSSTA adapter mode (mock | live) ---
  igotMode: process.env.IGOT_MODE || 'mock',
  nsstaMode: process.env.NSSTA_MODE || 'mock',
  // --- SSO (OAuth2/OIDC) ---
  // Set these to point at a real government IdP. When unset, ssoAuth.js serves a dev-mode mock consent page.
  ssoIssuerUrl: process.env.SSO_ISSUER_URL || '',
  ssoClientId: process.env.SSO_CLIENT_ID || 'skillvista-dev',
  ssoClientSecret: process.env.SSO_CLIENT_SECRET || '',
  ssoCallbackUrl: process.env.SSO_CALLBACK_URL || 'http://localhost:5000/api/v1/sso/callback',
};

module.exports = config;


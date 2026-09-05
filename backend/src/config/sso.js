'use strict';

const config = require('./env');

/**
 * SSO / Identity Provider Configuration
 *
 * To connect a live government IdP (Parichay / Jan Parichay / NIC SSO):
 * 1. Set SSO_ISSUER_URL to the IdP authorization endpoint (e.g. https://parichay.nic.in/pnv1/oauth/authorize).
 * 2. Set SSO_CLIENT_ID and SSO_CLIENT_SECRET provided by the IdP admin.
 * 3. Ensure SSO_CALLBACK_URL is registered in the IdP console.
 */
module.exports = {
  issuerUrl: config.ssoIssuerUrl,
  clientId: config.ssoClientId,
  clientSecret: config.ssoClientSecret,
  callbackUrl: config.ssoCallbackUrl,
};

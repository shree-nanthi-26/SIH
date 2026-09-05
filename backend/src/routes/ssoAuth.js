'use strict';

/**
 * SSO / Identity Provider Authentication Routes
 *
 * Simulates integration with Government of India Identity Providers
 * (Jan Parichay / Parichay / NIC SSO / iGOT Karmayogi SSO).
 *
 * === To integrate with a real OIDC / OAuth2 IdP ===
 * 1. Set SSO_ISSUER_URL to the IdP's OAuth authorize endpoint.
 * 2. Set SSO_CLIENT_ID and SSO_CLIENT_SECRET.
 * 3. In /callback, exchange authorization code for ID token via IdP token endpoint,
 *    verify the JWT signature using IdP JWKS, and extract email/name claims.
 * 4. Map the IdP identity to the local User & OfficerProfile records.
 */

const express = require('express');
const ssoConfig = require('../config/sso');
const User = require('../models/User');
const OfficerProfile = require('../models/OfficerProfile');
const { generateAccessToken, generateRefreshToken } = require('../utils/tokens');
const { sendSuccess, sendError } = require('../utils/response');

const router = express.Router();

/**
 * GET /api/v1/sso/login
 * Initiates SSO login flow.
 */
router.get('/login', (req, res) => {
  if (ssoConfig.issuerUrl) {
    const params = new URLSearchParams({
      client_id: ssoConfig.clientId,
      redirect_uri: ssoConfig.callbackUrl,
      response_type: 'code',
      scope: 'openid profile email',
    });
    return res.redirect(`${ssoConfig.issuerUrl}?${params.toString()}`);
  }

  // Dev / Mock Mode: Serve interactive single sign-on consent page
  const html = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <title>Jan Parichay / NIC SSO Mock Gateway</title>
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #0f172a; color: #f8fafc; display: flex; align-items: center; justify-content: center; min-height: 100vh; margin: 0; }
        .card { background: #1e293b; padding: 2.5rem; border-radius: 12px; box-shadow: 0 20px 25px -5px rgba(0,0,0,0.5); max-width: 480px; width: 100%; border: 1px solid #334155; }
        .badge { background: #0284c7; color: white; padding: 4px 10px; border-radius: 9999px; font-size: 12px; font-weight: 600; text-transform: uppercase; }
        h1 { font-size: 1.5rem; margin: 1rem 0 0.5rem; color: #fff; }
        p { color: #94a3b8; font-size: 0.95rem; line-height: 1.5; }
        .btn { display: block; width: 100%; padding: 0.75rem 1rem; border: none; border-radius: 8px; font-weight: 600; font-size: 0.95rem; cursor: pointer; text-align: center; text-decoration: none; box-sizing: border-box; margin-top: 0.75rem; }
        .btn-primary { background: #2563eb; color: #fff; }
        .btn-primary:hover { background: #1d4ed8; }
        .btn-secondary { background: #334155; color: #e2e8f0; }
        .btn-secondary:hover { background: #475569; }
        .divider { text-align: center; margin: 1.25rem 0; color: #64748b; font-size: 0.85rem; }
        input { width: 100%; padding: 0.75rem; border-radius: 6px; border: 1px solid #475569; background: #0f172a; color: white; box-sizing: border-box; margin-bottom: 0.75rem; }
      </style>
    </head>
    <body>
      <div class="card">
        <span class="badge">National Informatics Centre (NIC) Mock SSO</span>
        <h1>Jan Parichay Single Sign-On</h1>
        <p>You are authenticating to <strong>SkillVista — MoSPI Competency Platform</strong> using Government of India Single Sign-On.</p>
        
        <a class="btn btn-primary" href="/api/v1/sso/callback?email=rajesh.kumar@mospi.gov.in&name=Rajesh+Kumar">
          Continue as Rajesh Kumar (ISS Officer)
        </a>
        <a class="btn btn-secondary" href="/api/v1/sso/callback?email=priya.sharma@mospi.gov.in&name=Priya+Sharma">
          Continue as Priya Sharma (Assistant Director)
        </a>

        <div class="divider">OR USE CUSTOM GOV ID</div>
        <form action="/api/v1/sso/callback" method="GET">
          <input type="email" name="email" placeholder="officer@nic.in" required />
          <input type="text" name="name" placeholder="Officer Full Name" />
          <button type="submit" class="btn btn-secondary">Sign In with Custom ID</button>
        </form>
      </div>
    </body>
    </html>
  `;
  res.setHeader('Content-Type', 'text/html');
  return res.send(html);
});

/**
 * GET /api/v1/sso/callback
 * Handles IdP redirect with auth code or mock query params.
 */
router.get('/callback', async (req, res) => {
  try {
    const email = req.query.email || 'officer@nic.in';
    const rawName = (req.query.name || email.split('@')[0].replace('.', ' ')).trim();
    const parts = rawName.split(' ');
    const firstName = parts[0] || 'Officer';
    const lastName = parts.slice(1).join(' ') || 'User';

    let user = await User.findOne({ email });
    if (!user) {
      user = await User.create({
        firstName,
        lastName,
        email,
        password: Math.random().toString(36).slice(-10) + 'A1!',
        role: 'officer',
      });
    }

    // Ensure OfficerProfile exists
    let profile = await OfficerProfile.findOne({ user: user._id });
    if (!profile) {
      profile = await OfficerProfile.create({
        user: user._id,
        currentSkills: [],
      });
    }

    const accessToken = generateAccessToken(user._id);
    const refreshToken = generateRefreshToken(user._id);

    // If client requested JSON (e.g. programmatic test)
    if (req.headers.accept && req.headers.accept.includes('application/json')) {
      return sendSuccess(res, 200, {
        user: { id: user._id, name: user.name, email: user.email, role: user.role },
        accessToken,
        refreshToken,
      });
    }

    // Redirect to frontend login with tokens
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    return res.redirect(`${frontendUrl}/login?ssoToken=${accessToken}&ssoRefreshToken=${refreshToken}`);
  } catch (err) {
    return sendError(res, 500, 'SSO authentication failed: ' + err.message);
  }
});

module.exports = router;

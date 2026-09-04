const express = require('express');
const {
  register,
  login,
  refreshTokenHandler,
  logout,
  getMe,
} = require('../controllers/authController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.post('/refresh-token', refreshTokenHandler);
router.post('/logout', protect, logout);
router.get('/me', protect, getMe);

module.exports = router;

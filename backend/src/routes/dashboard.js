const express = require('express');
const {
  getOfficerDashboard,
  getAdminDashboard,
} = require('../controllers/dashboardController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.use(protect);

router.get('/officer/:id', getOfficerDashboard);
router.get('/admin', authorize('admin'), getAdminDashboard);

module.exports = router;

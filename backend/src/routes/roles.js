const express = require('express');
const {
  getRoles,
  getRoleById,
  createRole,
  updateRole,
  deleteRole,
} = require('../controllers/roleController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.get('/', getRoles);
router.get('/:id', getRoleById);

router.post('/', protect, authorize('admin'), createRole);
router.put('/:id', protect, authorize('admin'), updateRole);
router.delete('/:id', protect, authorize('admin'), deleteRole);

module.exports = router;

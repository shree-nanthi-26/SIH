const express = require('express');
const {
  getSkills,
  getSkillById,
  createSkill,
  updateSkill,
  deleteSkill,
} = require('../controllers/skillController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.get('/', getSkills);
router.get('/:id', getSkillById);

// Admin-only mutations
router.post('/', protect, authorize('admin'), createSkill);
router.put('/:id', protect, authorize('admin'), updateSkill);
router.delete('/:id', protect, authorize('admin'), deleteSkill);

module.exports = router;

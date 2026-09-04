const express = require('express');
const {
  getSkillGap,
  getLearningPath,
  getOfficerProfile,
  updateOfficerProfile,
} = require('../controllers/officerController');
const { getOfficerAttempts } = require('../controllers/quizController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.use(protect);

router.get('/:id/profile', getOfficerProfile);
router.put('/:id/profile', updateOfficerProfile);
router.get('/:id/skill-gap', getSkillGap);
router.get('/:id/learning-path', getLearningPath);
router.get('/:id/attempts', getOfficerAttempts);

module.exports = router;

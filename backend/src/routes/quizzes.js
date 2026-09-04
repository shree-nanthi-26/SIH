const express = require('express');
const {
  getQuizzes,
  getQuizById,
  createQuiz,
  deleteQuiz,
  submitAttempt,
} = require('../controllers/quizController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.use(protect);

router.get('/', getQuizzes);
router.get('/:id', getQuizById);
router.post('/', createQuiz);
router.delete('/:id', deleteQuiz);
router.post('/:id/attempt', submitAttempt);

module.exports = router;

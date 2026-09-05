'use strict';

const express = require('express');
const { queryAssistant } = require('../controllers/assistantController');

const router = express.Router();

/**
 * POST /api/assistant/query
 * Learner queries answered in the context of their profile and learning path.
 */
router.post('/query', queryAssistant);

module.exports = router;

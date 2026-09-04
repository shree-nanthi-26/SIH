const express = require('express');
const { computeSkillGap } = require('../controllers/skillGapController');

const router = express.Router();

router.post('/:officerId', computeSkillGap);

module.exports = router;

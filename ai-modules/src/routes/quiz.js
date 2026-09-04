const express = require('express');
const multer = require('multer');
const path = require('path');
const { generateQuizFromFile } = require('../controllers/quizController');

const router = express.Router();

// Setup Multer for temporary file uploads
const upload = multer({ 
    dest: path.join(__dirname, '../../uploads/'),
    limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

router.post('/generate', upload.single('document'), generateQuizFromFile);

module.exports = router;

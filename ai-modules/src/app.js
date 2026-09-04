const express = require('express');
const skillGapRoutes = require('./routes/skillGap');
const quizRoutes = require('./routes/quiz');

const app = express();
const port = process.env.PORT || 5001;

app.use(express.json());

// Routes
app.use('/api/skill-gap', skillGapRoutes);
app.use('/api/quiz', quizRoutes);

// Health check
app.get('/health', (req, res) => res.json({ status: 'ok', service: 'ai-modules' }));

if (require.main === module) {
    app.listen(port, () => {
        console.log(`🤖 AI Modules service listening on port ${port}`);
    });
}

module.exports = app;

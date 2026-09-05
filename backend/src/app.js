const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const { errorHandler } = require('./middleware/errorHandler');

// Route imports
const authRoutes = require('./routes/auth');
const officerRoutes = require('./routes/officers');
const skillRoutes = require('./routes/skills');
const roleRoutes = require('./routes/roles');
const quizRoutes = require('./routes/quizzes');
const resourceRoutes = require('./routes/resources');
const dashboardRoutes = require('./routes/dashboard');
const igotMockRoutes = require('./routes/igotMock');
const nsstaMockRoutes = require('./routes/nsstaMock');
const ssoAuthRoutes = require('./routes/ssoAuth');

const app = express();

// --------------- Global Middleware ---------------
app.use(helmet());
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

// --------------- Health Check ---------------
app.get('/api/v1/health', (req, res) => {
  res.json({ success: true, data: { status: 'ok', timestamp: new Date() } });
});

// --------------- API Routes ---------------
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/sso', ssoAuthRoutes);
app.use('/api/v1/officers', officerRoutes);
app.use('/api/v1/skills', skillRoutes);
app.use('/api/v1/roles', roleRoutes);
app.use('/api/v1/quizzes', quizRoutes);
app.use('/api/v1/resources', resourceRoutes);
app.use('/api/v1/dashboard', dashboardRoutes);
app.use('/api/v1/igot', igotMockRoutes);
app.use('/api/v1/nssta', nsstaMockRoutes);

// --------------- 404 Handler ---------------
app.use((req, res) => {
  res
    .status(404)
    .json({ success: false, error: { message: `Route ${req.originalUrl} not found` } });
});

// --------------- Global Error Handler ---------------
app.use(errorHandler);

module.exports = app;

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const { notFound, errorHandler } = require('./middleware/error.middleware');

const app = express();

/* ------------------------------ Global middleware ------------------------------ */
app.set('trust proxy', 1);
app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));

const allowedOrigins = [
  process.env.CLIENT_URL || 'http://localhost:5173',
  'http://localhost:5173',
  'http://localhost:4173',
];
app.use(
  cors({
    origin: (origin, cb) => {
      // Allow non-browser tools (curl, postman) and whitelisted origins
      if (!origin || allowedOrigins.includes(origin)) return cb(null, true);
      return cb(null, false);
    },
    credentials: true,
  })
);

app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));

// Basic rate limiting (protects against brute force / abuse)
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 500,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many requests, please try again later.' },
});
app.use('/api', apiLimiter);

/* ---------------------------------- Health ---------------------------------- */
app.get('/api/health', (req, res) => {
  const mongoose = require('mongoose');
  res.json({
    success: true,
    message: 'SkillBridge API is running',
    db: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
    time: new Date().toISOString(),
  });
});

/* ----------------------------------- Routes ---------------------------------- */
// Route modules are registered here as they are built.
app.use('/api/auth', require('./routes/auth.routes'));
app.use('/api/profile', require('./routes/profile.routes'));
app.use('/api/internships', require('./routes/internship.routes'));
app.use('/api/applications', require('./routes/application.routes'));

/* ------------------------------ 404 + error handler --------------------------- */
/* Production: serve the built React client + SPA fallback (single-server deploy) */
if (process.env.NODE_ENV === 'production') {
  const path = require('path');
  const fs = require('fs');
  const clientDist = path.join(__dirname, '..', '..', 'client', 'dist');
  if (fs.existsSync(clientDist)) {
    app.use(express.static(clientDist));
    // Any non-API GET → React Router handles the path client-side
    app.get(/^(?!\/api).*/, (req, res) => {
      res.sendFile(path.join(clientDist, 'index.html'));
    });
  }
}

app.use(notFound);
app.use(errorHandler);

module.exports = app;

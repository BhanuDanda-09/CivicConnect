// ==============================================================================
// Express Application Configuration (app.js)
// Separated from server.js for modular architecture and automated testing
// ==============================================================================

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// Custom Middleware
const requestLogger = require('./middleware/requestLogger');
const notFoundHandler = require('./middleware/notFoundMiddleware');
const errorHandler = require('./middleware/errorMiddleware');

// Central Router
const apiRouter = require('./routes');

const app = express();

// Security: Helmet HTTP Headers
app.use(helmet());

// Security: CORS Configuration
const allowedOrigins = [
  process.env.FRONTEND_URL,
  process.env.CLIENT_URL,
  'http://localhost:5173',
  'http://localhost:3000',
  'http://127.0.0.1:5173',
].filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (e.g. mobile apps, curl, server-to-server)
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error(`Origin '${origin}' not allowed by CivicConnect CORS policy.`));
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  })
);

// Security: Global Rate Limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS, 10) || 15 * 60 * 1000, // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX, 10) || 200, // Limit each IP to 200 requests per window
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  message: {
    success: false,
    statusCode: 429,
    message: 'Too many requests from this IP address. Please retry after 15 minutes.',
  },
  skip: () => process.env.NODE_ENV === 'test', // Skip during automated testing
});
app.use('/api', limiter);

// Request Parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Logging Middleware
app.use(requestLogger);

// Root Welcome Endpoint
app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    application: 'CivicConnect',
    tagline: 'Report. Track. Resolve. Build a Better Community.',
    status: 'Operational',
    version: '1.0.0',
    documentation: '/api',
    healthCheck: '/api/health',
  });
});

// Central API Routes (mounted at /api)
app.use('/api', apiRouter);

// 404 Not Found Handler (Must be registered after all valid routes)
app.use(notFoundHandler);

// Centralized Error Handling Handler (Must be registered last)
app.use(errorHandler);

module.exports = app;

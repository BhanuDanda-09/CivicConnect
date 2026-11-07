// ==============================================================================
// HTTP Request Logging Middleware (Morgan)
// ==============================================================================

const morgan = require('morgan');

// Custom token for ISO timestamp
morgan.token('iso-date', () => new Date().toISOString());

// Compact, readable format for dev / production
const format = process.env.NODE_ENV === 'production'
  ? '[:iso-date] :remote-addr :method :url :status :res[content-length] - :response-time ms'
  : '[:iso-date] :method :url :status :response-time ms - :res[content-length]';

const requestLogger = morgan(format, {
  // Skip logging during automated tests to keep test output clean
  skip: () => process.env.NODE_ENV === 'test',
});

module.exports = requestLogger;


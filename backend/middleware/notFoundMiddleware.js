// ==============================================================================
// 404 Not Found Middleware
// ==============================================================================

const notFoundHandler = (req, res, next) => {
  res.status(404).json({
    success: false,
    statusCode: 404,
    message: `Route not found: ${req.method} ${req.originalUrl}`,
    suggestion: 'Please verify the endpoint URL or refer to /api/health for system status.',
    timestamp: new Date().toISOString(),
  });
};

module.exports = notFoundHandler;


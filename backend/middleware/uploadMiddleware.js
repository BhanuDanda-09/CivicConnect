// ==============================================================================
// Multer Upload Middleware (uploadMiddleware.js)
// ==============================================================================

const multer = require('multer');
const ApiError = require('../utils/ApiError');

// Memory storage keeps file buffers in memory for direct Cloudinary streaming
const storage = multer.memoryStorage();

// Allowed image MIME types
const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

const fileFilter = (req, file, cb) => {
  if (ALLOWED_MIME_TYPES.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(
      new ApiError(
        400,
        `Invalid image format '${file.mimetype}'. Only JPEG, PNG, and WebP files are permitted.`
      ),
      false
    );
  }
};

const limits = {
  fileSize: 5 * 1024 * 1024, // 5 MB per file
  files: 5,                  // Maximum 5 images per complaint
};

const upload = multer({
  storage,
  fileFilter,
  limits,
});

/**
 * Higher-order middleware wrapper to capture Multer errors cleanly and pass them to next(ApiError)
 */
const handleUpload = (multerMiddleware) => {
  return (req, res, next) => {
    multerMiddleware(req, res, (err) => {
      if (!err) {
        return next();
      }

      if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
          return next(new ApiError(413, 'Image upload rejected: Maximum allowed file size is 5MB per image.'));
        }
        if (err.code === 'LIMIT_FILE_COUNT' || err.code === 'LIMIT_UNEXPECTED_FILE') {
          return next(new ApiError(400, 'Image upload rejected: You cannot upload more than 5 images per complaint.'));
        }
        return next(new ApiError(400, `Image upload error: ${err.message}`));
      }

      if (err instanceof ApiError) {
        return next(err);
      }

      return next(new ApiError(400, err.message || 'File upload failed'));
    });
  };
};

// Middleware for complaint creation evidence photos
const uploadComplaintPhotos = handleUpload(upload.array('images', 5));

// Middleware for worker resolution photos
const uploadResolutionPhotos = handleUpload(upload.array('resolutionImages', 5));

module.exports = {
  upload,
  uploadComplaintPhotos,
  uploadResolutionPhotos,
};


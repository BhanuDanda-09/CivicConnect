// ==============================================================================
// Cloudinary Service (cloudinaryService.js)
// ==============================================================================

const cloudinary = require('../config/cloudinary');

/**
 * Checks if Cloudinary is configured with valid production/dev credentials
 */
const isCloudinaryConfigured = () => {
  return (
    process.env.CLOUDINARY_CLOUD_NAME &&
    process.env.CLOUDINARY_CLOUD_NAME !== 'your_cloudinary_cloud_name' &&
    process.env.CLOUDINARY_API_KEY &&
    process.env.CLOUDINARY_API_KEY !== 'your_cloudinary_api_key' &&
    process.env.CLOUDINARY_API_SECRET &&
    process.env.CLOUDINARY_API_SECRET !== 'your_cloudinary_api_secret'
  );
};

/**
 * Uploads a single file buffer to Cloudinary using upload_stream
 * @param {Buffer} buffer - File buffer from Multer memory storage
 * @param {string} folder - Target Cloudinary folder ('civicconnect/complaints' or 'civicconnect/resolutions')
 * @returns {Promise<{ url: string, publicId: string }>}
 */
const uploadBufferToCloudinary = async (buffer, folder = 'civicconnect/complaints') => {
  // If in automated test mode or Cloudinary credentials are not configured, use safe fallback
  if (process.env.NODE_ENV === 'test' || !isCloudinaryConfigured()) {
    const mockId = `mock_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
    return {
      url: `https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?auto=format&fit=crop&w=800&q=80`,
      publicId: `${folder}/${mockId}`,
    };
  }

  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: 'image',
        transformation: [{ quality: 'auto:good' }, { fetch_format: 'auto' }],
      },
      (error, result) => {
        if (error) {
          return reject(error);
        }
        resolve({
          url: result.secure_url || result.url,
          publicId: result.public_id,
        });
      }
    );

    uploadStream.end(buffer);
  });
};

/**
 * Uploads an array of Multer files to Cloudinary
 * @param {Array<Express.Multer.File>} files
 * @param {string} folder
 * @returns {Promise<Array<{ url: string, publicId: string }>>}
 */
const uploadMultipleFiles = async (files = [], folder = 'civicconnect/complaints') => {
  if (!files || files.length === 0) return [];

  const uploadPromises = files.map((file) => uploadBufferToCloudinary(file.buffer, folder));
  return await Promise.all(uploadPromises);
};

/**
 * Deletes an image from Cloudinary by public ID
 * @param {string} publicId
 */
const deleteFromCloudinary = async (publicId) => {
  if (!publicId || publicId.includes('mock_') || !isCloudinaryConfigured()) {
    return { result: 'ok' };
  }

  try {
    return await cloudinary.uploader.destroy(publicId);
  } catch (error) {
    console.error(`[Cloudinary] Failed to delete image ${publicId}:`, error.message);
    return null;
  }
};

module.exports = {
  isCloudinaryConfigured,
  uploadBufferToCloudinary,
  uploadMultipleFiles,
  deleteFromCloudinary,
};


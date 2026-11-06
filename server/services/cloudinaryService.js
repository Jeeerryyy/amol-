import { v2 as cloudinary } from 'cloudinary';
import { env } from '../config/env.js';
import { CLOUDINARY_ALLOWED_FOLDERS } from '../config/constants.js';

const isConfigured = Boolean(
  env.cloudinaryCloudName &&
  env.cloudinaryApiKey &&
  env.cloudinaryApiSecret &&
  !env.cloudinaryCloudName.includes('placeholder')
);

if (isConfigured) {
  cloudinary.config({
    cloud_name: env.cloudinaryCloudName,
    api_key: env.cloudinaryApiKey,
    api_secret: env.cloudinaryApiSecret,
    secure: true,
  });
  console.log(`[Cloudinary] Configured for cloud: ${env.cloudinaryCloudName}`);
} else {
  console.log('[Cloudinary] Running in local simulation / unconfigured mode (set CLOUDINARY_* in .env for production)');
}

/**
 * Generate a signed upload signature for direct browser upload
 */
export function generateUploadSignature({ folder, resourceType = 'image' }) {
  if (!CLOUDINARY_ALLOWED_FOLDERS.includes(folder)) {
    throw new Error(`Invalid upload folder. Must be one of: ${CLOUDINARY_ALLOWED_FOLDERS.join(', ')}`);
  }

  const validResourceTypes = ['image', 'video'];
  if (!validResourceTypes.includes(resourceType)) {
    throw new Error('Invalid resource type. Must be image or video.');
  }

  if (!isConfigured) {
    return {
      isMock: true,
      cloudName: 'local-demo',
      apiKey: 'local-key',
      timestamp: Math.floor(Date.now() / 1000),
      signature: 'mock_signature',
      folder,
      resourceType,
      message: 'Cloudinary not configured in .env. Upload simulation will be handled locally.',
    };
  }

  const timestamp = Math.floor(Date.now() / 1000);
  const paramsToSign = {
    folder,
    timestamp,
  };

  const signature = cloudinary.utils.api_sign_request(paramsToSign, env.cloudinaryApiSecret);

  return {
    isMock: false,
    cloudName: env.cloudinaryCloudName,
    apiKey: env.cloudinaryApiKey,
    timestamp,
    signature,
    folder,
    resourceType,
  };
}

/**
 * Delete asset from Cloudinary by public_id
 */
export async function deleteAsset(publicId, resourceType = 'image') {
  if (!publicId || !isConfigured) return { result: 'skipped_or_mock' };

  try {
    const res = await cloudinary.uploader.destroy(publicId, { resource_type: resourceType });
    console.log(`[Cloudinary] Deleted asset: ${publicId} (${resourceType}) ->`, res);
    return res;
  } catch (err) {
    console.error(`[Cloudinary] Failed to delete asset ${publicId}:`, err);
    return { error: err.message };
  }
}

/**
 * Helper to generate responsive optimized URLs
 */
export function getOptimizedUrl(publicId, { width = 800, quality = 'auto', format = 'auto' } = {}) {
  if (!isConfigured || !publicId) return publicId;
  return cloudinary.url(publicId, {
    fetch_format: format,
    quality: quality,
    width: width,
    crop: 'limit',
    secure: true,
  });
}

export const cloudinaryService = {
  isConfigured: () => isConfigured,
  generateUploadSignature,
  deleteAsset,
  getOptimizedUrl,
};

export default cloudinaryService;


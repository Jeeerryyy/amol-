import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv';

dotenv.config();

const {
  CLOUDINARY_CLOUD_NAME,
  CLOUDINARY_API_KEY,
  CLOUDINARY_API_SECRET,
} = process.env;

const isConfigured = Boolean(
  CLOUDINARY_CLOUD_NAME &&
  CLOUDINARY_API_KEY &&
  CLOUDINARY_API_SECRET &&
  !CLOUDINARY_CLOUD_NAME.includes('placeholder')
);

if (isConfigured) {
  cloudinary.config({
    cloud_name: CLOUDINARY_CLOUD_NAME,
    api_key: CLOUDINARY_API_KEY,
    api_secret: CLOUDINARY_API_SECRET,
    secure: true,
  });
  console.log(`[Cloudinary] Configured for cloud: ${CLOUDINARY_CLOUD_NAME}`);
} else {
  console.log('[Cloudinary] Running in local simulation / unconfigured mode (set CLOUDINARY_* in .env for production)');
}

const ALLOWED_FOLDERS = [
  'restaurant/menu',
  'restaurant/dishes',
  'restaurant/gallery',
  'restaurant/popular',
  'restaurant/seo',
];

/**
 * Generate a signed upload signature for direct browser upload
 */
export function generateUploadSignature({ folder, resourceType = 'image' }) {
  if (!ALLOWED_FOLDERS.includes(folder)) {
    throw new Error(`Invalid upload folder. Must be one of: ${ALLOWED_FOLDERS.join(', ')}`);
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

  const signature = cloudinary.utils.api_sign_request(paramsToSign, CLOUDINARY_API_SECRET);

  return {
    isMock: false,
    cloudName: CLOUDINARY_CLOUD_NAME,
    apiKey: CLOUDINARY_API_KEY,
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
 * Format image URL with f_auto, q_auto and width transform
 */
export function getOptimizedImageUrl(url, width = 800) {
  if (!url) return '';
  if (url.includes('res.cloudinary.com')) {
    // Inject f_auto,q_auto,w_{width},c_limit into URL
    return url.replace('/upload/', `/upload/f_auto,q_auto,w_${width},c_limit/`);
  }
  return url;
}

export const cloudinaryService = {
  isConfigured: () => isConfigured,
  generateUploadSignature,
  deleteAsset,
  getOptimizedImageUrl,
  ALLOWED_FOLDERS,
};

export default cloudinaryService;


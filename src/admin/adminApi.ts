/**
 * Admin API Client & Utilities
 * Handles CSRF token injection, session verification, Cloudinary direct client uploads with progress
 */

let cachedCsrfToken = '';

export function setCsrfToken(token: string) {
  cachedCsrfToken = token;
}

export function getCsrfToken(): string {
  return cachedCsrfToken;
}

export interface CloudinaryUploadResult {
  url: string;
  secure_url: string;
  public_id: string;
  width?: number;
  height?: number;
}

export async function adminFetch(endpoint: string, options: RequestInit = {}): Promise<any> {
  const headers = new Headers(options.headers || {});
  headers.set('Accept', 'application/json');

  if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(options.method?.toUpperCase() || 'GET')) {
    if (cachedCsrfToken) {
      headers.set('x-csrf-token', cachedCsrfToken);
    }
    if (!(options.body instanceof FormData) && !headers.has('Content-Type')) {
      headers.set('Content-Type', 'application/json');
    }
  }

  const normalizedEndpoint = endpoint.startsWith('/api/admin')
    ? endpoint
    : endpoint.startsWith('/')
    ? `/api/admin${endpoint}`
    : `/api/admin/${endpoint}`;

  const API_BASE = ((import.meta as any).env?.VITE_API_URL || '').replace(/\/$/, '');
  const targetUrl = API_BASE ? `${API_BASE}${normalizedEndpoint}` : normalizedEndpoint;
  const res = await fetch(targetUrl, {
    ...options,
    headers,
    credentials: 'include', // sends httpOnly session cookie
  });

  if (res.status === 401) {
    if (!endpoint.includes('/login')) {
      window.dispatchEvent(new CustomEvent('admin_unauthorized'));
    }
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData.error || 'Unauthorized. Please log in.');
  }

  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData.error || `Request failed with status ${res.status}`);
  }

  const contentType = res.headers.get('content-type');
  if (contentType && contentType.includes('application/json')) {
    return res.json();
  }
  return res.text();
}

/**
 * Direct Browser Upload to Cloudinary with Signature & Progress
 */
export async function uploadToCloudinary(
  fileOrOptions:
    | File
    | {
        file: File;
        folder?: string;
        resourceType?: 'image' | 'video';
        onProgress?: (percent: number) => void;
      },
  folderArg = 'restaurant/dishes',
  onProgressArg?: (percent: number) => void,
  resourceTypeArg: 'image' | 'video' = 'image'
): Promise<CloudinaryUploadResult> {
  let file: File;
  let folder = folderArg;
  let onProgress = onProgressArg;
  let resourceType: 'image' | 'video' = resourceTypeArg;

  if ('file' in fileOrOptions) {
    file = fileOrOptions.file;
    folder = fileOrOptions.folder || 'restaurant/dishes';
    onProgress = fileOrOptions.onProgress;
    resourceType = fileOrOptions.resourceType || 'image';
  } else {
    file = fileOrOptions;
  }
  // Validate limits
  if (resourceType === 'image' && file.size > 8 * 1024 * 1024) {
    throw new Error('Image size exceeds 8 MB limit.');
  }
  if (resourceType === 'video' && file.size > 100 * 1024 * 1024) {
    throw new Error('Video size exceeds 100 MB limit.');
  }

  // 1. Get signed signature from backend
  const sigData = await adminFetch('/api/admin/cloudinary-sign', {
    method: 'POST',
    body: JSON.stringify({ folder, resourceType }),
  });

  if (sigData.isMock) {
    onProgress?.(50);
    const simulatedUrl = URL.createObjectURL(file);
    onProgress?.(100);
    return {
      url: simulatedUrl,
      secure_url: simulatedUrl,
      public_id: `local_mock_${Date.now()}`,
      width: 1000,
      height: 800,
    };
  }

  // 2. Direct upload to Cloudinary API using signed params
  const formData = new FormData();
  formData.append('file', file);
  formData.append('api_key', sigData.apiKey);
  formData.append('timestamp', String(sigData.timestamp));
  formData.append('signature', sigData.signature);
  formData.append('folder', sigData.folder);

  const uploadEndpoint = `https://api.cloudinary.com/v1_1/${sigData.cloudName}/${resourceType}/upload`;

  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open('POST', uploadEndpoint);

    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable && onProgress) {
        const percent = Math.round((e.loaded / e.total) * 100);
        onProgress(percent);
      }
    };

    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          const res = JSON.parse(xhr.responseText);
          resolve({
            url: res.secure_url || res.url,
            secure_url: res.secure_url || res.url,
            public_id: res.public_id,
            width: res.width,
            height: res.height,
          });
        } catch {
          reject(new Error('Failed to parse Cloudinary response'));
        }
      } else {
        reject(new Error(`Upload failed with status ${xhr.status}: ${xhr.responseText}`));
      }
    };

    xhr.onerror = () => reject(new Error('Network error during upload to Cloudinary'));
    xhr.send(formData);
  });
}

/**
 * Unified adminApi helper object
 */
export const adminApi = {
  get: <T = any>(endpoint: string, options: RequestInit = {}): Promise<T> =>
    adminFetch(endpoint, { ...options, method: 'GET' }),

  post: <T = any>(endpoint: string, data?: any, options: RequestInit = {}): Promise<T> =>
    adminFetch(endpoint, {
      ...options,
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    }),

  put: <T = any>(endpoint: string, data?: any, options: RequestInit = {}): Promise<T> =>
    adminFetch(endpoint, {
      ...options,
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    }),

  delete: <T = any>(endpoint: string, options: RequestInit = {}): Promise<T> =>
    adminFetch(endpoint, { ...options, method: 'DELETE' }),

  uploadToCloudinary,

  setToken: setCsrfToken,
  getToken: getCsrfToken,
  clearToken: () => setCsrfToken(''),
};

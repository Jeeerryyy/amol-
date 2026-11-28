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

export function extractErrorMessage(
  payload: unknown,
  rawText = '',
  status = 0,
  fallback = 'Request failed'
): string {
  if (typeof payload === 'string' && payload.trim()) {
    return payload.trim();
  }
  if (payload && typeof payload === 'object') {
    const obj = payload as Record<string, unknown>;
    if (typeof obj.error === 'string' && obj.error.trim()) {
      return obj.error.trim();
    }
    if (obj.error && typeof obj.error === 'object') {
      const nested = obj.error as Record<string, unknown>;
      const nestedMsg =
        (typeof nested.message === 'string' && nested.message.trim()) ||
        (typeof nested.error === 'string' && nested.error.trim()) ||
        '';
      const nestedCode = typeof nested.code === 'string' && nested.code.trim() ? nested.code.trim() : '';
      if (nestedMsg && nestedCode) return `${nestedMsg} (${nestedCode})`;
      if (nestedMsg) return nestedMsg;
      if (nestedCode) return nestedCode;
    }
    if (typeof obj.message === 'string' && obj.message.trim()) {
      return obj.message.trim();
    }
    if (Array.isArray(obj.errors) && obj.errors.length > 0) {
      const first = obj.errors[0] as Record<string, unknown> | string;
      if (typeof first === 'string' && first.trim()) return first.trim();
      if (first && typeof first === 'object' && typeof first.message === 'string' && first.message.trim()) {
        return first.message.trim();
      }
    }
  }
  const cleanText = rawText.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
  if (cleanText && cleanText.length <= 240) {
    return cleanText;
  }
  return status ? `${fallback} (HTTP ${status})` : fallback;
}

async function parseErrorResponse(res: Response, fallback: string): Promise<string> {
  const rawText = await res.text().catch(() => '');
  if (!rawText) {
    return res.status ? `${fallback} (HTTP ${res.status})` : fallback;
  }
  try {
    const parsed = JSON.parse(rawText);
    return extractErrorMessage(parsed, rawText, res.status, fallback);
  } catch {
    return extractErrorMessage(null, rawText, res.status, fallback);
  }
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

  let res: Response;
  try {
    res = await fetch(targetUrl, {
      ...options,
      headers,
      credentials: 'include', // sends httpOnly session cookie
    });
  } catch (networkErr: unknown) {
    const msg = networkErr instanceof Error ? networkErr.message : '';
    throw new Error(
      msg && !/failed to fetch/i.test(msg)
        ? msg
        : 'Unable to reach the server. Please check your connection and try again.'
    );
  }

  if (res.status === 401) {
    if (!endpoint.includes('/login')) {
      window.dispatchEvent(new CustomEvent('admin_unauthorized'));
    }
    const errMsg = await parseErrorResponse(res, 'Unauthorized. Please log in.');
    throw new Error(errMsg);
  }

  if (!res.ok) {
    const errMsg = await parseErrorResponse(res, `Request failed with status ${res.status}`);
    throw new Error(errMsg);
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
        let parsedErr: unknown = null;
        try {
          parsedErr = JSON.parse(xhr.responseText);
        } catch {
          parsedErr = null;
        }
        reject(new Error(extractErrorMessage(parsedErr, xhr.responseText, xhr.status, 'Upload failed')));
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

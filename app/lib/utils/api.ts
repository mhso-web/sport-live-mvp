/**
 * Get the correct API base URL for the current environment
 * This is needed because the custom domain (foul-tv.com) doesn't properly proxy API routes
 */
export function getApiBaseUrl(): string {
  // For client-side requests
  if (typeof window !== 'undefined') {
    // Use the NEXT_PUBLIC_BASE_URL if available
    if (process.env.NEXT_PUBLIC_BASE_URL) {
      return process.env.NEXT_PUBLIC_BASE_URL;
    }
    // Fallback to current origin
    return window.location.origin;
  }
  
  // For server-side requests
  if (process.env.NEXTAUTH_URL) {
    return process.env.NEXTAUTH_URL;
  }
  
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }
  
  // Local development fallback
  return 'http://localhost:3000';
}

/**
 * Make an API request with the correct base URL
 */
export async function apiRequest(
  endpoint: string,
  options?: RequestInit
): Promise<Response> {
  const baseUrl = getApiBaseUrl();
  const url = endpoint.startsWith('/') ? `${baseUrl}${endpoint}` : `${baseUrl}/${endpoint}`;
  return fetch(url, options);
}
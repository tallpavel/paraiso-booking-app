/**
 * Utility to get optimized image URLs from CloudFront.
 * 
 * @param path The relative path to the image (e.g., '/gallery/Interior1-livingroom.jpg')
 * @param width Optional target width for the image
 * @param quality Optional quality (1-100), defaults to 80
 * @returns The absolute URL to the optimized image via CloudFront, or local path if CDN is not configured
 */
export function getOptimizedImageUrl(path: string, width?: number, quality = 80): string {
    const cdnUrl = import.meta.env.VITE_CDN_URL;
    
    // Fallback to local public folder if CDN is not configured
    if (!cdnUrl) {
        return path;
    }
    
    const baseUrl = cdnUrl.endsWith('/') ? cdnUrl.slice(0, -1) : cdnUrl;
    // Ensure path starts with a slash for consistent URL construction
    const cleanPath = path.startsWith('/') ? path : `/${path}`;
    
    const url = new URL(`${baseUrl}${cleanPath}`);
    
    if (width) {
        url.searchParams.append('w', width.toString());
    }
    
    if (quality !== 80) {
        url.searchParams.append('q', quality.toString());
    }
    
    return url.toString();
}

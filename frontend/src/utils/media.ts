/**
 * Optimizes a Cloudinary URL for fast loading by injecting performance flags.
 * 
 * @param url The original media URL
 * @param options Optimization options (width, quality, etc.)
 * @returns The optimized URL
 */
export const optimizeCloudinaryUrl = (
    url: string | undefined,
    options: {
        width?: number;
        height?: number;
        crop?: string;
        quality?: string;
        format?: string;
    } = {}
): string => {
    if (!url) return '';

    // Only optimize Cloudinary URLs
    if (!url.includes('cloudinary.com')) return url;

    const {
        width = 1920,
        quality = 'auto',
        format = 'auto',
        crop = 'limit'
    } = options;

    // Split URL into parts: baseUrl/upload/transf/version/path
    const parts = url.split('/upload/');
    if (parts.length !== 2) return url;

    const baseUrl = parts[0];
    const path = parts[1];

    // Prepare transformation string
    // f_auto: automatically select best format (WebP/AVIF etc)
    // q_auto: automatically optimize quality
    // w_1920: set maximum width
    // c_limit: don't upscale, only downscale
    const transformation = `f_${format},q_${quality},w_${width},c_${crop}`;

    // Check if there are already transformations
    if (path.includes('/') && !path.startsWith('v')) {
        // There are existing transformations, prepend ours if they don't conflict
        // For simplicity, we just insert ours right after /upload/
        return `${baseUrl}/upload/${transformation}/${path}`;
    }

    // Insert transformations after /upload/
    return `${baseUrl}/upload/${transformation}/${path}`;
};

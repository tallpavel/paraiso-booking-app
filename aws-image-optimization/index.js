import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3';
import sharp from 'sharp';

// Initialize the S3 Client
// If deploying in eu-north-1, ensure the region is set properly
const s3 = new S3Client({ region: process.env.AWS_REGION || 'eu-north-1' });

// We require the S3_BUCKET_NAME to be provided as an environment variable in the Lambda configuration
const BUCKET_NAME = process.env.S3_BUCKET_NAME;

export const handler = async (event) => {
    // Determine the image path from rawPath (Function URL format)
    let imagePath = event.rawPath || event.requestContext?.http?.path;
    
    if (imagePath && imagePath.startsWith('/')) {
        imagePath = imagePath.substring(1); // Remove leading slash for S3 key
    }
    
    if (!imagePath) {
        return {
            statusCode: 400,
            body: 'Missing image path'
        };
    }

    if (!BUCKET_NAME) {
        return {
            statusCode: 500,
            body: 'S3_BUCKET_NAME environment variable is not set'
        };
    }
    
    // Check Accept header to auto-negotiate format
    // CloudFront must be configured to forward the 'Accept' header to the origin
    const headers = event.headers || {};
    const acceptHeader = (headers['accept'] || '').toLowerCase();
    
    let targetFormat = 'jpeg'; // Default fallback
    if (acceptHeader.includes('image/avif')) {
        targetFormat = 'avif';
    } else if (acceptHeader.includes('image/webp')) {
        targetFormat = 'webp';
    } else if (imagePath.endsWith('.png')) {
        targetFormat = 'png';
    }
    
    // Parse optimization query string parameters (e.g. ?w=800&q=80)
    // CloudFront must be configured to forward these query strings to the origin
    const queryParams = event.queryStringParameters || {};
    const width = queryParams.w ? parseInt(queryParams.w, 10) : null;
    const height = queryParams.h ? parseInt(queryParams.h, 10) : null;
    const quality = queryParams.q ? parseInt(queryParams.q, 10) : 80;

    try {
        // Fetch the original image from the S3 bucket
        const { Body } = await s3.send(new GetObjectCommand({
            Bucket: BUCKET_NAME,
            Key: imagePath
        }));
        
        // Convert the stream to a byte array (AWS SDK v3 format)
        const originalImageBuffer = await Body.transformToByteArray();
        
        // Initialize sharp pipeline
        let sharpPipeline = sharp(originalImageBuffer);
        
        // Apply resizing if requested
        if (width || height) {
            sharpPipeline = sharpPipeline.resize({
                width: width || null,
                height: height || null,
                withoutEnlargement: true,
                fit: 'inside' // Maintain aspect ratio without cropping
            });
        }
        
        // Output format configuration
        sharpPipeline = sharpPipeline.toFormat(targetFormat, { quality });
        
        const optimizedImageBuffer = await sharpPipeline.toBuffer();
        
        // Map target formats to proper Content-Type headers
        let outContentType = `image/${targetFormat}`;
        if (targetFormat === 'jpg') outContentType = 'image/jpeg';
        
        // Return base64 encoded response for API Gateway/Function URL
        return {
            statusCode: 200,
            headers: {
                'Content-Type': outContentType,
                'Cache-Control': 'public, max-age=31536000, immutable',
                // Add a Vary header so CloudFront caches based on the Accept header
                'Vary': 'Accept'
            },
            body: optimizedImageBuffer.toString('base64'),
            isBase64Encoded: true
        };
        
    } catch (error) {
        console.error('Error optimizing image:', error);
        
        // If image doesn't exist in S3
        if (error.name === 'NoSuchKey' || error.$metadata?.httpStatusCode === 404) {
            return { statusCode: 404, body: 'Image not found' };
        }
        
        return {
            statusCode: error.$metadata?.httpStatusCode || 500,
            body: error.message || 'Internal Server Error'
        };
    }
};

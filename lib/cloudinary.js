import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || 'demo_cloud',
  api_key: process.env.CLOUDINARY_API_KEY || '1234567890',
  api_secret: process.env.CLOUDINARY_API_SECRET || 'abcdefghijklmnopqrstuvwxyz',
  secure: true,
});

export async function uploadImageToCloudinary(base64OrUrl, folder = 'shopify_booking') {
  try {
    const result = await cloudinary.uploader.upload(base64OrUrl, {
      folder,
      resource_type: 'image',
    });
    return result.secure_url;
  } catch (error) {
    console.error('Cloudinary upload error:', error);
    return 'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=500';
  }
}

export default cloudinary;

import * as FileSystem from 'expo-file-system';

// Replace 'your-cloud-name' with your actual cloud name from Cloudinary dashboard
const CLOUDINARY_URL = 'https://api.cloudinary.com/v1_1/dsabwyubl/upload';
// Replace 'your-preset-name' with the upload preset name you created
const UPLOAD_PRESET = 'menuuuu';

export const uploadImageToCloudinary = async (imageUri) => {
  try {
    console.log('Starting image upload to Cloudinary...');
    
    // Validate input
    if (!imageUri) {
      throw new Error('No image URI provided');
    }

    // Convert image to base64
    const base64 = await FileSystem.readAsStringAsync(imageUri, {
      encoding: FileSystem.EncodingType.Base64,
    });

    // Create form data
    const formData = new FormData();
    formData.append('file', `data:image/jpeg;base64,${base64}`);
    formData.append('upload_preset', UPLOAD_PRESET);

    console.log('Uploading to Cloudinary...');
    
    // Upload to Cloudinary
    const response = await fetch(CLOUDINARY_URL, {
      method: 'POST',
      body: formData,
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();

    if (data.secure_url) {
      return {
        success: true,
        imageUrl: data.secure_url,
      };
    } else {
      throw new Error('Failed to upload image');
    }
  } catch (error) {
    console.error('Error uploading image:', error);
    return {
      success: false,
      error: error.message || 'Failed to upload image',
    };
  }
};
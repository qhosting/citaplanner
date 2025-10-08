
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';

export interface UploadPhotoResult {
  success: boolean;
  url?: string;
  error?: string;
}

/**
 * Upload profile photo to local storage
 * In production, this should be replaced with S3 or similar cloud storage
 */
export async function uploadProfilePhoto(
  file: File,
  userId: string
): Promise<UploadPhotoResult> {
  try {
    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      return {
        success: false,
        error: 'Invalid file type. Only JPEG, PNG, and WebP are allowed.',
      };
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      return {
        success: false,
        error: 'File size exceeds 5MB limit.',
      };
    }

    // Create uploads directory if it doesn't exist
    const uploadsDir = join(process.cwd(), 'public', 'uploads', 'profiles');
    if (!existsSync(uploadsDir)) {
      await mkdir(uploadsDir, { recursive: true });
    }

    // Generate unique filename
    const timestamp = Date.now();
    const extension = file.name.split('.').pop();
    const filename = `${userId}-${timestamp}.${extension}`;
    const filepath = join(uploadsDir, filename);

    // Convert file to buffer and save
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    await writeFile(filepath, buffer);

    // Return public URL
    const url = `/uploads/profiles/${filename}`;

    return {
      success: true,
      url,
    };
  } catch (error) {
    console.error('Error uploading profile photo:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to upload photo',
    };
  }
}

/**
 * Delete profile photo from local storage
 */
export async function deleteProfilePhoto(photoUrl: string): Promise<boolean> {
  try {
    const { unlink } = await import('fs/promises');
    const filepath = join(process.cwd(), 'public', photoUrl);
    
    if (existsSync(filepath)) {
      await unlink(filepath);
      return true;
    }
    
    return false;
  } catch (error) {
    console.error('Error deleting profile photo:', error);
    return false;
  }
}

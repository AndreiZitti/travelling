import imageCompression from "browser-image-compression";
import { createClient } from "./client";

const BUCKET_NAME = "visit-photos";
const MAX_PHOTOS_PER_VISIT = 3;
const MAX_FILE_SIZE_MB = 5;

// Compression options
const compressionOptions = {
  maxSizeMB: 1,
  maxWidthOrHeight: 1920,
  useWebWorker: true,
  fileType: "image/jpeg" as const,
  initialQuality: 0.8,
};

/**
 * Compress an image file before upload
 */
export async function compressImage(file: File): Promise<File> {
  // Skip compression if already small enough
  if (file.size < 500 * 1024) {
    return file;
  }

  try {
    const compressedFile = await imageCompression(file, compressionOptions);
    return compressedFile;
  } catch (error) {
    console.error("Image compression failed:", error);
    // Return original if compression fails
    return file;
  }
}

/**
 * Generate a unique file path for a photo
 */
function generateFilePath(userId: string, locationId: string): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 8);
  return `${userId}/${locationId}/${timestamp}-${random}.jpg`;
}

/**
 * Upload a photo to Supabase Storage
 */
export async function uploadPhoto(
  file: File,
  userId: string,
  locationId: string,
  onProgress?: (progress: number) => void
): Promise<{ url: string; path: string } | { error: string }> {
  const supabase = createClient();

  // Validate file type
  if (!file.type.startsWith("image/")) {
    return { error: "File must be an image" };
  }

  // Validate file size (before compression)
  if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
    return { error: `File size must be less than ${MAX_FILE_SIZE_MB}MB` };
  }

  try {
    // Compress the image
    onProgress?.(10);
    const compressedFile = await compressImage(file);
    onProgress?.(30);

    // Generate unique path
    const filePath = generateFilePath(userId, locationId);

    // Upload to Supabase Storage
    const { error: uploadError } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(filePath, compressedFile, {
        contentType: "image/jpeg",
        upsert: false,
      });

    if (uploadError) {
      console.error("Upload error:", uploadError);
      return { error: uploadError.message };
    }

    onProgress?.(90);

    // Get the signed URL (valid for 1 year)
    const { data: urlData, error: urlError } = await supabase.storage
      .from(BUCKET_NAME)
      .createSignedUrl(filePath, 60 * 60 * 24 * 365);

    if (urlError || !urlData) {
      console.error("URL generation error:", urlError);
      return { error: "Failed to generate URL" };
    }

    onProgress?.(100);

    return { url: urlData.signedUrl, path: filePath };
  } catch (error) {
    console.error("Upload failed:", error);
    return { error: "Upload failed" };
  }
}

/**
 * Delete a photo from Supabase Storage
 */
export async function deletePhoto(photoUrl: string): Promise<{ success: boolean; error?: string }> {
  const supabase = createClient();

  try {
    // Extract the path from the signed URL
    // URL format: https://xxx.supabase.co/storage/v1/object/sign/visit-photos/userId/locationId/filename.jpg?token=xxx
    const url = new URL(photoUrl);
    const pathMatch = url.pathname.match(/\/storage\/v1\/object\/sign\/visit-photos\/(.+)/);

    if (!pathMatch) {
      // Try alternate URL format (public URL)
      const altMatch = url.pathname.match(/\/storage\/v1\/object\/public\/visit-photos\/(.+)/);
      if (!altMatch) {
        return { success: false, error: "Invalid photo URL format" };
      }
      const filePath = decodeURIComponent(altMatch[1]);
      const { error } = await supabase.storage.from(BUCKET_NAME).remove([filePath]);
      if (error) {
        return { success: false, error: error.message };
      }
      return { success: true };
    }

    const filePath = decodeURIComponent(pathMatch[1]);

    const { error } = await supabase.storage.from(BUCKET_NAME).remove([filePath]);

    if (error) {
      console.error("Delete error:", error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    console.error("Delete failed:", error);
    return { success: false, error: "Delete failed" };
  }
}

/**
 * Delete all photos for a specific location
 */
export async function deleteAllPhotosForLocation(
  userId: string,
  locationId: string
): Promise<{ success: boolean; error?: string }> {
  const supabase = createClient();

  try {
    const folderPath = `${userId}/${locationId}`;

    // List all files in the location folder
    const { data: files, error: listError } = await supabase.storage
      .from(BUCKET_NAME)
      .list(folderPath);

    if (listError) {
      console.error("List error:", listError);
      return { success: false, error: listError.message };
    }

    if (!files || files.length === 0) {
      return { success: true };
    }

    // Delete all files
    const filePaths = files.map((file) => `${folderPath}/${file.name}`);
    const { error: deleteError } = await supabase.storage
      .from(BUCKET_NAME)
      .remove(filePaths);

    if (deleteError) {
      console.error("Delete error:", deleteError);
      return { success: false, error: deleteError.message };
    }

    return { success: true };
  } catch (error) {
    console.error("Delete all failed:", error);
    return { success: false, error: "Delete all failed" };
  }
}

/**
 * Validate if more photos can be added
 */
export function canAddMorePhotos(currentPhotoCount: number): boolean {
  return currentPhotoCount < MAX_PHOTOS_PER_VISIT;
}

/**
 * Get remaining photo slots
 */
export function getRemainingPhotoSlots(currentPhotoCount: number): number {
  return Math.max(0, MAX_PHOTOS_PER_VISIT - currentPhotoCount);
}

export { MAX_PHOTOS_PER_VISIT, MAX_FILE_SIZE_MB };

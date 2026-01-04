"use client";

import { useState, useRef, useCallback } from "react";
import {
  uploadPhoto,
  deletePhoto,
  canAddMorePhotos,
  getRemainingPhotoSlots,
  MAX_PHOTOS_PER_VISIT,
} from "@/lib/supabase/storage";

interface PhotoUploaderProps {
  photos: string[];
  userId: string;
  locationId: string;
  onPhotosChange: (photos: string[]) => void;
  disabled?: boolean;
}

interface UploadingPhoto {
  id: string;
  file: File;
  preview: string;
  progress: number;
  error?: string;
}

export default function PhotoUploader({
  photos,
  userId,
  locationId,
  onPhotosChange,
  disabled = false,
}: PhotoUploaderProps) {
  const [uploading, setUploading] = useState<UploadingPhoto[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const remainingSlots = getRemainingPhotoSlots(photos.length + uploading.length);
  const canUpload = canAddMorePhotos(photos.length + uploading.length) && !disabled;

  const handleFiles = useCallback(
    async (files: FileList | File[]) => {
      const fileArray = Array.from(files);
      const availableSlots = getRemainingPhotoSlots(photos.length + uploading.length);

      if (fileArray.length > availableSlots) {
        alert(`You can only add ${availableSlots} more photo${availableSlots !== 1 ? "s" : ""}`);
        return;
      }

      // Filter valid image files
      const validFiles = fileArray.filter((file) => file.type.startsWith("image/"));
      if (validFiles.length === 0) return;

      // Create upload entries with previews
      const newUploads: UploadingPhoto[] = validFiles.map((file) => ({
        id: `${Date.now()}-${Math.random().toString(36).substring(2, 8)}`,
        file,
        preview: URL.createObjectURL(file),
        progress: 0,
      }));

      setUploading((prev) => [...prev, ...newUploads]);

      // Upload each file
      for (const upload of newUploads) {
        try {
          const result = await uploadPhoto(
            upload.file,
            userId,
            locationId,
            (progress) => {
              setUploading((prev) =>
                prev.map((u) => (u.id === upload.id ? { ...u, progress } : u))
              );
            }
          );

          if ("error" in result) {
            setUploading((prev) =>
              prev.map((u) => (u.id === upload.id ? { ...u, error: result.error } : u))
            );
          } else {
            // Success - add to photos and remove from uploading
            onPhotosChange([...photos, result.url]);
            setUploading((prev) => prev.filter((u) => u.id !== upload.id));
            URL.revokeObjectURL(upload.preview);
          }
        } catch (error) {
          setUploading((prev) =>
            prev.map((u) =>
              u.id === upload.id ? { ...u, error: "Upload failed" } : u
            )
          );
        }
      }
    },
    [photos, uploading.length, userId, locationId, onPhotosChange]
  );

  const handleRemovePhoto = async (photoUrl: string) => {
    const result = await deletePhoto(photoUrl);
    if (result.success) {
      onPhotosChange(photos.filter((p) => p !== photoUrl));
    } else {
      alert("Failed to delete photo");
    }
  };

  const handleRemoveUploading = (uploadId: string) => {
    setUploading((prev) => {
      const upload = prev.find((u) => u.id === uploadId);
      if (upload) {
        URL.revokeObjectURL(upload.preview);
      }
      return prev.filter((u) => u.id !== uploadId);
    });
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    if (canUpload) {
      setIsDragging(true);
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (canUpload && e.dataTransfer.files.length > 0) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const handleClick = () => {
    if (canUpload) {
      fileInputRef.current?.click();
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFiles(e.target.files);
      e.target.value = "";
    }
  };

  return (
    <div className="space-y-3">
      {/* Photo Grid */}
      {(photos.length > 0 || uploading.length > 0) && (
        <div className="grid grid-cols-3 gap-2">
          {/* Existing photos */}
          {photos.map((url, index) => (
            <div key={url} className="relative aspect-square group">
              <img
                src={url}
                alt={`Photo ${index + 1}`}
                className="w-full h-full object-cover rounded-lg"
              />
              <button
                onClick={() => handleRemovePhoto(url)}
                disabled={disabled}
                className="absolute top-1 right-1 w-6 h-6 bg-black/60 hover:bg-black/80 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity disabled:opacity-50"
              >
                <svg
                  className="w-4 h-4 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
          ))}

          {/* Uploading photos */}
          {uploading.map((upload) => (
            <div key={upload.id} className="relative aspect-square">
              <img
                src={upload.preview}
                alt="Uploading"
                className="w-full h-full object-cover rounded-lg opacity-60"
              />
              {upload.error ? (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/50 rounded-lg">
                  <svg
                    className="w-6 h-6 text-red-400 mb-1"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <span className="text-xs text-white text-center px-2">
                    {upload.error}
                  </span>
                  <button
                    onClick={() => handleRemoveUploading(upload.id)}
                    className="mt-1 text-xs text-white underline"
                  >
                    Remove
                  </button>
                </div>
              ) : (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-12 h-12 relative">
                    <svg className="w-12 h-12 transform -rotate-90">
                      <circle
                        cx="24"
                        cy="24"
                        r="20"
                        stroke="rgba(255,255,255,0.3)"
                        strokeWidth="4"
                        fill="none"
                      />
                      <circle
                        cx="24"
                        cy="24"
                        r="20"
                        stroke="white"
                        strokeWidth="4"
                        fill="none"
                        strokeDasharray={`${upload.progress * 1.25} 125`}
                        strokeLinecap="round"
                      />
                    </svg>
                    <span className="absolute inset-0 flex items-center justify-center text-white text-xs font-medium">
                      {upload.progress}%
                    </span>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Drop Zone / Upload Button */}
      {remainingSlots > 0 && (
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={handleClick}
          className={`border-2 border-dashed rounded-lg p-4 text-center cursor-pointer transition-colors ${
            isDragging
              ? "border-indigo-500 bg-indigo-50"
              : disabled
              ? "border-slate-200 bg-slate-50 cursor-not-allowed"
              : "border-slate-200 hover:border-slate-300 hover:bg-slate-50"
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            onChange={handleFileChange}
            className="hidden"
            disabled={disabled}
          />
          <svg
            className={`w-8 h-8 mx-auto mb-2 ${
              isDragging ? "text-indigo-500" : "text-slate-300"
            }`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
          <p className="text-sm text-slate-500">
            {isDragging ? (
              "Drop to upload"
            ) : (
              <>
                Drag photos here or <span className="text-indigo-500">browse</span>
              </>
            )}
          </p>
          <p className="text-xs text-slate-400 mt-1">
            {remainingSlots} of {MAX_PHOTOS_PER_VISIT} slots available
          </p>
        </div>
      )}

      {/* Max photos reached message */}
      {remainingSlots === 0 && uploading.length === 0 && (
        <p className="text-xs text-slate-400 text-center">
          Maximum {MAX_PHOTOS_PER_VISIT} photos reached
        </p>
      )}
    </div>
  );
}

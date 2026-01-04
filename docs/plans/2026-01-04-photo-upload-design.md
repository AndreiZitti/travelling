# Photo Upload Feature Design

## Overview

Add photo upload functionality to visit details, allowing users to attach up to 3 photos per visited location using Supabase Storage.

## Requirements

- Maximum 3 photos per visit
- 5MB file size limit per photo
- Client-side compression before upload (1920px max, 80% quality)
- Supabase Storage for file hosting
- Private bucket with user-scoped access

## Storage Setup

### Bucket Configuration

- **Bucket name:** `visit-photos`
- **Public:** No (private, signed URLs for access)
- **File size limit:** 5MB (5,242,880 bytes)
- **Allowed MIME types:** `image/jpeg`, `image/png`, `image/webp`

### Path Structure

```
{user_id}/{location_id}/{timestamp}-{random}.jpg
```

Using `location_id` instead of `visit_id` since visits don't have stable UUIDs until synced to Supabase.

### SQL Migration

Run in Supabase SQL Editor:

```sql
-- Create the storage bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'visit-photos',
  'visit-photos',
  false,
  5242880,  -- 5MB
  ARRAY['image/jpeg', 'image/png', 'image/webp']
);

-- RLS: Users can upload to their own folder
CREATE POLICY "Users can upload own photos"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'visit-photos' AND auth.uid()::text = (storage.foldername(name))[1]);

-- RLS: Users can view their own photos
CREATE POLICY "Users can view own photos"
ON storage.objects FOR SELECT
USING (bucket_id = 'visit-photos' AND auth.uid()::text = (storage.foldername(name))[1]);

-- RLS: Users can delete their own photos
CREATE POLICY "Users can delete own photos"
ON storage.objects FOR DELETE
USING (bucket_id = 'visit-photos' AND auth.uid()::text = (storage.foldername(name))[1]);
```

## Client-Side Implementation

### Image Compression

Using `browser-image-compression` library:
- Max dimension: 1920px (longest side)
- Quality: 0.8 (80%)
- Output format: JPEG
- Typical output size: 500KB-1MB

### Upload Flow

1. User selects/drops image(s)
2. Validate: file type, count (max 3 total)
3. Compress each image client-side
4. Upload to Supabase Storage
5. Get signed URL, add to visit's `photos` array
6. Save visit (triggers sync to database)

### Photo Deletion

When removing a photo:
1. Delete from Supabase Storage immediately
2. Remove URL from local state
3. On save, updated `photos` array syncs to database

When deleting entire visit:
1. Delete all photos from storage for that location
2. Then delete the visit record

## File Changes

### New Files

- `lib/supabase/storage.ts` - Upload/delete functions, URL generation
- `components/PhotoUploader.tsx` - Drop zone, progress, thumbnails

### Modified Files

- `components/VisitDetailModal.tsx` - Replace placeholder with `<PhotoUploader>`
- `hooks/useVisits.ts` - Handle photo deletion cleanup when visit is deleted

### Dependencies

- `browser-image-compression` (~50KB gzipped)

## UI Design

In VisitDetailModal, replace the placeholder with:
- Drop zone with click-to-select fallback
- Upload progress indicator per image
- Thumbnail grid of uploaded photos
- Remove button on each thumbnail
- Disabled state when 3 photos reached

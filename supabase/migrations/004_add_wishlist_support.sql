-- Migration: Add wishlist support to visits table
-- Adds a 'type' column to distinguish between visited and wishlist entries

-- Add type column with default 'visited' for existing records
ALTER TABLE travelling.visits
ADD COLUMN IF NOT EXISTS type TEXT DEFAULT 'visited' CHECK (type IN ('visited', 'wishlist'));

-- Update the unique constraint to include type
-- First, drop the old constraint
ALTER TABLE travelling.visits DROP CONSTRAINT IF EXISTS visits_user_id_location_id_key;

-- Create new unique constraint that includes type
-- This allows a location to be both visited AND on wishlist for the same user
ALTER TABLE travelling.visits
ADD CONSTRAINT visits_user_id_location_id_type_key UNIQUE (user_id, location_id, type);

-- Create index for type queries
CREATE INDEX IF NOT EXISTS idx_visits_type ON travelling.visits(type);

-- Create composite index for common queries
CREATE INDEX IF NOT EXISTS idx_visits_user_type ON travelling.visits(user_id, type);

-- Comment: After applying this migration:
-- - Existing records will have type='visited'
-- - New wishlist entries should be inserted with type='wishlist'
-- - Users can have the same location in both visited and wishlist

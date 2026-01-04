-- Migration: Create visits table for rich visit tracking
-- This replaces the simple visited_countries table with a full-featured visits table
-- NOTE: All tables are in the 'travelling' schema

-- Ensure the travelling schema exists
CREATE SCHEMA IF NOT EXISTS travelling;

-- Create the visits table in the travelling schema
CREATE TABLE IF NOT EXISTS travelling.visits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  location_id TEXT NOT NULL, -- References location ID (country/territory/state)
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  notes TEXT,
  visit_dates JSONB DEFAULT '[]'::jsonb, -- Array of {startDate, endDate?}
  places_visited JSONB DEFAULT '[]'::jsonb, -- Array of {name, type}
  photos TEXT[] DEFAULT ARRAY[]::TEXT[], -- Array of photo URLs
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- Ensure one visit record per user per location
  UNIQUE(user_id, location_id)
);

-- Create indexes for common queries
CREATE INDEX IF NOT EXISTS idx_visits_user_id ON travelling.visits(user_id);
CREATE INDEX IF NOT EXISTS idx_visits_location_id ON travelling.visits(location_id);
CREATE INDEX IF NOT EXISTS idx_visits_rating ON travelling.visits(rating) WHERE rating IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_visits_created_at ON travelling.visits(created_at);

-- Enable Row Level Security
ALTER TABLE travelling.visits ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Users can only access their own visits
CREATE POLICY "Users can view their own visits"
  ON travelling.visits FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own visits"
  ON travelling.visits FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own visits"
  ON travelling.visits FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own visits"
  ON travelling.visits FOR DELETE
  USING (auth.uid() = user_id);

-- Trigger to auto-update updated_at
CREATE OR REPLACE FUNCTION travelling.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_visits_updated_at
  BEFORE UPDATE ON travelling.visits
  FOR EACH ROW
  EXECUTE FUNCTION travelling.update_updated_at_column();

-- Migration function to move data from old visited_countries table
-- Run this after the table is created to migrate existing data
CREATE OR REPLACE FUNCTION travelling.migrate_visited_countries()
RETURNS void AS $$
DECLARE
  row_record RECORD;
  country_code TEXT;
BEGIN
  -- Check if old table exists in the travelling schema
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'travelling' AND table_name = 'visited_countries') THEN
    -- Loop through each user's visited countries
    FOR row_record IN SELECT * FROM travelling.visited_countries LOOP
      -- Extract country codes from the JSONB countries column
      FOR country_code IN SELECT jsonb_object_keys(row_record.countries) LOOP
        -- Insert into visits table (ignore if already exists)
        INSERT INTO travelling.visits (user_id, location_id, created_at)
        VALUES (row_record.user_id, country_code, COALESCE(row_record.updated_at, NOW()))
        ON CONFLICT (user_id, location_id) DO NOTHING;
      END LOOP;
    END LOOP;

    RAISE NOTICE 'Migration completed successfully';
  ELSE
    RAISE NOTICE 'No travelling.visited_countries table found, skipping migration';
  END IF;
END;
$$ LANGUAGE plpgsql;

-- Execute migration (uncomment when ready)
-- SELECT travelling.migrate_visited_countries();

-- Comment: To run the migration after applying this script:
-- 1. Apply this migration in Supabase SQL Editor
-- 2. Run migration: SELECT travelling.migrate_visited_countries();
-- 3. Verify data: SELECT COUNT(*) FROM travelling.visits;
-- 4. Optional: DROP TABLE travelling.visited_countries; (after confirming migration)

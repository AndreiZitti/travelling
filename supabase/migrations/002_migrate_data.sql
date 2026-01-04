-- Direct migration script - run this in Supabase SQL Editor
-- This will show you the results directly

-- First, let's see what's in the old table
SELECT 'Old visited_countries table:' as info;
SELECT user_id, countries, updated_at
FROM travelling.visited_countries
LIMIT 5;

-- Count how many users have data
SELECT 'Total users with visited countries:' as info, COUNT(*) as count
FROM travelling.visited_countries;

-- Now let's do the migration
-- This INSERT...SELECT will migrate all data at once
INSERT INTO travelling.visits (user_id, location_id, created_at, updated_at)
SELECT
  vc.user_id,
  country_code,
  COALESCE(vc.updated_at, NOW()),
  COALESCE(vc.updated_at, NOW())
FROM travelling.visited_countries vc,
LATERAL jsonb_object_keys(vc.countries) AS country_code
ON CONFLICT (user_id, location_id) DO NOTHING;

-- Verify the migration
SELECT 'Migrated visits:' as info;
SELECT user_id, location_id, created_at
FROM travelling.visits
ORDER BY created_at DESC
LIMIT 10;

-- Count migrated records
SELECT 'Total visits after migration:' as info, COUNT(*) as count
FROM travelling.visits;

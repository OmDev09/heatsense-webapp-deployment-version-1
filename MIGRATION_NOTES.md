# Database Migration Notes

## Current vs New Schema

**Current Table:** `users_profile` (used in `databaseService.js`)
**New Table:** `profiles` (as per new schema requirements)

## Migration Options

### Option 1: Rename existing table (if you have existing data)
```sql
-- Rename the existing table
ALTER TABLE users_profile RENAME TO profiles;

-- Add new columns if they don't exist
ALTER TABLE profiles 
  ADD COLUMN IF NOT EXISTS full_name TEXT,
  ADD COLUMN IF NOT EXISTS company_name TEXT,
  ADD COLUMN IF NOT EXISTS phone TEXT,
  ADD COLUMN IF NOT EXISTS home_city TEXT;

-- Rename existing columns if needed
-- ALTER TABLE profiles RENAME COLUMN name TO full_name;
-- ALTER TABLE profiles RENAME COLUMN city TO home_city;
```

### Option 2: Create new table and migrate data
```sql
-- Create profiles table (from supabase_schema.sql)
-- Then migrate data:
INSERT INTO profiles (id, full_name, company_name, occupation, phone, home_city, age, gender, health_conditions, created_at)
SELECT 
  id,
  name as full_name,
  NULL as company_name, -- Set default or migrate from existing data
  occupation,
  NULL as phone, -- Add if you have this data
  city as home_city,
  age,
  gender,
  health_conditions,
  created_at
FROM users_profile;

-- Drop old table after verification
-- DROP TABLE users_profile;
```

## Code Updates Required

After migration, update `databaseService.js`:
- Change `'users_profile'` to `'profiles'` in all queries
- Update field mappings:
  - `name` → `full_name`
  - `city` → `home_city`
  - Add `company_name` handling

## Testing Checklist

- [ ] Run schema creation script
- [ ] Verify RLS policies work
- [ ] Test user profile creation
- [ ] Test user profile updates
- [ ] Test risk log insertion
- [ ] Verify users can only see their own data
- [ ] Update application code
- [ ] Test end-to-end user flow


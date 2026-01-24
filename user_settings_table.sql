-- =====================================================
-- USER_SETTINGS TABLE - Standalone SQL Script
-- =====================================================
-- Run this script in your Supabase SQL Editor to create
-- the user_settings table if it doesn't already exist.
-- =====================================================

-- Create user_settings table
CREATE TABLE IF NOT EXISTS user_settings (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    dark_mode BOOLEAN DEFAULT false,
    push_notifications BOOLEAN DEFAULT true,
    high_risk_alerts BOOLEAN DEFAULT true,
    daily_forecast BOOLEAN DEFAULT true,
    health_tips BOOLEAN DEFAULT true,
    language TEXT DEFAULT 'en' CHECK (language IN ('en', 'hi', 'mr')),
    location_permission BOOLEAN DEFAULT false,
    lat DOUBLE PRECISION, -- Optional: stored location latitude (for dev mode fallback)
    lon DOUBLE PRECISION, -- Optional: stored location longitude (for dev mode fallback)
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index on user_id for faster lookups
CREATE INDEX IF NOT EXISTS idx_user_settings_id ON user_settings(id);

-- Enable RLS on user_settings table
ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;

-- RLS Policies for user_settings
CREATE POLICY "Users can insert their own settings"
    ON user_settings
    FOR INSERT
    WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can select their own settings"
    ON user_settings
    FOR SELECT
    USING (auth.uid() = id);

CREATE POLICY "Users can update their own settings"
    ON user_settings
    FOR UPDATE
    USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can delete their own settings"
    ON user_settings
    FOR DELETE
    USING (auth.uid() = id);

-- Create or replace function for updating updated_at (if not already exists)
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update updated_at on user_settings table
CREATE TRIGGER update_user_settings_updated_at
    BEFORE UPDATE ON user_settings
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Grant permissions to authenticated users
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON user_settings TO authenticated;


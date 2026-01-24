-- =====================================================
-- HeatSense AI - Supabase Database Schema
-- =====================================================
-- This script creates the database tables and RLS policies
-- for the HeatSense AI application with B2B Dashboard support.
-- =====================================================

-- =====================================================
-- 1. PROFILES TABLE (User Identity)
-- =====================================================
-- Stores user profile information including company affiliation
-- for B2B grouping and management.

CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT,
    company_name TEXT, -- Crucial for B2B grouping (e.g., 'Swiggy', 'Zomato')
    occupation TEXT, -- e.g., 'Outdoor Worker', 'Delivery', 'Construction'
    phone TEXT,
    home_city TEXT, -- Manual city entered in profile as fallback
    age INTEGER,
    gender TEXT,
    health_conditions TEXT[], -- Array of health condition strings
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index on company_name for efficient B2B queries
CREATE INDEX IF NOT EXISTS idx_profiles_company_name ON profiles(company_name);

-- Create index on user_id for faster lookups
CREATE INDEX IF NOT EXISTS idx_profiles_id ON profiles(id);

-- =====================================================
-- 2. USER_SETTINGS TABLE (User Preferences)
-- =====================================================
-- Stores user preferences and settings for the application.

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

-- =====================================================
-- 3. EMPLOYEE_RISK_LOGS TABLE (Live Tracking)
-- =====================================================
-- Stores real-time risk assessments for B2B Dashboard analytics.
-- Each log entry represents a snapshot of user's risk at a location.

CREATE TABLE IF NOT EXISTS employee_risk_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    current_lat DOUBLE PRECISION NOT NULL, -- EXACT live latitude
    current_lon DOUBLE PRECISION NOT NULL, -- EXACT live longitude
    risk_score INTEGER NOT NULL CHECK (risk_score >= 0 AND risk_score <= 100), -- 0-100
    risk_label TEXT NOT NULL CHECK (risk_label IN ('Low', 'Medium', 'High', 'Critical')),
    recorded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for efficient queries
CREATE INDEX IF NOT EXISTS idx_risk_logs_user_id ON employee_risk_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_risk_logs_recorded_at ON employee_risk_logs(recorded_at DESC);
CREATE INDEX IF NOT EXISTS idx_risk_logs_risk_label ON employee_risk_logs(risk_label);

-- Composite index for B2B dashboard queries (company + time range)
-- Note: This will be used when joining with profiles table for company-based queries
CREATE INDEX IF NOT EXISTS idx_risk_logs_user_time ON employee_risk_logs(user_id, recorded_at DESC);

-- =====================================================
-- 4. ROW LEVEL SECURITY (RLS) POLICIES
-- =====================================================

-- Enable RLS on profiles table
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Enable RLS on user_settings table
ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;

-- Enable RLS on employee_risk_logs table
ALTER TABLE employee_risk_logs ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- 5. PROFILES TABLE POLICIES
-- =====================================================

-- Policy: Users can insert their own profile
CREATE POLICY "Users can insert their own profile"
    ON profiles
    FOR INSERT
    WITH CHECK (auth.uid() = id);

-- Policy: Users can select their own profile
CREATE POLICY "Users can select their own profile"
    ON profiles
    FOR SELECT
    USING (auth.uid() = id);

-- Policy: Users can update their own profile
CREATE POLICY "Users can update their own profile"
    ON profiles
    FOR UPDATE
    USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);

-- Policy: Users can delete their own profile
CREATE POLICY "Users can delete their own profile"
    ON profiles
    FOR DELETE
    USING (auth.uid() = id);

-- =====================================================
-- 6. USER_SETTINGS TABLE POLICIES
-- =====================================================

-- Policy: Users can insert their own settings
CREATE POLICY "Users can insert their own settings"
    ON user_settings
    FOR INSERT
    WITH CHECK (auth.uid() = id);

-- Policy: Users can select their own settings
CREATE POLICY "Users can select their own settings"
    ON user_settings
    FOR SELECT
    USING (auth.uid() = id);

-- Policy: Users can update their own settings
CREATE POLICY "Users can update their own settings"
    ON user_settings
    FOR UPDATE
    USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);

-- Policy: Users can delete their own settings
CREATE POLICY "Users can delete their own settings"
    ON user_settings
    FOR DELETE
    USING (auth.uid() = id);

-- =====================================================
-- 7. EMPLOYEE_RISK_LOGS TABLE POLICIES
-- =====================================================

-- Policy: Users can insert their own risk logs
CREATE POLICY "Users can insert their own risk logs"
    ON employee_risk_logs
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Policy: Users can select their own risk logs
CREATE POLICY "Users can select their own risk logs"
    ON employee_risk_logs
    FOR SELECT
    USING (auth.uid() = user_id);

-- =====================================================
-- 8. TRIGGERS
-- =====================================================

-- Trigger to automatically update updated_at on user_settings table
CREATE TRIGGER update_user_settings_updated_at
    BEFORE UPDATE ON user_settings
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- 9. FUTURE B2B DASHBOARD POLICIES (COMMENTED)
-- =====================================================
-- Uncomment and modify these policies when implementing B2B Dashboard
-- These will allow managers to view data for employees in their company

/*
-- Policy: Managers can select profiles from their company
-- Note: This assumes a 'managers' table or role system exists
-- You'll need to create a managers table or use a role-based approach

CREATE POLICY "Managers can select company profiles"
    ON profiles
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM managers
            WHERE managers.user_id = auth.uid()
            AND managers.company_name = profiles.company_name
        )
    );

-- Policy: Managers can select risk logs for their company employees
CREATE POLICY "Managers can select company risk logs"
    ON employee_risk_logs
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM managers m
            JOIN profiles p ON p.company_name = m.company_name
            WHERE m.user_id = auth.uid()
            AND p.id = employee_risk_logs.user_id
        )
    );
*/

-- =====================================================
-- 10. HELPER FUNCTION: Update updated_at timestamp
-- =====================================================
-- Automatically updates the updated_at column when a profile is modified

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- 11. GRANT PERMISSIONS
-- =====================================================
-- Ensure authenticated users have necessary permissions

GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON profiles TO authenticated;
GRANT ALL ON user_settings TO authenticated;
GRANT ALL ON employee_risk_logs TO authenticated;

-- =====================================================
-- END OF SCHEMA
-- =====================================================


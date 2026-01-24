import { createClient } from '@supabase/supabase-js'

// TODO: Switch back to env variables before production

const supabaseUrl = "https://rrlnkyzhxwsnlfemkzvy.supabase.co"

const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJybG5reXpoeHdzbmxmZW1renZ5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjUxOTU1MDIsImV4cCI6MjA4MDc3MTUwMn0._XgghTRQAgRfxYjB3JAr2TWg2iHSzrsWC7qt8BkltYs"

export const supabase = createClient(supabaseUrl, supabaseKey)
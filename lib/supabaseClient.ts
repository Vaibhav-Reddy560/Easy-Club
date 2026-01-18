import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://uzecgrofzvbnuvzjtabn.supabase.co"; 
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV6ZWNncm9menZibnV2emp0YWJuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjY5MzA3OTEsImV4cCI6MjA4MjUwNjc5MX0.FrsJl-J6hDQhRCqj8-1vf9cUMZ9B73-7KyoG3KUX8ZM";

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
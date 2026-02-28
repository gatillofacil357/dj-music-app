import { createClient } from '@supabase/supabase-js'

export const supabaseUrl = 'https://gptosiozumvqjglfxjdi.supabase.co'
export const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdwdG9zaW96dW12cWpnbGZ4amRpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzIyNDkzMjAsImV4cCI6MjA4NzgyNTMyMH0.uA-M3EGiqgDHG_tve8tRvui-Sw0qTNklsvurtUvWt6I'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

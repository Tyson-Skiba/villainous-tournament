import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://gpmbsnmkmeuxqencucmj.supabase.co'
const supabaseAnonKey =
	'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdwbWJzbm1rbWV1eHFlbmN1Y21qIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODU5MDUwNjEsImV4cCI6MjEwMTQ4MTA2MX0.Y9Og0mz0aChrpIwBRlKoxRF3hiraSMRFdq9CY0N9l6w'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

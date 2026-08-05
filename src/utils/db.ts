import { createClient } from '@supabase/supabase-js'
import { PersistedApp } from '../types'

/*
create table user_data (
  user_id uuid primary key references auth.users(id) on delete cascade,
  data jsonb not null,
  updated_at timestamptz default now()
);

alter table user_data enable row level security;

create policy "Users can manage their own blob"
  on user_data
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
*/

const supabaseUrl = 'https://gpmbsnmkmeuxqencucmj.supabase.co'
const supabaseAnonKey =
	'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdwbWJzbm1rbWV1eHFlbmN1Y21qIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODU5MDUwNjEsImV4cCI6MjEwMTQ4MTA2MX0.Y9Og0mz0aChrpIwBRlKoxRF3hiraSMRFdq9CY0N9l6w'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export const upsertBlob = async (appState: PersistedApp) => {
	const {
		data: { user },
	} = await supabase.auth.getUser()
	if (!user) throw new Error('Not logged in')

	const { error } = await supabase.from('user_data').upsert({
		user_id: user.id,
		data: appState,
		updated_at: new Date().toISOString(),
	})

	if (error) throw error
}

export const loadBlob = async (): Promise<PersistedApp> => {
	const { data, error } = await supabase
		.from('user_data')
		.select('data')
		.maybeSingle()

	if (error) throw error
	return data?.data ?? null
}

export const deleteBlob = async () => {
	const {
		data: { user },
	} = await supabase.auth.getUser()

	if (!user) throw new Error('Not logged in')

	const { error } = await supabase
		.from('user_data')
		.delete()
		.eq('user_id', user.id)

	if (error) throw error
}

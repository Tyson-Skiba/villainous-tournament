// hooks/useAuth.ts
import { useEffect, useState } from 'react'
import { supabase } from '../utils/db'
import type { User } from '@supabase/supabase-js'

export const useAuth = () => {
	const [user, setUser] = useState<User | null>(null)
	const [loading, setLoading] = useState(true)

	useEffect(() => {
		supabase.auth.getSession().then(({ data: { session } }) => {
			setUser(session?.user ?? null)
			setLoading(false)
		})

		const {
			data: { subscription },
		} = supabase.auth.onAuthStateChange((_event, session) => {
			setUser(session?.user ?? null)
		})

		return () => subscription.unsubscribe()
	}, [])

	const signInWithGoogle = () =>
		supabase.auth.signInWithOAuth({ provider: 'google' })

	const signInWithEmail = (email: string, password: string) =>
		supabase.auth.signInWithPassword({ email, password })

	const signUp = (email: string, password: string) =>
		supabase.auth.signUp({ email, password })

	const signOut = () => supabase.auth.signOut()

	return { user, loading, signInWithGoogle, signInWithEmail, signUp, signOut }
}

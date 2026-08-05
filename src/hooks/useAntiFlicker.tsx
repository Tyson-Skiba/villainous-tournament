import { useState, useEffect } from 'react'

export const useAntiFlicker = (delay = 400) => {
	const [ready, setReady] = useState(false)

	useEffect(() => {
		const id = setTimeout(() => setReady(true), delay)
		return () => clearTimeout(id)
	}, [delay])

	return ready
}

import { useEffect, useState } from 'react'

const isDarkMode =
	window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches

export const useSystemTheme = () => {
	const [systemTheme, storeSystemTheme] = useState<'light' | 'dark'>(
		isDarkMode ? 'dark' : 'light',
	)

	useEffect(() => {
		const handleEvent = (event: MediaQueryListEvent) => {
			storeSystemTheme(event.matches ? 'dark' : 'light')
		}

		window
			.matchMedia('(prefers-color-scheme: dark)')
			.addEventListener('change', handleEvent)

		return () => {
			window
				.matchMedia('(prefers-color-scheme: dark)')
				.removeEventListener('change', handleEvent)
		}
	}, [])

	return [systemTheme]
}

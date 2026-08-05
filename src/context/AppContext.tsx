import {
	createContext,
	PropsWithChildren,
	useContext,
	useEffect,
	useState,
} from 'react'
import { defaults, loadApp, saveApp } from '../storage'
import { Screen, PersistedApp, AppTheme, OverlayType } from '../types'
import { useSystemTheme } from '../hooks/useSystemTheme'
import { getCssVariable } from '../utils/getCssProperty'

interface AppProviderProps {
	app: PersistedApp
	screen: Screen
	overlay: OverlayType
	statsMode: 'player' | 'character'
	commit: (next: PersistedApp) => void
	setScreen: (screen: Screen) => void
	toggleTheme: () => void
	setTheme: (theme: AppTheme) => void
	setOverlay: (overlay: OverlayType) => void
	setStatsMode: (mode: 'player' | 'character') => void
}

const AppContext = createContext<AppProviderProps>({
	app: defaults,
	screen: 'owned-sets',
	overlay: undefined,
	statsMode: 'player',
	commit: () => null,
	setTheme: () => null,
	setScreen: () => null,
	setOverlay: () => null,
	toggleTheme: () => null,
	setStatsMode: () => null,
})

export const AppProvider: React.FC<PropsWithChildren> = ({ children }) => {
	const [systemTheme] = useSystemTheme()
	const [app, setApp] = useState(loadApp)
	const [overlay, setOverlay] = useState<OverlayType>()
	const [statsMode, setStatsMode] = useState<'player' | 'character'>('player')
	const [screen, setScreen] = useState<Screen>(() =>
		app.ownedSetIds.length ? 'players' : 'owned-sets',
	)

	useEffect(() => {
		const effectiveTheme = app.theme === 'system' ? systemTheme : app.theme

		document.documentElement.dataset.theme = effectiveTheme
		const meta = document.querySelector<HTMLMetaElement>(
			'meta[name="theme-color"]',
		)

		if (!meta) return

		const colour = getCssVariable('--bg')

		meta.setAttribute('content', colour)
	}, [app.theme, systemTheme])

	const commit = (next: typeof app) => {
		setApp(next)
		saveApp(next)
	}

	const toggleTheme = () => {
		commit({ ...app, theme: app.theme === 'dark' ? 'light' : 'dark' })
	}

	const setTheme = (theme: AppTheme) => {
		commit({ ...app, theme })
	}

	return (
		<AppContext.Provider
			value={{
				app,
				screen,
				overlay,
				statsMode,
				commit,
				toggleTheme,
				setTheme,
				setScreen,
				setOverlay,
				setStatsMode,
			}}
		>
			{children}
		</AppContext.Provider>
	)
}

export const useAppContext = () => useContext(AppContext)

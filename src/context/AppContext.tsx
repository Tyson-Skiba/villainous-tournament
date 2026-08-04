import {
	createContext,
	PropsWithChildren,
	useContext,
	useEffect,
	useState,
} from 'react'
import { loadApp, saveApp } from '../storage'
import { Screen, PersistedApp } from '../types'

interface AppProviderProps {
	app: PersistedApp
	screen: Screen
	statsMode: 'player' | 'character'
	commit: (next: PersistedApp) => void
	setScreen: (screen: Screen) => void
	toggleTheme: () => void
	setStatsMode: (mode: 'player' | 'character') => void
}

const AppContext = createContext<AppProviderProps>({
	app: {} as any,
	screen: 'owned-sets',
	statsMode: 'player',
	commit: () => null,
	setScreen: () => null,
	toggleTheme: () => null,
	setStatsMode: () => null,
})

export const AppProvider: React.FC<PropsWithChildren> = ({ children }) => {
	const [app, setApp] = useState(loadApp)
	const [statsMode, setStatsMode] = useState<'player' | 'character'>('player')
	const [screen, setScreen] = useState<Screen>(() =>
		app.ownedSetIds.length ? 'players' : 'owned-sets',
	)

	useEffect(() => {
		document.documentElement.dataset.theme = app.theme
	}, [app.theme])

	const commit = (next: typeof app) => {
		setApp(next)
		saveApp(next)
	}

	const toggleTheme = () => {
		commit({ ...app, theme: app.theme === 'dark' ? 'light' : 'dark' })
	}

	return (
		<AppContext.Provider
			value={{
				app,
				screen,
				statsMode,
				commit,
				toggleTheme,
				setScreen,
				setStatsMode,
			}}
		>
			{children}
		</AppContext.Provider>
	)
}

export const useAppContext = () => useContext(AppContext)

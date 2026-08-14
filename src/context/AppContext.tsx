import {
	createContext,
	PropsWithChildren,
	useContext,
	useEffect,
	useMemo,
	useState,
} from 'react'
import { defaults, loadApp, saveApp } from '../storage'
import { Screen, PersistedApp, AppTheme, OverlayType } from '../types'
import { useAuth, useSystemTheme } from '../hooks'
import { getCssVariable, loadBlob, upsertBlob, LobbyBroker } from '../utils'

interface AppProviderProps {
	app: PersistedApp
	screen: Screen
	lobbies: LobbyBroker
	overlay: OverlayType
	statsMode: 'player' | 'character'
	activeLobby?: string
	commit: (next: PersistedApp) => void
	setScreen: (screen: Screen) => void
	toggleTheme: () => void
	setLobby: (lobby?: string) => void
	setTheme: (theme: AppTheme) => void
	setOverlay: (overlay: OverlayType) => void
	setStatsMode: (mode: 'player' | 'character') => void
}

const AppContext = createContext<AppProviderProps>({
	app: defaults,
	screen: 'owned-sets',
	lobbies: null as unknown as LobbyBroker,
	overlay: undefined,
	statsMode: 'player',
	activeLobby: undefined,
	commit: () => null,
	setLobby: () => null,
	setTheme: () => null,
	setScreen: () => null,
	setOverlay: () => null,
	toggleTheme: () => null,
	setStatsMode: () => null,
})

export const AppProvider: React.FC<PropsWithChildren> = ({ children }) => {
	const { user } = useAuth()
	const [systemTheme] = useSystemTheme()
	const [app, setApp] = useState(loadApp)
	const [overlay, setOverlay] = useState<OverlayType>()
	const [activeLobby, setLobby] = useState<string>()
	const [statsMode, setStatsMode] = useState<'player' | 'character'>('player')
	const [screen, setScreen] = useState<Screen>(() =>
		app.ownedSetIds.length ? 'players' : 'owned-sets',
	)
	const lobbies = useMemo(() => new LobbyBroker(), [])

	useEffect(() => {
		lobbies.openConnection()
	}, [])

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

	useEffect(() => {
		if (!user) return

		let cancelled = false

		;(async () => {
			const appData = await loadBlob()
			if (cancelled) return
			if (!appData) return

			setApp(appData)
			setScreen('players')
		})()

		return () => {
			cancelled = true
		}
	}, [user?.id])

	const commit = (next: typeof app) => {
		setApp(next)
		saveApp(next)
		if (user) upsertBlob(next)
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
				lobbies,
				statsMode,
				activeLobby,
				commit,
				toggleTheme,
				setLobby,
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

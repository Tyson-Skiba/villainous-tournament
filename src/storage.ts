import type { PersistedApp } from './types'

export const STORAGE_KEY = 'villainous-draw'
export const THEME_KEY = 'villainous-theme'
const HOST_NAME_KEY = 'villainous-host'
const GUEST_NAME_KEY = 'villainous-guest'

export const defaults: PersistedApp = {
	ownedSetIds: [],
	players: [
		{ id: crypto.randomUUID(), name: 'Player 1' },
		{ id: crypto.randomUUID(), name: 'Player 2' },
	],
	rounds: 2,
	stats: { rounds: [] },
	theme: 'dark',
}

export const loadApp = (): PersistedApp => {
	try {
		const raw = localStorage.getItem(STORAGE_KEY)
		if (!raw) return defaults
		const parsed = JSON.parse(raw) as Partial<PersistedApp>
		return {
			...defaults,
			...parsed,
			players: parsed.players?.length ? parsed.players : defaults.players,
			stats: parsed.stats ?? defaults.stats,
		}
	} catch {
		return defaults
	}
}

export const saveApp = (app: PersistedApp) => {
	localStorage.setItem(STORAGE_KEY, JSON.stringify(app))
}

export const clearGameOnly = (app: PersistedApp) => {
	saveApp({ ...app, rounds: 2, players: app.players })
}

export const saveLobbyUsername = (name: string, host?: boolean) => {
	localStorage.setItem(host ? HOST_NAME_KEY : GUEST_NAME_KEY, name)
}

export const getLobbyUsername = (host?: boolean) =>
	localStorage.getItem(host ? HOST_NAME_KEY : GUEST_NAME_KEY) ?? ''

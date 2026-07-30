import type { PersistedApp } from './types'

export const STORAGE_KEY = 'villainous-draw'
export const THEME_KEY = 'villainous-theme'

const defaults: PersistedApp = {
  ownedSetIds: [],
  players: [
    { id: crypto.randomUUID(), name: 'Player 1' },
    { id: crypto.randomUUID(), name: 'Player 2' },
  ],
  rounds: 2,
  stats: { rounds: [] },
  theme: 'dark',
}

export function loadApp(): PersistedApp {
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

export function saveApp(app: PersistedApp) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(app))
}

export function clearGameOnly(app: PersistedApp) {
  saveApp({ ...app, rounds: 2, players: app.players })
}

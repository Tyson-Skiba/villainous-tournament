export type Screen =
	| 'owned-sets'
	| 'players'
	| 'tournament'
	| 'rounds'
	| 'leaderboard'
	| 'stats'
	| 'lobby'

export type AppTheme = 'dark' | 'light' | 'system'

export type OverlayType =
	'stats' | 'collection' | 'villains' | 'login' | undefined

export interface VillainSet {
	id: string
	name: string
	year: number
	villains: string[]
}

export interface Asset {
	assetId: string
	type: 'set' | 'villain'
	wikiPage: string
	filename: string
}

export interface Player {
	id: string
	name: string
}

export interface Assignment {
	round: number
	character: string
	refreshed: boolean
}

export interface Game {
	gameId: string
	rounds: number
	players: Player[]
	assignments: Record<string, Assignment[]>
	refreshUsed: Record<string, boolean>
	roundResults: Record<number, Record<string, number>>
	currentRound: number
}

export interface RoundStat {
	gameId?: string
	round: number
	playerId: string
	playerName: string
	character: string
	place: number
}

export interface StoredStats {
	rounds: RoundStat[]
}

export interface PersistedApp {
	ownedSetIds: string[]
	players: Player[]
	rounds: number
	stats: StoredStats
	theme: AppTheme
}

export interface Villain {
	objective: string
	set: string
}

export interface PlayerResult {
	player: Player
	wins: number
	points: number
	rounds: number
}

export interface Lobby {
	hostUid: string
	started: boolean
	stateVersion: number
	created: number
	results: GameResult
	game?: Game
}

export interface LobbyPlayer {
	id: string
	name: string
	joined: number
}

export interface GameResult {
	[x: number]: Record<string, number>
}

export interface CharacterStats {
	character: string
	appearances: number
	wins: number
	winRate: number
	averagePlace: number
	opponents: number
	matchupScore: number
}

export interface CharacterMatchup {
	character: string
	opponent: string
	wins: number
	losses: number
	ties: number
	games: number
	winRate: number
}

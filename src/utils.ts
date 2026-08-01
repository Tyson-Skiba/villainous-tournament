import type { Assignment, Game, Player, RoundStat, StoredStats } from './types'
import { villainCounts } from './data'
import { nativeCompress } from './utils/strings'

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

export function characterLeaderboard(stats: RoundStat[]): CharacterStats[] {
	const map = new Map<
		string,
		{
			character: string
			appearances: number
			wins: number
			totalPlace: number
			opponents: Set<string>
		}
	>()

	for (const row of stats) {
		const current = map.get(row.character) ?? {
			character: row.character,
			appearances: 0,
			wins: 0,
			totalPlace: 0,
			opponents: new Set<string>(),
		}

		current.appearances += 1
		current.totalPlace += row.place

		if (row.place === 1) {
			current.wins += 1
		}

		map.set(row.character, current)
	}

	// Determine unique opponents from the same game + round.
	const validRows = stats.filter((row) => row.gameId)

	for (const row of validRows) {
		const opponents = validRows.filter(
			(other) =>
				other.gameId === row.gameId &&
				other.round === row.round &&
				other.character !== row.character,
		)

		const current = map.get(row.character)

		opponents.forEach((opponent) => {
			current?.opponents.add(opponent.character)
		})
	}

	return [...map.values()]
		.map((row) => {
			const winRate = row.appearances > 0 ? row.wins / row.appearances : 0

			const averagePlace =
				row.appearances > 0 ? row.totalPlace / row.appearances : 0

			return {
				character: row.character,
				appearances: row.appearances,
				wins: row.wins,
				winRate,
				averagePlace,
				opponents: row.opponents.size,
				matchupScore: 0,
			}
		})
		.sort(
			(a, b) =>
				b.wins - a.wins ||
				b.appearances - a.appearances ||
				a.character.localeCompare(b.character),
		)
}

export function shuffle<T>(items: T[]) {
	const copy = [...items]
	for (let i = copy.length - 1; i > 0; i--) {
		const j = Math.floor(Math.random() * (i + 1))
		;[copy[i], copy[j]] = [copy[j], copy[i]]
	}
	return copy
}

export function buildAssignments(
	players: Player[],
	rounds: number,
	ownedSetIds: string[],
) {
	const counts = villainCounts(ownedSetIds)
	const result: Record<string, Assignment[]> = {}
	const usedByPlayer = new Map<string, Set<string>>()

	for (const player of players) {
		result[player.id] = []
		usedByPlayer.set(player.id, new Set())
	}

	for (let round = 1; round <= rounds; round++) {
		const available: string[] = []
		for (const [character, count] of counts) {
			for (let i = 0; i < count; i++) available.push(character)
		}

		const shuffled = shuffle(available)
		const usedThisRound = new Map<string, number>()

		for (const player of shuffle(players)) {
			const alreadyUsed = usedByPlayer.get(player.id)!

			// prefer characters this player hasn't had before
			let candidates = shuffled.filter((character) => {
				const used = usedThisRound.get(character) ?? 0
				const max = counts.get(character) ?? 0
				return used < max && !alreadyUsed.has(character)
			})

			// if none left, fall back to any valid (only happens if rounds > unique characters)
			if (!candidates.length) {
				candidates = shuffled.filter((character) => {
					const used = usedThisRound.get(character) ?? 0
					const max = counts.get(character) ?? 0
					return used < max
				})
			}

			if (!candidates.length) continue

			const character = candidates[0]
			const idx = shuffled.indexOf(character)
			if (idx >= 0) shuffled.splice(idx, 1)

			usedThisRound.set(character, (usedThisRound.get(character) ?? 0) + 1)
			alreadyUsed.add(character)

			result[player.id].push({ round, character, refreshed: false })
		}
	}

	return result
}

export function rerollAssignment(
	game: Game,
	playerId: string,
	round: number,
	ownedSetIds: string[],
) {
	if (game.refreshUsed[playerId]) return game

	const counts = villainCounts(ownedSetIds)
	const target = game.assignments[playerId]?.find((a) => a.round === round)
	if (!target) return game

	const assigned = Object.values(game.assignments)
		.flat()
		.filter((a) => a.round === round)
		.map((a) => a.character)

	const current = target.character

	const prev = game.assignments[playerId]?.find(
		(a) => a.round === round - 1,
	)?.character

	const available: string[] = []
	for (const [character, count] of counts) {
		const used = assigned.filter((name) => name === character).length
		for (let i = used; i < count; i++) available.push(character)
	}

	let candidates = available.filter((name) => name !== current)

	if (prev) {
		candidates = candidates.filter((name) => name !== prev)
	}

	if (!candidates.length) return game

	const replacement = shuffle(candidates)[0]
	const assignments = { ...game.assignments }
	assignments[playerId] = assignments[playerId].map((a) =>
		a.round === round ? { ...a, character: replacement, refreshed: true } : a,
	)

	return {
		...game,
		assignments,
		refreshUsed: { ...game.refreshUsed, [playerId]: true },
	}
}

export function calculatePoints(place: number, playerCount: number) {
	return playerCount - place + 1
}

export function leaderboard(players: Player[], stats: StoredStats) {
	return players
		.map((player) => {
			const rows = stats.rounds.filter((r) => r.playerId === player.id)
			const wins = rows.filter((r) => r.place === 1).length
			const points = rows.reduce(
				(sum, r) => sum + calculatePoints(r.place, players.length),
				0,
			)
			return { player, wins, points, rounds: rows.length }
		})
		.sort(
			(a, b) =>
				b.points - a.points ||
				b.wins - a.wins ||
				a.player.name.localeCompare(b.player.name),
		)
}

export function characterMatchups(
	stats: RoundStat[],
	character: string,
): CharacterMatchup[] {
	// Matchups can only be calculated reliably for new stats
	// that have a gameId.
	const valid = stats.filter((row) => row.gameId)
	console.log(validateRounds)
	const opponents = new Map<
		string,
		{
			wins: number
			losses: number
			ties: number
		}
	>()

	const games = new Map<string, RoundStat[]>()

	for (const row of valid) {
		const key = `${row.gameId}:${row.round}`

		const rows = games.get(key) ?? []
		rows.push(row)
		games.set(key, rows)
	}

	for (const rows of games.values()) {
		const current = rows.find((row) => row.character === character)

		if (!current) continue

		for (const opponent of rows) {
			if (opponent.character === character) continue

			const result = opponents.get(opponent.character) ?? {
				wins: 0,
				losses: 0,
				ties: 0,
			}

			if (current.place < opponent.place) {
				result.wins += 1
			} else if (current.place > opponent.place) {
				result.losses += 1
			} else {
				result.ties += 1
			}

			opponents.set(opponent.character, result)
		}
	}

	return [...opponents.entries()]
		.map(([opponent, result]) => {
			const games = result.wins + result.losses + result.ties

			// A draw counts as half a win.
			const winRate = games > 0 ? (result.wins + result.ties * 0.5) / games : 0

			return {
				character,
				opponent,
				...result,
				games,
				winRate,
			}
		})
		.sort(
			(a, b) =>
				b.winRate - a.winRate ||
				b.games - a.games ||
				a.opponent.localeCompare(b.opponent),
		)
}

export function characterAllRounders(stats: RoundStat[]): CharacterStats[] {
	const characters = characterLeaderboard(stats)

	return characters
		.filter((character) => character.appearances >= 3)
		.map((character) => {
			const matchups = characterMatchups(stats, character.character)

			const matchupScore =
				matchups.length > 0
					? matchups.reduce((sum, matchup) => sum + matchup.winRate, 0) /
						matchups.length
					: 0

			return {
				...character,
				matchupScore,
			}
		})
		.sort(
			(a, b) =>
				b.matchupScore - a.matchupScore ||
				b.winRate - a.winRate ||
				a.averagePlace - b.averagePlace,
		)
}

function getPreviousCharacter(game: Game, playerId: string, round: number) {
	if (round <= 1) return null
	const prev = game.assignments[playerId].find((a) => a.round === round - 1)
	return prev?.character ?? null
}

function pickCharacterForRound(
	game: Game,
	playerId: string,
	round: number,
	availableCharacters: string[],
) {
	const prev = getPreviousCharacter(game, playerId, round)

	const pool = prev
		? availableCharacters.filter((c) => c !== prev)
		: availableCharacters

	if (pool.length === 0) {
		throw new Error('No valid characters left — reduce number of rounds.')
	}

	return pool[Math.floor(Math.random() * pool.length)]
}

export function validateRounds(draftRounds: number, totalCopies: number) {
	return totalCopies >= draftRounds
}

export function ordinal(n: number) {
	const mod10 = n % 10
	const mod100 = n % 100

	if (mod10 === 1 && mod100 !== 11) return `${n}st`
	if (mod10 === 2 && mod100 !== 12) return `${n}nd`
	if (mod10 === 3 && mod100 !== 13) return `${n}rd`

	return `${n}th`
}

export async function shareFixture(game: Game) {
	const fixture = await nativeCompress(JSON.stringify(game))
	const url = `${window.location.protocol}//${window.location.host}?fixture=${fixture}`
	const data = {
		title: 'Villainous Tournament',
		text: 'Your Villainous Fixture Awaits - Who Will Win?',
		url,
	}

	navigator.share(data)
}

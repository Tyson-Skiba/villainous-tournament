import { RoundStat, CharacterStats, Player, StoredStats } from '../types'

export const characterLeaderboard = (stats: RoundStat[]): CharacterStats[] => {
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

export const leaderboard = (players: Player[], stats: StoredStats) =>
	players
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

export const calculatePoints = (place: number, playerCount: number) =>
	playerCount - place + 1

export const ordinal = (n: number) => {
	const mod10 = n % 10
	const mod100 = n % 100

	if (mod10 === 1 && mod100 !== 11) return `${n}st`
	if (mod10 === 2 && mod100 !== 12) return `${n}nd`
	if (mod10 === 3 && mod100 !== 13) return `${n}rd`

	return `${n}th`
}

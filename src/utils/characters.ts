import { RoundStat, CharacterMatchup, CharacterStats, Game } from '../types'
import { characterLeaderboard } from './leaderboard'

export const characterMatchups = (
	stats: RoundStat[],
	character: string,
): CharacterMatchup[] => {
	const valid = stats.filter((row) => row.gameId)

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

export const characterAllRounders = (stats: RoundStat[]): CharacterStats[] => {
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

const getPreviousCharacter = (game: Game, playerId: string, round: number) => {
	if (round <= 1) return null
	const prev = game.assignments[playerId].find((a) => a.round === round - 1)
	return prev?.character ?? null
}

const pickCharacterForRound = (
	game: Game,
	playerId: string,
	round: number,
	availableCharacters: string[],
) => {
	const prev = getPreviousCharacter(game, playerId, round)

	const pool = prev
		? availableCharacters.filter((c) => c !== prev)
		: availableCharacters

	if (pool.length === 0) {
		throw new Error('No valid characters left — reduce number of rounds.')
	}

	return pool[Math.floor(Math.random() * pool.length)]
}

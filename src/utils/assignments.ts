import { Player, Assignment, Game } from '../types'
import { shuffle } from '../utils'
import { villainCounts } from './data'

export const buildAssignments = (
	players: Player[],
	rounds: number,
	ownedSetIds: string[],
) => {
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

export const rerollAssignment = (
	game: Game,
	playerId: string,
	round: number,
	ownedSetIds: string[],
) => {
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

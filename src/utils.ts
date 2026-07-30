import type { Assignment, Game, Player, RoundStat, StoredStats } from './types'
import { villainCounts } from './data'

export function shuffle<T>(items: T[]) {
  const copy = [...items]
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[copy[i], copy[j]] = [copy[j], copy[i]]
  }
  return copy
}

export function buildAssignments(players: Player[], rounds: number, ownedSetIds: string[]) {
  const counts = villainCounts(ownedSetIds)
  const result: Record<string, Assignment[]> = {}
  for (const player of players) result[player.id] = []

  for (let round = 1; round <= rounds; round++) {
    const available: string[] = []
    for (const [character, count] of counts) {
      for (let i = 0; i < count; i++) available.push(character)
    }
    const shuffled = shuffle(available)
    const usedThisRound = new Map<string, number>()

    for (const player of shuffle(players)) {
      let pickIndex = shuffled.findIndex((character) => {
        const used = usedThisRound.get(character) ?? 0
        return used < (counts.get(character) ?? 0)
      })
      if (pickIndex < 0) pickIndex = 0
      const character = shuffled[pickIndex]
      shuffled.splice(pickIndex, 1)
      usedThisRound.set(character, (usedThisRound.get(character) ?? 0) + 1)
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

  const assigned = Object.values(game.assignments).flat()
    .filter((a) => a.round === round)
    .map((a) => a.character)

  const current = target.character
  const available: string[] = []
  for (const [character, count] of counts) {
    const used = assigned.filter((name) => name === character).length
    for (let i = used; i < count; i++) available.push(character)
  }

  const candidates = available.filter((name) => name !== current)
  if (!candidates.length) return game

  const replacement = shuffle(candidates)[0]
  const assignments = { ...game.assignments }
  assignments[playerId] = assignments[playerId].map((a) =>
    a.round === round ? { ...a, character: replacement, refreshed: true } : a
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
      const points = rows.reduce((sum, r) => sum + calculatePoints(r.place, players.length), 0)
      return { player, wins, points, rounds: rows.length }
    })
    .sort((a, b) => b.points - a.points || b.wins - a.wins || a.player.name.localeCompare(b.player.name))
}

export function characterLeaderboard(stats: RoundStat[]) {
  const map = new Map<string, { character: string; wins: number; appearances: number }>()
  for (const row of stats) {
    const current = map.get(row.character) ?? { character: row.character, wins: 0, appearances: 0 }
    current.appearances += 1
    if (row.place === 1) current.wins += 1
    map.set(row.character, current)
  }
  return [...map.values()].sort((a, b) => b.wins - a.wins || b.appearances - a.appearances || a.character.localeCompare(b.character))
}

import { Crown } from 'lucide-react'
import { Game, PlayerResult, RoundStat } from '../types'
import { leaderboard } from '../utils'

interface LeaderboardViewProps {
	game: Game
}

const getWinners = (results: PlayerResult[]): PlayerResult[] => {
	if (results.length === 0) return []

	const highestWins = Math.max(...results.map((result) => result.wins))

	const highestWinPlayers = results.filter(
		(result) => result.wins === highestWins,
	)

	const highestPoints = Math.max(
		...highestWinPlayers.map((result) => result.points),
	)

	return highestWinPlayers.filter((result) => result.points === highestPoints)
}

export const LeaderboardView: React.FC<LeaderboardViewProps> = ({ game }) => {
	const currentRows: RoundStat[] = game.players
		.flatMap((player) =>
			game.assignments[player.id].map((assignment) => ({
				gameId: game.gameId,
				round: assignment.round,
				playerId: player.id,
				playerName: player.name,
				character: assignment.character,
				place: game.roundResults[assignment.round]?.[player.id] ?? 0,
			})),
		)
		.filter((row) => row.place > 0)
	const rows = leaderboard(game.players, { rounds: currentRows })
	const winner = getWinners(rows)

	return (
		<>
			<div className="winner-card">
				<Crown size={28} />
				<div>
					<small>WINNER</small>
					<strong>{winner.map((z) => z.player.name).join(' & ')}</strong>
					<span>
						{winner[0].points} points · {winner[0].wins} win
						{winner[0].wins === 1 ? '' : 's'}
					</span>
				</div>
			</div>
			<div className="leaderboard">
				<div className="leaderboard-header">
					<span>Place</span>
					<span>Player</span>
					<span>Wins</span>
					<span>Points</span>
				</div>
				{rows.map((row, index) => (
					<div className="leaderboard-row" key={row.player.id}>
						<strong>{index + 1}</strong>
						<span>{row.player.name}</span>
						<span>{row.wins}</span>
						<span>{row.points}</span>
					</div>
				))}
			</div>
		</>
	)
}

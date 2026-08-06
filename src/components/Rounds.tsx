import { Trophy, Crown } from 'lucide-react'
import { RefreshButton } from './Button'
import { displayImage, findSetForCharacter } from '../utils/data'
import { rerollAssignment } from '../utils'
import type { Game, GameResult, Player, Villain } from '../types'
import villains from '../../data/villains.json'
import { StepHeader } from './StepHeader'
import { useOverlay } from '../hooks/useOverlay'
import { parseObjective } from '../utils/parseObjective'
import { useGameContext } from '../context'
import { useEffect } from 'react'

interface RoundProps {
	game: Game
	results?: GameResult
	setGame?: (next: Game) => void
}

interface ObjectiveButtonProps {
	onClick: () => void
}

const objectives = villains as Record<string, Villain>

export const TrophyButton: React.FC<ObjectiveButtonProps> = ({ onClick }) => {
	return (
		<button
			className="fixture-button"
			aria-label="Show villain objective"
			onClick={onClick}
		>
			<Trophy size={19} />
		</button>
	)
}

const playersByRoundResult = (
	game: Game,
	round: number,
	results?: GameResult,
): Player[] => {
	if (!results || !results[round]) return game.players

	const roundResults = results[round]

	return [...game.players].sort((a, b) => {
		const aPlace = roundResults[a.id] ?? Number.MAX_SAFE_INTEGER
		const bPlace = roundResults[b.id] ?? Number.MAX_SAFE_INTEGER

		return aPlace - bPlace
	})
}

function getRoundWinner(game: Game, round: number, results?: GameResult) {
	if (!results) return
	const roundResults = results[round]

	if (!roundResults) return undefined

	const winnerId = Object.entries(roundResults).find(
		([_, place]) => place === 1,
	)?.[0]

	const winner = game.players.find((player) => player.id === winnerId)
	return winner ? (
		<span className="rnd-winner">
			<Crown size={16} />
			{winner.name}
		</span>
	) : null
}

export const Rounds: React.FC<RoundProps> = ({ game, results, setGame }) => {
	const { draftOwned } = useGameContext()
	const [overlay, setOverlay, OverlayTray] = useOverlay()

	useEffect(() => {
		if (!results) return

		const currentRound = Math.max(0, ...Object.keys(results).map(Number)) + 1
		const roundContainer = document.getElementById(`round${currentRound}`)
		if (!roundContainer) return
		roundContainer.scrollIntoView({ behavior: 'smooth' })
	}, [results])

	return (
		<div className="draw-rounds">
			{Array.from({ length: game.rounds }, (_, i) => i + 1).map((round) => (
				<div
					id={`round${round}`}
					className={`round-block ${results && results[round] ? 'opacity50' : ''} `}
					key={round}
				>
					<div className="round-title">
						<span>Round {round}</span>
						{getRoundWinner(game, round, results)}
					</div>
					<div className="draw-table">
						{playersByRoundResult(game, round, results).map((player, pi) => {
							const assignment = game.assignments[player.id].find(
								(a) => a.round === round,
							)
							const canRefresh = !game.refreshUsed[player.id]
							const img = assignment
								? displayImage(assignment.character, true)
								: undefined

							return (
								<div className="draw-row" key={player.id}>
									<span className="player-name">{player.name}</span>
									<span className="character-cell">
										{img?.local && (
											<img
												src={img.local}
												alt=""
												onError={(e) => {
													if (img.remote) e.currentTarget.src = img.remote
												}}
											/>
										)}

										<div className="character-info">
											<strong>{assignment?.character}</strong>
											<small>
												{assignment
													? findSetForCharacter(assignment?.character)
													: '-'}
											</small>
										</div>
									</span>
									{setGame ? (
										<RefreshButton
											disabled={!canRefresh}
											onClick={() => {
												const next = rerollAssignment(
													game,
													player.id,
													round,
													draftOwned,
												)
												setGame(next)
											}}
										/>
									) : (
										<TrophyButton
											onClick={() => setOverlay(assignment?.character!)}
										/>
									)}
								</div>
							)
						})}
					</div>
				</div>
			))}
			<OverlayTray height={60}>
				<StepHeader step="Objective" title={overlay} />
				<small
					style={{
						whiteSpace: 'pre-line',
						overflow: 'auto',
						height: 'calc(100% - 1rem - 54px)',
						display: 'block',
					}}
				>
					{overlay && (
						<div className="objective-text">
							{parseObjective(objectives[overlay].objective)}
						</div>
					)}
				</small>
			</OverlayTray>
		</div>
	)
}

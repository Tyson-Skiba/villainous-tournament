import { Trophy } from 'lucide-react'
import { CloseButton, RefreshButton } from '../components'
import { displayImage, findSetForCharacter } from '../data'
import { rerollAssignment } from '../utils'
import { useCallback, useState } from 'react'

import type { Game, Villain } from '../types'

import villains from '../../data/villains.json'
import { StepHeader } from './StepHeader'
import { useOverlay } from '../hooks/useOverlay'

interface RoundProps {
	game: Game
	draftOwned: string[]
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

export const Rounds: React.FC<RoundProps> = ({ game, draftOwned, setGame }) => {
	const [overlay, setOverlay, Overlay] = useOverlay()

	return (
		<div className="draw-rounds">
			{Array.from({ length: game.rounds }, (_, i) => i + 1).map((round) => (
				<div className="round-block" key={round}>
					<div className="round-title">Round {round}</div>
					<div className="draw-table">
						{game.players.map((player) => {
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
									{/* TODO: Objectives here */}
								</div>
							)
						})}
					</div>
				</div>
			))}
			<Overlay height={60}>
				<StepHeader step="Objective" title={overlay} />
				<small
					style={{
						whiteSpace: 'pre-line',
						overflow: 'auto',
						height: 'calc(100% - 1rem - 54px)',
						display: 'block',
					}}
				>
					{overlay && objectives[overlay].objective}
				</small>
			</Overlay>
		</div>
	)
}

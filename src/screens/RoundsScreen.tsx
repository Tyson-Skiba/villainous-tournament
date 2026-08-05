import { StepHeader, Button } from '../components'
import { useAppContext, useGameContext } from '../context'
import { displayImage } from '../utils/data'
import { ordinal } from '../utils'

interface RoundsScreenProps {}

export const RoundsScreen: React.FC<RoundsScreenProps> = () => {
	const { app, commit, setScreen } = useAppContext()
	const {
		game,
		placements,
		currentRound,
		placeDraft,
		setGame,
		setPlacements,
		setPlaceDraft,
	} = useGameContext()

	const submitRound = () => {
		if (!game) return

		const results = {
			...game.roundResults,
			[currentRound]: placeDraft,
		}

		if (currentRound < game.rounds) {
			setGame({
				...game,
				roundResults: results,
				currentRound: currentRound + 1,
			})

			setPlacements([])
			setPlaceDraft({})
			setScreen('rounds')

			return
		}

		const gameRows = game.players
			.flatMap((player) =>
				game.assignments[player.id].map((assignment) => ({
					game: game,
					gameId: game.gameId,
					round: assignment.round,
					playerId: player.id,
					playerName: player.name,
					character: assignment.character,
					place:
						results[assignment.round]?.[player.id] ??
						(assignment.round === currentRound ? placeDraft[player.id] : 0),
				})),
			)
			.filter((r) => r.place > 0)

		commit({
			...app,
			stats: {
				rounds: [...app.stats.rounds, ...gameRows],
			},
		})

		setPlacements([])
		setPlaceDraft({})

		setGame({
			...game,
			roundResults: results,
		})

		setScreen('leaderboard')
	}

	if (!game) return <div>Error: TODO Nice Screen</div>

	return (
		<section>
			<StepHeader
				step={`04 / ROUND ${currentRound}`}
				title="Round Results"
				subtitle="Tap players in finishing order."
			/>

			<div className="winner-grid">
				{game.players.map((player) => {
					const assignment = game.assignments[player.id].find(
						(a) => a.round === currentRound,
					)

					const img = assignment
						? displayImage(assignment.character, true)
						: undefined

					const place = placements.indexOf(player.id)

					return (
						<button
							key={player.id}
							className={`winner-tile ${place >= 0 ? 'selected' : ''}`}
							onClick={() => {
								setPlacements((current) => {
									if (current.includes(player.id)) {
										return current.filter((id) => id !== player.id)
									}

									return [...current, player.id]
								})
							}}
						>
							{place >= 0 && (
								<div className="placement-badge">{ordinal(place + 1)}</div>
							)}

							{img?.local && (
								<img
									src={img.local}
									alt=""
									onError={(e) => {
										if (img.remote) {
											e.currentTarget.src = img.remote
										}
									}}
								/>
							)}

							<strong>{player.name}</strong>

							<span>{assignment?.character}</span>
						</button>
					)
				})}
			</div>

			<div className="sticky-action">
				<Button
					variant="secondary"
					onClick={() => {
						setScreen('players')
					}}
				>
					Quit
				</Button>
				<Button disabled={placements.length === 0} onClick={submitRound}>
					{currentRound === game.rounds ? 'Finish Tournament' : 'Next Round'}
				</Button>
			</div>
		</section>
	)
}

import { StepHeader, Counter, Button } from '../components'
import { useAppContext, useGameContext } from '../context'
import { newPlayer } from '../utils/newPlayer'

interface PlayerScreenProps {}

export const PlayerScreen: React.FC<PlayerScreenProps> = () => {
	const { setScreen } = useAppContext()
	const {
		totalCopies,
		draftRounds,
		draftPlayers,
		enoughCharacters,
		enoughCharactersPerRound,
		startGame,
		setDraftRounds,
		setDraftPlayers,
	} = useGameContext()

	return (
		<section>
			<StepHeader
				step="02 / PLAYERS"
				title="Set up the game"
				subtitle="Choose rounds and give everyone a name."
			/>
			<div className="panel">
				<label className="field-label">Rounds</label>
				<Counter
					value={draftRounds}
					min={1}
					max={20}
					onChange={setDraftRounds}
				/>
			</div>

			<div className="players-list">
				{draftPlayers.map((player, index) => (
					<div className="player-row" key={player.id}>
						<div className="player-number">{index + 1}</div>
						<input
							value={player.name}
							aria-label={`Player ${index + 1} name`}
							onChange={(e) =>
								setDraftPlayers((prev) =>
									prev.map((p) =>
										p.id === player.id ? { ...p, name: e.target.value } : p,
									),
								)
							}
							onBlur={(e) => {
								if (!e.target.value.trim())
									setDraftPlayers((prev) =>
										prev.map((p) =>
											p.id === player.id
												? { ...p, name: `Player ${index + 1}` }
												: p,
										),
									)
							}}
						/>
						{draftPlayers.length > 2 && (
							<button
								className="remove-player"
								onClick={() =>
									setDraftPlayers((prev) =>
										prev.filter((p) => p.id !== player.id),
									)
								}
							>
								×
							</button>
						)}
					</div>
				))}
			</div>

			<Button
				variant="secondary"
				icon={<span>+</span>}
				onClick={() =>
					setDraftPlayers((prev) => [...prev, newPlayer(prev.length + 1)])
				}
			>
				Add player
			</Button>

			<div className={`character-capacity ${enoughCharacters ? '' : 'error'}`}>
				{draftPlayers.length} players · {totalCopies} character copies
				{!enoughCharacters && <span>Play count exceeds character count.</span>}
			</div>

			{enoughCharactersPerRound ? null : (
				<div className="character-capacity error">
					<span>Not enough characters to avoid repeats — reduce rounds.</span>
				</div>
			)}

			<div className="sticky-action">
				<Button
					disabled={!enoughCharacters}
					onClick={() => {
						startGame()
						setScreen('tournament')
					}}
				>
					Assign villains
				</Button>
			</div>
		</section>
	)
}

import { SquareArrowOutUpRight } from 'lucide-react'
import { StepHeader, Rounds, Button, Error } from '../components'
import { shareFixture } from '../utils'
import { useAppContext, useGameContext } from '../context'

interface TournamentScreenProps {}

export const TournamentScreen: React.FC<TournamentScreenProps> = () => {
	const { setScreen } = useAppContext()
	const { game, draftOwned, setGame, setPlaceDraft, setPlacements } =
		useGameContext()

	if (!game) return <Error />
	return (
		<section>
			<StepHeader
				step="03 / Tournament"
				title={() => (
					<h1 className="space-between">
						Your villains
						{Boolean(navigator.share) ? (
							<button
								className="icon-button settings-button"
								aria-label="Settings"
								onClick={() => shareFixture(game)}
							>
								<SquareArrowOutUpRight size={20} />
							</button>
						) : null}
					</h1>
				)}
				subtitle="One character per player per round. Each player gets one refresh for the whole game."
			/>
			<Rounds game={game} setGame={setGame} draftOwned={draftOwned} />
			<div className="sticky-action">
				<Button
					variant="secondary"
					onClick={() => {
						setPlaceDraft({})
						setScreen('players')
					}}
				>
					Back
				</Button>
				<Button
					onClick={() => {
						setPlacements([])
						setPlaceDraft({})
						setScreen('rounds')
					}}
				>
					Let's play
				</Button>
			</div>
		</section>
	)
}

import { StepHeader, Button, Error } from '../components'
import { useAppContext, useGameContext } from '../context'
import { newPlayer } from '../utils/newPlayer'
import { LeaderboardView } from '../views'

interface LeaderboardScreenProps {
	setStatsOverlay: (show: boolean) => void
}

export const LeaderboardScreen: React.FC<LeaderboardScreenProps> = ({
	setStatsOverlay,
}) => {
	const { app, setScreen } = useAppContext()
	const { game, setDraftPlayers, setDraftRounds } = useGameContext()

	const playAgain = () => {
		setDraftPlayers(
			app.players.length >= 2 ? app.players : [newPlayer(1), newPlayer(2)],
		)
		setDraftRounds(2)
		setScreen('players')
	}

	if (!game) return <Error />

	return (
		<section>
			<StepHeader
				step="05 / LEADERBOARD"
				title="Game over"
				subtitle="Final standings from all recorded rounds."
			/>
			<LeaderboardView game={game} />
			<div className="action-stack">
				<Button onClick={playAgain}>Play again</Button>
				<Button variant="secondary" onClick={() => setStatsOverlay(true)}>
					Show stats
				</Button>
			</div>
		</section>
	)
}

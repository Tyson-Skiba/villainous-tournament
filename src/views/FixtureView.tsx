import { useEffect, useMemo, useState } from 'react'
import { nativeDecompress } from '../utils/strings'
import { Game, GameResult } from '../types'
import { Rounds } from '../components/Rounds'
import { StepHeader } from '../components/StepHeader'
import { LoadingScreen } from '../screens'
import { useAppContext } from '../context'
import { LeaderboardView } from './LeaderboardView'

interface FixtureViewProps {
	fixture: string
}

export const FixtureView: React.FC<FixtureViewProps> = ({ fixture }) => {
	const { activeLobby, lobbies } = useAppContext()
	const [lobbyGame, setLobbyGame] = useState<Game>()
	const [results, setResults] = useState<GameResult>()
	const [game, setGame] = useState<Game | undefined>()

	useEffect(() => {
		nativeDecompress(fixture).then((raw) => {
			const gameBlob = JSON.parse(raw)
			setGame(gameBlob as Game)
		})
	}, [fixture])

	useEffect(() => {
		if (!activeLobby) return
		return lobbies.waitForUpdates(activeLobby, (lobby) => {
			if (lobby.results) setResults(lobby.results)
			if (lobby.game) setLobbyGame(lobby.game)
		})
	}, [activeLobby])

	if (!game) return <LoadingScreen />

	if (lobbyGame)
		return (
			<div className="screen">
				<LeaderboardView game={lobbyGame} />
			</div>
		)

	return (
		<div className="screen">
			<StepHeader
				step="Tournament"
				title="Your villains"
				subtitle="One character per player per round. Click the trophy to see the villain objectives"
			/>
			<Rounds game={game} results={results} />
		</div>
	)
}

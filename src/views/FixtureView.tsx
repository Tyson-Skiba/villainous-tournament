import { useEffect, useMemo, useState } from 'react'
import { nativeDecompress } from '../utils/strings'
import { Game, GameResult } from '../types'
import { Rounds } from '../components/Rounds'
import { StepHeader } from '../components/StepHeader'
import { LoadingScreen } from '../screens'
import { useAppContext } from '../context'

interface FixtureViewProps {
	fixture: string
}

export const FixtureView: React.FC<FixtureViewProps> = ({ fixture }) => {
	const { activeLobby, lobbies } = useAppContext()
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
		})
	}, [activeLobby])

	if (!game) return <LoadingScreen />

	// TODO: On final update show leaderboard

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

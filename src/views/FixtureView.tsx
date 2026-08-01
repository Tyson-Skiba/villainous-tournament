import { useEffect, useMemo, useState } from 'react'
import { nativeDecompress } from '../utils/strings'
import { Game } from '../types'
import { Rounds } from '../components/Rounds'
import { StepHeader } from '../components/StepHeader'

interface FixtureViewProps {
	fixture: string
	draftOwned: string[]
}

export const FixtureView: React.FC<FixtureViewProps> = ({
	fixture,
	draftOwned,
}) => {
	const [game, setGame] = useState<Game | undefined>()

	useEffect(() => {
		nativeDecompress(fixture).then((raw) => {
			const gameBlob = JSON.parse(raw)
			setGame(gameBlob as Game)
		})
	}, [fixture])

	if (!game) return <div>Loading</div>

	return (
		<div className="screen">
			<StepHeader
				step="Tournament"
				title="Your villains"
				subtitle="One character per player per round. Click the trophy to see the villain objectives"
			/>
			<Rounds game={game} draftOwned={draftOwned} />
		</div>
	)
}

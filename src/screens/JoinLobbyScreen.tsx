import { useMemo, useRef, useState } from 'react'
import { StepHeader, Button } from '../components'
import { useAppContext } from '../context'
import { useSearchParams } from '../hooks/useUrlParams'
import { FixtureView } from '../views'

interface JoinLobbyScreenProps {}

type Views = 'registration' | 'waiting' | 'fixture'

export const JoinLobbyScreen: React.FC<JoinLobbyScreenProps> = () => {
	const { lobbies, setLobby } = useAppContext()
	const fixture = useRef<string>('')
	const [searchParams] = useSearchParams()
	const [name, setName] = useState('')
	const [currentView, setView] = useState<Views>('registration')

	const lobbyCode = useMemo(() => searchParams.get('join'), [])

	if (currentView === 'fixture')
		return <FixtureView fixture={fixture.current} />

	// TODO: Show code input screen if code is null

	return (
		<div className="screen">
			<StepHeader
				step="Welcome"
				title="Please enter your name"
				subtitle="Once everyone is ready the host will start the game"
			/>

			<input
				className="field"
				placeholder="Oogie Boogie"
				value={name}
				onChange={(e) => setName(e.target.value)}
			/>

			<div className="sticky-action">
				<Button
					variant={currentView === 'waiting' ? 'ghost' : 'primary'}
					disabled={!lobbyCode || !name || currentView === 'waiting'}
					onClick={async () => {
						if (!lobbyCode || !name) return

						setView('waiting')
						await lobbies.joinLobby(lobbyCode, name)
						await lobbies.waitForGameToStart(lobbyCode, (gameFixture) => {
							fixture.current = gameFixture
							setLobby(lobbyCode)
							setView('fixture')
						})
					}}
				>
					{currentView === 'waiting'
						? 'Waiting for game to start'
						: 'I am ready'}
				</Button>
			</div>
		</div>
	)
}

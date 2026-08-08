import { useRef, useState } from 'react'
import { StepHeader, Button, CodeInput } from '../components'
import { useAppContext, useRouter } from '../context'
import { FixtureView } from '../views'

interface JoinLobbyScreenProps {}

type Views = 'registration' | 'waiting' | 'fixture'

export const JoinLobbyScreen: React.FC<JoinLobbyScreenProps> = () => {
	const { lobbies, setLobby } = useAppContext()
	const { isLobbyRoute, params } = useRouter()
	const fixture = useRef<string>('')
	const [name, setName] = useState('')
	const [currentView, setView] = useState<Views>('registration')

	const [lobbyCode, setLobbyCode] = useState(
		isLobbyRoute && params.code ? params.code : '',
	)

	if (currentView === 'fixture')
		return <FixtureView fixture={fixture.current} />

	return (
		<div className="screen">
			<StepHeader step="Welcome" title="Join a game" />

			<CodeInput initialValue={lobbyCode} onChange={setLobbyCode} />

			<input
				className="field"
				placeholder="What should we call you?"
				value={name}
				onChange={(e) => setName(e.target.value)}
				style={{ marginTop: '2rem' }}
			/>

			<p className="subtitle">
				Once everyone is ready the host will start the game
			</p>

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

import { useEffect, useRef, useState } from 'react'
import { StepHeader, Button, CodeInput } from '../components'
import { useAppContext, useRouter } from '../context'
import { FixtureView } from '../views'
import { getLobbyUsername, saveLobbyUsername } from '../storage'

interface JoinLobbyScreenProps {}

type Views = 'registration' | 'waiting' | 'fixture'

export const JoinLobbyScreen: React.FC<JoinLobbyScreenProps> = () => {
	const fixture = useRef<string>('')
	const unsubscribe = useRef<(() => void) | undefined>()
	const { lobbies, setLobby } = useAppContext()
	const { isLobbyRoute, params } = useRouter()
	const [name, setName] = useState(getLobbyUsername())
	const [currentView, setView] = useState<Views>('registration')

	//useEffect(() => () => unsubscribe.current?.())

	const [lobbyCode, setLobbyCode] = useState(
		isLobbyRoute && params.code ? params.code : '',
	)

	if (currentView === 'fixture')
		return (
			<FixtureView fixture={fixture.current}>
				<div className="sticky-action">
					<Button
						onClick={() => {
							setLobbyCode('')
							setLobby(undefined)
							setView('registration')
						}}
					>
						Play again
					</Button>
				</div>
			</FixtureView>
		)

	return (
		<div className="screen">
			<StepHeader step="Welcome" title="Join a game" />

			<CodeInput initialValue={lobbyCode} onChange={setLobbyCode} />

			<input
				className="field"
				placeholder="What should we call you?"
				value={name}
				onChange={(e) => {
					setName(e.target.value)
					saveLobbyUsername(e.target.value)
				}}
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
						unsubscribe.current = await lobbies.waitForGameToStart(
							lobbyCode,
							(gameFixture) => {
								fixture.current = gameFixture
								setLobby(lobbyCode)
								setView('fixture')
							},
						)

						//unsubscribe.current?.()
					}}
				>
					{currentView === 'waiting' ? (
						<div>
							Waiting for game to start,{' '}
							<span
								className="link"
								onClick={() => {
									//unsubscribe.current?.()
									//unsubscribe.current = undefined
									setView('registration')
								}}
							>
								cancel
							</span>
						</div>
					) : (
						'I am ready'
					)}
				</Button>
			</div>
		</div>
	)
}

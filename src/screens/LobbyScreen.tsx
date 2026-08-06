import { useEffect, useState } from 'react'
import { StepHeader, Button, Counter } from '../components'
import { useAppContext, useGameContext } from '../context'
import { shareLobby } from '../utils'
import { SquareArrowOutUpRight } from 'lucide-react'
import { nativeCompress } from '../utils/strings'

interface LobbyScreenProps {}

const playerId = crypto.randomUUID()

export const LobbyScreen: React.FC<LobbyScreenProps> = () => {
	const [name, setName] = useState('')
	const { lobbies, setScreen, setLobby } = useAppContext()
	const {
		game,
		totalCopies,
		draftRounds,
		draftPlayers,
		startGame,
		setDraftRounds,
		setDraftPlayers,
	} = useGameContext()
	const [lobbyCode, setLobbyCode] = useState('----')

	useEffect(() => {
		let unsubscribe: (() => void) | undefined
		;(async () => {
			const code = await lobbies.createLobby()
			setLobbyCode(code)
			unsubscribe = lobbies.subscribe(code, (players) => {
				setDraftPlayers((currentPlayers) => {
					const host = currentPlayers.find(({ id }) => id === playerId)

					return host ? [host, ...players] : players
				})
			})
		})()

		return unsubscribe
	}, [])

	return (
		<section>
			<StepHeader
				step="LOBBIES"
				title={() => (
					<h1 className="space-between">
						Invite Players
						<button
							className="icon-button settings-button"
							aria-label="Settings"
							onClick={() => shareLobby(lobbyCode)}
						>
							<SquareArrowOutUpRight size={20} />
						</button>
					</h1>
				)}
				subtitle={`Share this code: ${lobbyCode}`}
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

			<input
				className="field"
				placeholder="Your name"
				value={name}
				onChange={(e) => {
					setName(e.target.value)
					setDraftPlayers((players) =>
						players.find(({ id }) => id === playerId)
							? players.map((player) => {
									if (player.id !== playerId) return player
									player.name = e.target.value

									return player
								})
							: [{ name: e.target.value, id: playerId }, ...players],
					)
				}}
			/>

			<div className="round-block">
				<div className="round-title">Players</div>
				{draftPlayers.map((player, index) => (
					<div className="draw-row" key={player.id}>
						{player.name}
					</div>
				))}
			</div>
			<div className="sticky-action">
				<Button
					variant="secondary"
					onClick={() => {
						setScreen('players')
					}}
				>
					Cancel
				</Button>
				<Button
					disabled={!draftPlayers.length || !name}
					onClick={async () => {
						const thisGame = startGame(false)
						const fixture = await nativeCompress(JSON.stringify(thisGame))
						await lobbies.startGame(lobbyCode, fixture)

						setLobby(lobbyCode)
						lobbies.clearLobby().createLobby()
						setScreen('tournament')
					}}
				>
					Start
				</Button>
			</div>
		</section>
	)
}

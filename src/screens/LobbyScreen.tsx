import { useEffect, useState } from 'react'
import { StepHeader, Button, Counter } from '../components'
import { useAppContext, useGameContext } from '../context'
import { shareLobby, nativeCompress } from '../utils'
import { SquareArrowOutUpRight } from 'lucide-react'
import { getLobbyUsername, saveLobbyUsername } from '../storage'

interface LobbyScreenProps {}

const playerId = crypto.randomUUID()

export const LobbyScreen: React.FC<LobbyScreenProps> = () => {
	const [name, setName] = useState(getLobbyUsername(true))
	const { lobbies, setScreen, setLobby } = useAppContext()
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
	const [lobbyCode, setLobbyCode] = useState('----')

	useEffect(() => {
		let unsubscribe: (() => void) | undefined
		let cancelled = false

		void (async () => {
			const code = await lobbies.createLobby()
			setLobbyCode(code)
			const cleanup = lobbies.subscribe(code, (players) => {
				setDraftPlayers((currentPlayers) => {
					const host = currentPlayers.find(({ id }) => id === playerId)

					return host ? [host, ...players] : players
				})
			})

			if (cancelled) cleanup()
			else unsubscribe = cleanup
		})()

		return () => {
			;((cancelled = true), unsubscribe?.())
		}
	}, [lobbies])

	useEffect(() => {
		if (!name) return

		addHostToPlayerList(name)
	}, [])

	const addHostToPlayerList = (hostName: string) => {
		setDraftPlayers((players) =>
			players.find(({ id }) => id === playerId)
				? players.map((player) => {
						if (player.id !== playerId) return player
						player.name = hostName

						return player
					})
				: [{ name: hostName, id: playerId }, ...players],
		)
	}

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
					saveLobbyUsername(e.target.value, true)

					addHostToPlayerList(e.target.value)
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
					variant="secondary"
					onClick={() => {
						setScreen('players')
					}}
				>
					Cancel
				</Button>
				<Button
					disabled={
						!draftPlayers.length ||
						!name ||
						!enoughCharacters ||
						!enoughCharactersPerRound
					}
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

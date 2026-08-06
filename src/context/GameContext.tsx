import {
	createContext,
	PropsWithChildren,
	useContext,
	useEffect,
	useMemo,
	useRef,
	useState,
} from 'react'
import { Game, Player } from '../types'
import { useAppContext } from './AppContext'
import { newPlayer } from '../utils/newPlayer'
import { buildAssignments } from '../utils'
import { selectedVillains } from '../utils/data'
import { useAuth } from '../hooks/useAuth'

interface GameProviderProps {
	game?: Game
	draftOwned: string[]
	placements: string[]
	draftRounds: number
	placeDraft: Record<string, number>
	draftPlayers: Player[]
	currentRound: number
	totalCopies: number
	enoughCharacters: boolean
	enoughCharactersPerRound: boolean
	setGame: (game: React.SetStateAction<Game | undefined>) => void
	startGame: (allowCommit?: boolean) => Game
	setDraftOwned: (owned: React.SetStateAction<string[]>) => void
	setDraftPlayers: (players: React.SetStateAction<Player[]>) => void
	setDraftRounds: (rounds: React.SetStateAction<number>) => void
	setPlaceDraft: (draft: React.SetStateAction<Record<string, number>>) => void
	setPlacements: (placements: React.SetStateAction<string[]>) => void
}

const GameContext = createContext<GameProviderProps>({
	draftOwned: [],
	placements: [],
	draftRounds: 0,
	placeDraft: {},
	draftPlayers: [],
	currentRound: 0,
	totalCopies: 0,
	enoughCharacters: true,
	enoughCharactersPerRound: true,
	setGame: () => null,
	startGame: () => ({}) as unknown as Game,
	setDraftOwned: () => null,
	setDraftPlayers: () => null,
	setDraftRounds: () => null,
	setPlaceDraft: () => null,
	setPlacements: () => null,
})

export const GameProvider: React.FC<PropsWithChildren> = ({ children }) => {
	const { user } = useAuth()
	const { app, commit } = useAppContext()

	const [game, setGame] = useState<Game | undefined>()
	const [draftOwned, setDraftOwned] = useState<string[]>(app.ownedSetIds)
	const [draftRounds, setDraftRounds] = useState(app.rounds || 2)
	const [placeDraft, setPlaceDraft] = useState<Record<string, number>>({})
	const [placements, setPlacements] = useState<string[]>([])
	const [draftPlayers, setDraftPlayers] = useState<Player[]>(
		app.players.length >= 2 ? app.players : [newPlayer(1), newPlayer(2)],
	)

	const prevUserRef = useRef(user)
	useEffect(() => {
		if (!app?.ownedSetIds?.length) return

		const prevUser = prevUserRef.current
		prevUserRef.current = user

		if (!prevUser && user) {
			setDraftOwned(app.ownedSetIds)
			setDraftPlayers(app.players)
			setDraftRounds(app.rounds)
		}
	}, [user, app?.ownedSetIds])

	useEffect(() => {
		if (!game) return

		const draft: Record<string, number> = {}

		placements.forEach((playerId, index) => {
			draft[playerId] = index + 1
		})

		game.players.forEach((player) => {
			if (!(player.id in draft)) {
				draft[player.id] = placements.length + 1
			}
		})

		setPlaceDraft(draft)
	}, [placements, game])

	const totalCopies = useMemo(
		() => selectedVillains(draftOwned).length,
		[draftOwned],
	)

	const enoughCharacters =
		draftPlayers.length <= totalCopies &&
		draftPlayers.every((p) => p.name.trim())
	const currentRound = game?.currentRound ?? 1
	const enoughCharactersPerRound = true // validateRounds(draftRounds, totalCopies);

	const startGame = (allowCommit = true) => {
		//if (!enoughCharacters) return
		const assignments = buildAssignments(draftPlayers, draftRounds, draftOwned)
		const nextGame: Game = {
			gameId: crypto.randomUUID(),
			rounds: draftRounds,
			players: draftPlayers.map((p) => ({
				...p,
				name: p.name.trim(),
			})),
			assignments,
			refreshUsed: Object.fromEntries(draftPlayers.map((p) => [p.id, false])),
			roundResults: {},
			currentRound: 1,
		}

		if (allowCommit)
			commit({ ...app, players: nextGame.players, rounds: draftRounds })
		setGame(nextGame)
		setPlacements([])
		setPlaceDraft({})

		return nextGame
	}

	return (
		<GameContext.Provider
			value={{
				game,
				placements,
				draftRounds,
				placeDraft,
				draftPlayers,
				draftOwned,
				totalCopies,
				currentRound,
				enoughCharacters,
				enoughCharactersPerRound,
				setGame,
				startGame,
				setDraftRounds,
				setPlaceDraft,
				setPlacements,
				setDraftOwned,
				setDraftPlayers,
			}}
		>
			{children}
		</GameContext.Provider>
	)
}

export const useGameContext = () => useContext(GameContext)

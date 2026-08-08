import {
	CollectionView,
	FixtureView,
	LoginView,
	StatsView,
	VillainsView,
} from './views'
import { CloseButton, StepHeader, NavBar } from './components'
import {
	JoinLobbyScreen,
	LeaderboardScreen,
	LoadingScreen,
	LobbyScreen,
	OwnedSetScreen,
	PlayerScreen,
	RoundsScreen,
	StatsScreen,
	TournamentScreen,
} from './screens'
import { useAppContext, useGameContext, useRouter } from './context'
import { useAntiFlicker } from './hooks'

const App = () => {
	const { game } = useGameContext()
	const { screen, overlay, setOverlay } = useAppContext()
	const { params, isLobbyRoute, isFixtureRoute } = useRouter()
	const render = useAntiFlicker(1000)

	if (isFixtureRoute) return <FixtureView fixture={params.fixture} />
	if (isLobbyRoute) return <JoinLobbyScreen />
	if (!render) return <LoadingScreen />

	return (
		<div className="app-shell">
			<NavBar />

			<main className="screen">
				{screen === 'owned-sets' && <OwnedSetScreen />}
				{screen === 'players' && <PlayerScreen />}
				{screen === 'tournament' && game && <TournamentScreen />}
				{screen === 'rounds' && game && <RoundsScreen />}
				{screen === 'leaderboard' && game && (
					<LeaderboardScreen setStatsOverlay={() => setOverlay('stats')} />
				)}

				{screen === 'stats' && <StatsScreen />}
				{screen === 'lobby' && <LobbyScreen />}
			</main>

			{overlay === 'stats' && (
				<div className="overlay" role="dialog" aria-modal="true">
					<div className="drawer">
						<CloseButton onClick={() => setOverlay(undefined)} />
						<StepHeader step="STATS" title="The evil ledger" />
						<StatsView />
					</div>
				</div>
			)}

			{overlay === 'villains' && (
				<div className="overlay" role="dialog" aria-modal="true">
					<div className="drawer large">
						<CloseButton onClick={() => setOverlay(undefined)} />

						<StepHeader
							step="VILLAINS"
							title="Villains"
							subtitle="Browse every villain and their objective."
						/>

						<VillainsView />
					</div>
				</div>
			)}

			{overlay === 'collection' && <CollectionView />}
			{overlay === 'login' && <LoginView />}
		</div>
	)
}

export default App

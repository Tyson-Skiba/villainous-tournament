import { useSearchParams } from './hooks/useUrlParams'
import {
	CollectionView,
	FixtureView,
	LoginView,
	StatsView,
	VillainsView,
} from './views'
import { CloseButton, StepHeader, NavBar } from './components'
import {
	LeaderboardScreen,
	LoadingScreen,
	OwnedSetScreen,
	PlayerScreen,
	RoundsScreen,
	StatsScreen,
	TournamentScreen,
} from './screens'
import { useAppContext, useGameContext } from './context'
import { useAntiFlicker } from './hooks/useAntiFlicker'

const App = () => {
	const { screen, overlay, setOverlay } = useAppContext()
	const { game, draftOwned } = useGameContext()
	const [searchParams] = useSearchParams()
	const render = useAntiFlicker(1000)

	if (searchParams.get('fixture'))
		return (
			<FixtureView
				fixture={searchParams.get('fixture')!}
				draftOwned={draftOwned}
			/>
		)

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

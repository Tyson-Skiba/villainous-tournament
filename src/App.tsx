import { useEffect, useMemo, useState } from 'react'
import { displayImage, selectedVillains, villainSets } from './data'
import { buildAssignments, leaderboard, ordinal, shareFixture } from './utils'
import { useSearchParams } from './hooks/useUrlParams'
import { FixtureView, StatsView, VillainsView } from './views'

import type { Game, Player, Screen } from './types'
import { NavBar } from './components/NavBar'
import { Button, CloseButton, SetCard, StepHeader } from './components'
import {
	LeaderboardScreen,
	OwnedSetScreen,
	PlayerScreen,
	RoundsScreen,
	StatsScreen,
	TournamentScreen,
} from './screens'
import { useAppContext, useGameContext } from './context'

const App = () => {
	const { app, screen, commit, toggleTheme } = useAppContext()
	const { game, draftOwned, setDraftOwned } = useGameContext()

	const [statsOverlay, setStatsOverlay] = useState(false)
	const [collectionOverlay, setCollectionOverlay] = useState(false)

	const [villainsOverlay, setVillainsOverlay] = useState(false)
	const [searchParams] = useSearchParams()

	if (searchParams.get('fixture'))
		return (
			<FixtureView
				fixture={searchParams.get('fixture')!}
				draftOwned={draftOwned}
			/>
		)

	return (
		<div className="app-shell">
			<NavBar
				onSettings={() => setCollectionOverlay(true)}
				onStats={() => setStatsOverlay(true)}
				onVillains={() => setVillainsOverlay(true)}
				theme={app.theme}
				onTheme={toggleTheme}
			/>

			<main className="screen">
				{screen === 'owned-sets' && <OwnedSetScreen />}
				{screen === 'players' && <PlayerScreen />}
				{screen === 'tournament' && game && <TournamentScreen />}
				{screen === 'rounds' && game && <RoundsScreen />}
				{screen === 'leaderboard' && game && (
					<LeaderboardScreen setStatsOverlay={setStatsOverlay} />
				)}

				{screen === 'stats' && <StatsScreen />}
			</main>

			{statsOverlay && (
				<div className="overlay" role="dialog" aria-modal="true">
					<div className="drawer">
						<CloseButton onClick={() => setStatsOverlay(false)} />
						<StepHeader step="STATS" title="The evil ledger" />
						<StatsView />
					</div>
				</div>
			)}

			{villainsOverlay && (
				<div className="overlay" role="dialog" aria-modal="true">
					<div className="drawer large">
						<CloseButton onClick={() => setVillainsOverlay(false)} />

						<StepHeader
							step="VILLAINS"
							title="Villains"
							subtitle="Browse every villain and their objective."
						/>

						<VillainsView />
					</div>
				</div>
			)}

			{collectionOverlay && (
				<div className="overlay" role="dialog" aria-modal="true">
					<div className="drawer large">
						<CloseButton onClick={() => setCollectionOverlay(false)} />

						<StepHeader
							step="COLLECTION"
							title="My Collection"
							subtitle="Select every Villainous box you own."
						/>

						<div className="set-grid">
							{villainSets.map((set) => (
								<SetCard
									key={set.id}
									name={set.name}
									year={set.year}
									image={displayImage(set.id)}
									selected={draftOwned.includes(set.id)}
									onClick={() =>
										setDraftOwned((prev) =>
											prev.includes(set.id)
												? prev.filter((id) => id !== set.id)
												: [...prev, set.id],
										)
									}
								/>
							))}
						</div>

						<div className="sticky-action">
							<div className="selection-summary">
								{selectedVillains(draftOwned).length} character copies available
							</div>

							<Button
								onClick={() => {
									commit({
										...app,
										ownedSetIds: draftOwned,
									})

									setCollectionOverlay(false)
								}}
							>
								Save Collection
							</Button>
						</div>
					</div>
				</div>
			)}
		</div>
	)
}

export default App

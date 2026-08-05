import { Trophy, Swords, Crown } from 'lucide-react'
import { useState } from 'react'
import { displayImage } from '../utils/data'
import { leaderboard, characterLeaderboard, characterMatchups } from '../utils'
import { StepHeader } from '../components'
import { useOverlay } from '../hooks/useOverlay'
import { useAppContext } from '../context'

interface StatsViewProps {}

const EmptyStats = () => (
	<div className="empty-state">
		<Trophy size={30} />
		<p>No stats yet. Finish a game and they will appear here.</p>
	</div>
)

export const StatsView: React.FC<StatsViewProps> = () => {
	const { app, statsMode, setStatsMode } = useAppContext()
	const playerRows = leaderboard(app.players, app.stats)
	const characterRows = characterLeaderboard(app.stats.rounds)

	const [overlay, setOverlay, Overlay] = useOverlay()

	const [selectedCharacter, setSelectedCharacter] = useState<string | null>(
		characterRows[0]?.character ?? null,
	)

	const matchups = selectedCharacter
		? characterMatchups(app.stats.rounds, selectedCharacter)
		: []

	return (
		<div className="stats-view">
			<div className="segmented">
				<button
					className={statsMode === 'player' ? 'active' : ''}
					onClick={() => setStatsMode('player')}
				>
					Player
				</button>

				<button
					className={statsMode === 'character' ? 'active' : ''}
					onClick={() => setStatsMode('character')}
				>
					Character
				</button>
			</div>

			{statsMode === 'player' ? (
				<div className="stats-list">
					{playerRows.length ? (
						playerRows.map((row, i) => (
							<div className="stat-row" key={row.player.id}>
								<strong>{i + 1}</strong>

								<span>{row.player.name}</span>

								<b>
									{row.wins} win
									{row.wins === 1 ? '' : 's'}
								</b>

								<small>{row.points} pts</small>
							</div>
						))
					) : (
						<EmptyStats />
					)}
				</div>
			) : (
				<>
					{/* Overview cards */}
					{/*
          <div className="analytics-grid">

            <div className="analytics-card">
              <div className="analytics-icon">
                <Trophy size={18} />
              </div>

              <small>MOST WINS</small>

              <strong>
                {characterRows[0]?.character ?? '—'}
              </strong>

              <span>
                {characterRows[0]?.wins ?? 0} wins
              </span>
            </div>

            <div className="analytics-card">
              <div className="analytics-icon">
                <Flame size={18} />
              </div>

              <small>MOST SELECTED</small>

              <strong>
                {mostSelected[0]?.character ?? '—'}
              </strong>

              <span>
                {mostSelected[0]?.appearances ?? 0} appearances
              </span>
            </div>

            <div className="analytics-card">
              <div className="analytics-icon">
                <Target size={18} />
              </div>

              <small>BEST ALL-ROUNDER</small>

              <strong>
                {allRounders[0]?.character ?? '—'}
              </strong>

              <span>
                {allRounders[0]
                  ? `${Math.round(
                      allRounders[0].matchupScore * 100
                    )}% matchup score`
                  : 'Need 3 appearances'}
              </span>
            </div>

          </div>
          */}

					{/* Character performance */}
					<div>
						{characterRows.length ? (
							<div className="stats-list">
								{characterRows.map((row, i) => (
									<button
										className={`stat-row character-stat-row 
                    ${i === 0 ? 'selected-first' : ''} 
                    ${selectedCharacter === row.character && i === characterRows.length - 1 ? 'selected-last' : ''} 
                    ${selectedCharacter === row.character ? 'selected' : ''}`}
										key={row.character}
										onClick={() => {
											setSelectedCharacter(row.character)
											setOverlay(row.character)
										}}
									>
										<strong>
											{i === 0 ? (
												<Crown
													size={16}
													style={{ marginLeft: '-4px', color: 'var(--accent)' }}
												/>
											) : (
												i + 1
											)}
										</strong>

										<span className="character-cell">
											<img
												src={displayImage(row.character, true).local}
												alt=""
											/>

											<span>
												{row.character}

												<small>
													{row.appearances} appearances
													{' · '}
													{row.opponents} opponents
												</small>
											</span>
										</span>

										<span className="stat-metric">
											<b>
												{row.wins} win
												{row.wins === 1 ? '' : 's'}
											</b>

											<small style={{ marginTop: '6px' }}>
												{Math.round(row.winRate * 100)}% win rate
											</small>
										</span>

										<span className="stat-metric">
											<b>{row.averagePlace.toFixed(1)}</b>

											<small>avg place</small>
										</span>
									</button>
								))}
							</div>
						) : (
							<EmptyStats />
						)}
					</div>

					{/* All-rounders */}
					{/*}
          <div className="stats-section">

            <div className="stats-section-header">
              <div>
                <small>CONSISTENCY</small>
                <h3>Best all-rounders</h3>
              </div>

              <BarChart3 size={20} />
            </div>

            {allRounders.length ? (
              <div className="all-rounder-list">
                {allRounders.slice(0, 5).map(
                  (row, index) => (
                    <div
                      className="all-rounder-row"
                      key={row.character}
                    >
                      <strong>
                        {index + 1}
                      </strong>

                      <span>
                        {row.character}

                        <small>
                          {row.appearances}{' '}
                          appearances ·{' '}
                          {row.opponents}{' '}
                          opponents
                        </small>
                      </span>

                      <b>
                        {Math.round(
                          row.matchupScore * 100
                        )}
                        %
                      </b>
                    </div>
                  ),
                )}
              </div>
            ) : (
              <div className="analytics-empty">
                <BarChart3 size={22} />

                <p>
                  A character needs at least 3
                  appearances before it can rank
                  as an all-rounder.
                </p>
              </div>
            )}

          </div>
          */}
				</>
			)}

			<Overlay height={80}>
				<StepHeader
					step="WIN STATISTICS"
					title={() => (
						<h1 className="flex row">
							<span className="character-cell">
								<img src={displayImage(overlay, true).local} alt="" />
							</span>
							{overlay}
						</h1>
					)}
				/>
				<div className="stats-island">
					<div className="stats-section-header">
						<div>
							<small>HEAD TO HEAD</small>
							<h3>{overlay} matchups</h3>
						</div>

						<Swords size={20} />
					</div>

					{matchups.length ? (
						<div className="matchup-list">
							{matchups.map((matchup) => (
								<div className="matchup-row" key={matchup.opponent}>
									<span>
										<strong>{matchup.opponent}</strong>

										<small>
											{matchup.wins}W · {matchup.ties}T · {matchup.losses}L
										</small>
									</span>

									<span className="matchup-result">
										<strong>{Math.round(matchup.winRate * 100)}%</strong>

										<small>
											{matchup.games} encounter
											{matchup.games === 1 ? '' : 's'}
										</small>
									</span>
								</div>
							))}
						</div>
					) : (
						<div className="analytics-empty">
							<Swords size={22} />

							<p>Not enough historical game data to calculate matchups yet.</p>
						</div>
					)}
				</div>
			</Overlay>
		</div>
	)
}

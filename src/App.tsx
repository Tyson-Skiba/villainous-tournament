import { useEffect, useMemo, useState } from 'react'
import { Check, Crown, Trophy } from 'lucide-react'
import { assetMap, displayImage, findSetForCharacter, selectedVillains, villainCounts, villainSets } from './data'
import { Button, CloseButton, Counter, NavBar, PrimaryButton, SecondaryButton, RefreshButton, SetCard, StepHeader } from './components'
import { buildAssignments, characterLeaderboard, leaderboard, ordinal, rerollAssignment, validateRounds } from './utils'
import { loadApp, saveApp } from './storage'
import { VillainsView } from './VillainsView'
import type { Game, Player, RoundStat, Screen, StoredStats } from './types'
import villainObjectives from '../data/villains.json'

function newPlayer(index: number): Player {
  return { id: crypto.randomUUID(), name: `Player ${index}` }
}

export default function App() {
  const [app, setApp] = useState(loadApp)
  const [screen, setScreen] = useState<Screen>(() => app.ownedSetIds.length ? 2 : 1)
  const [statsOverlay, setStatsOverlay] = useState(false)
  const [collectionOverlay, setCollectionOverlay] = useState(false)
  const [statsMode, setStatsMode] = useState<'player' | 'character'>('player')
  const [game, setGame] = useState<Game | null>(null)
  const [draftOwned, setDraftOwned] = useState<string[]>(app.ownedSetIds)
  const [draftPlayers, setDraftPlayers] = useState<Player[]>(app.players.length >= 2 ? app.players : [newPlayer(1), newPlayer(2)])
  const [draftRounds, setDraftRounds] = useState(app.rounds || 2)
  const [placeDraft, setPlaceDraft] = useState<Record<string, number>>({})
  const [placements, setPlacements] = useState<string[]>([])
  const [villainsOverlay, setVillainsOverlay] = useState(false)

  useEffect(() => {
    document.documentElement.dataset.theme = app.theme
  }, [app.theme])

  const commit = (next: typeof app) => {
    setApp(next)
    saveApp(next)
  }

  useEffect(() => {
    if (!game) return

    const draft: Record<string, number> = {}

    placements.forEach((playerId, index) => {
      draft[playerId] = index + 1
    })

    game.players.forEach(player => {
      if (!(player.id in draft)) {
        draft[player.id] = placements.length + 1
      }
    })

    setPlaceDraft(draft)
  }, [placements, game])

  const totalCopies = useMemo(() => selectedVillains(draftOwned).length, [draftOwned])
  const enoughCharacters = draftPlayers.length <= totalCopies && draftPlayers.every(p => p.name.trim())
  const currentRound = game?.currentRound ?? 1
  const enoughCharactersPerRound = true; // validateRounds(draftRounds, totalCopies);

  function saveSets() {
    commit({ ...app, ownedSetIds: draftOwned })
    setScreen(2)
  }

  function startGame() {
    if (!enoughCharacters) return
    const assignments = buildAssignments(draftPlayers, draftRounds, draftOwned)
    const nextGame: Game = {
      rounds: draftRounds,
      players: draftPlayers.map(p => ({ ...p, name: p.name.trim() })),
      assignments,
      refreshUsed: Object.fromEntries(draftPlayers.map(p => [p.id, false])),
      roundResults: {},
      currentRound: 1,
    }
    commit({ ...app, players: nextGame.players, rounds: draftRounds })
    setGame(nextGame)
    setPlacements([])
    setPlaceDraft({})
    setScreen(3)
  }

  function submitRound() {
    if (!game) return

    const results = {
      ...game.roundResults,
      [currentRound]: placeDraft,
    }

    if (currentRound < game.rounds) {
      setGame({
        ...game,
        roundResults: results,
        currentRound: currentRound + 1,
      })

      setPlacements([])
      setPlaceDraft({})
      setScreen(4)

      return
    }

    const gameRows = game.players.flatMap(player =>
      game.assignments[player.id].map(assignment => ({
        round: assignment.round,
        playerId: player.id,
        playerName: player.name,
        character: assignment.character,
        place:
          results[assignment.round]?.[player.id] ??
          (assignment.round === currentRound
            ? placeDraft[player.id]
            : 0),
      }))
    ).filter(r => r.place > 0)

    commit({
      ...app,
      stats: {
        rounds: [...app.stats.rounds, ...gameRows],
      },
    })

    setPlacements([])
    setPlaceDraft({})

    setGame({
      ...game,
      roundResults: results,
    })

    setScreen(5)
  }

  function goSettings() {
    setDraftOwned(app.ownedSetIds)
    setDraftPlayers(app.players.length >= 2 ? app.players : [newPlayer(1), newPlayer(2)])
    setDraftRounds(app.rounds || 2)
    setScreen(1)
    setStatsOverlay(false)
  }

  function playAgain() {
    setDraftPlayers(app.players.length >= 2 ? app.players : [newPlayer(1), newPlayer(2)])
    setDraftRounds(2)
    setScreen(2)
  }

  function toggleTheme() {
    commit({ ...app, theme: app.theme === 'dark' ? 'light' : 'dark' })
  }

  function togglePlacement(playerId: string) {
    setPlacements(current => {
      if (current.includes(playerId)) {
        return current.filter(id => id !== playerId)
      }

      return [...current, playerId]
    })
  }

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
        {screen === 1 && (
          <section>
            <StepHeader step="01 / SETS" title="What do you own?" subtitle="Select every Villainous box you have. Duplicate villains across boxes count as separate copies." />
            <div className="set-grid">
              {villainSets.map(set => (
                <SetCard
                  key={set.id}
                  name={set.name}
                  year={set.year}
                  selected={draftOwned.includes(set.id)}
                  image={displayImage(set.id)}
                  onClick={() => setDraftOwned(prev => prev.includes(set.id) ? prev.filter(id => id !== set.id) : [...prev, set.id])}
                />
              ))}
            </div>
            <div className="sticky-action">
              <div className="selection-summary">{selectedVillains(draftOwned).length} character copies available</div>
              <Button disabled={!draftOwned.length} onClick={saveSets}>Save sets</Button>
            </div>
          </section>
        )}

        {screen === 2 && (
          <section>
            <StepHeader step="02 / PLAYERS" title="Set up the game" subtitle="Choose rounds and give everyone a name." />
            <div className="panel">
              <label className="field-label">Rounds</label>
              <Counter value={draftRounds} min={1} max={20} onChange={setDraftRounds} />
            </div>

            <div className="players-list">
              {draftPlayers.map((player, index) => (
                <div className="player-row" key={player.id}>
                  <div className="player-number">{index + 1}</div>
                  <input
                    value={player.name}
                    aria-label={`Player ${index + 1} name`}
                    onChange={e => setDraftPlayers(prev => prev.map(p => p.id === player.id ? { ...p, name: e.target.value } : p))}
                    onBlur={e => {
                      if (!e.target.value.trim()) setDraftPlayers(prev => prev.map(p => p.id === player.id ? { ...p, name: `Player ${index + 1}` } : p))
                    }}
                  />
                  {draftPlayers.length > 2 && <button className="remove-player" onClick={() => setDraftPlayers(prev => prev.filter(p => p.id !== player.id))}>×</button>}
                </div>
              ))}
            </div>

            <Button variant="secondary" icon={<span>+</span>} onClick={() => setDraftPlayers(prev => [...prev, newPlayer(prev.length + 1)])}>
              Add player
            </Button>

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
              <Button disabled={!enoughCharacters} onClick={startGame}>Assign villains</Button>
            </div>
          </section>
        )}

        {screen === 3 && game && (
          <section>
            <StepHeader step="03 / Tournament" title="Your villains" subtitle="One character per player per round. Each player gets one refresh for the whole game." />
            <div className="draw-rounds">
              {Array.from({ length: game.rounds }, (_, i) => i + 1).map(round => (
                <div className="round-block" key={round}>
                  <div className="round-title">Round {round}</div>
                  <div className="draw-table">
                    {game.players.map(player => {
                      const assignment = game.assignments[player.id].find(a => a.round === round)
                      const canRefresh = !game.refreshUsed[player.id]
                      const img = assignment ? displayImage(assignment.character, true) : undefined
                      console.log(img)
                      return (
                        <div className="draw-row" key={player.id}>
                          <span className="player-name">{player.name}</span>
                          <span className="character-cell">
                            {img?.local && (
                              <img
                                src={img.local}
                                alt=""
                                onError={e => {
                                  if (img.remote) e.currentTarget.src = img.remote
                                }}
                              />
                            )}

                            <div className="character-info">
                              <strong>{assignment?.character}</strong>
                              <small>{ assignment ? findSetForCharacter(assignment?.character) : '-'}</small>
                            </div>
                          </span>
                          <RefreshButton disabled={!canRefresh} onClick={() => {
                            const next = rerollAssignment(game, player.id, round, draftOwned)
                            setGame(next)
                          }} />
                        </div>
                      )
                    })}
                  </div>
                </div>
              ))}
            </div>
            <div className="sticky-action">
              <SecondaryButton onClick={() => { setPlaceDraft({}); setScreen(2) }}>Back</SecondaryButton>
              <PrimaryButton onClick={() => { setPlacements([]); setPlaceDraft({}); setScreen(4) }}>Let's play</PrimaryButton>
            </div>
          </section>
        )}

        {screen === 4 && game && (
          <section>
            <StepHeader
              step={`04 / ROUND ${currentRound}`}
              title="Round Results"
              subtitle="Tap players in finishing order."
            />

            <div className="winner-grid">
              {game.players.map(player => {
                const assignment = game.assignments[player.id].find(
                  a => a.round === currentRound
                )

                const img = assignment
                  ? displayImage(assignment.character, true)
                  : undefined

                const place = placements.indexOf(player.id)

                return (
                  <button
                    key={player.id}
                    className={`winner-tile ${place >= 0 ? 'selected' : ''}`}
                    onClick={() => togglePlacement(player.id)}
                  >
                    {place >= 0 && (
                      <div className="placement-badge">
                        {ordinal(place + 1)}
                      </div>
                    )}

                    {img?.local && (
                      <img
                        src={img.local}
                        alt=""
                        onError={e => {
                          if (img.remote) {
                            e.currentTarget.src = img.remote
                          }
                        }}
                      />
                    )}

                    <strong>{player.name}</strong>

                    <span>{assignment?.character}</span>
                  </button>
                )
              })}
            </div>

            <div className="sticky-action">
              <SecondaryButton onClick={() => {setScreen(2)}}>Quit</SecondaryButton>
              <Button
                disabled={placements.length === 0}
                onClick={submitRound}
              >
                {currentRound === game.rounds
                  ? 'Finish Tournament'
                  : 'Next Round'}
              </Button>
            </div>
          </section>
        )}

        {screen === 5 && game && (
          <section>
            <StepHeader step="05 / LEADERBOARD" title="Game over" subtitle="Final standings from all recorded rounds." />
            <LeaderboardView players={game.players} game={game} />
            <div className="action-stack">
              <Button onClick={playAgain}>Play again</Button>
              <Button variant="secondary" onClick={() => setStatsOverlay(true)}>Show stats</Button>
            </div>
          </section>
        )}

        {screen === 6 && (
          <section>
            <StepHeader step="06 / STATS" title="The evil ledger" subtitle="See who keeps winning—or which villain does the winning." />
            <StatsView players={app.players} stats={app.stats} mode={statsMode} onMode={setStatsMode} />
          </section>
        )}
      </main>

      {statsOverlay && (
        <div className="overlay" role="dialog" aria-modal="true">
          <div className="drawer">
            <CloseButton onClick={() => setStatsOverlay(false)} />
            <StepHeader step="STATS" title="The evil ledger" />
            <StatsView players={app.players} stats={app.stats} mode={statsMode} onMode={setStatsMode} />
          </div>
        </div>
      )}

      {villainsOverlay && (
        <div
          className="overlay"
          role="dialog"
          aria-modal="true"
        >
          <div className="drawer large">
            <CloseButton
              onClick={() => setVillainsOverlay(false)}
            />

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
              {villainSets.map(set => (
                <SetCard
                  key={set.id}
                  name={set.name}
                  year={set.year}
                  image={displayImage(set.id)}
                  selected={draftOwned.includes(set.id)}
                  onClick={() =>
                    setDraftOwned(prev =>
                      prev.includes(set.id)
                        ? prev.filter(id => id !== set.id)
                        : [...prev, set.id]
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

function LeaderboardView({ players, game }: { players: Player[]; game: Game }) {
  const currentRows: RoundStat[] = game.players.flatMap(player =>
    game.assignments[player.id].map(assignment => ({
      round: assignment.round,
      playerId: player.id,
      playerName: player.name,
      character: assignment.character,
      place: game.roundResults[assignment.round]?.[player.id] ?? 0,
    }))
  ).filter(row => row.place > 0)
  const rows = leaderboard(game.players, { rounds: currentRows })
  const winner = rows[0]
  return (
    <>
      <div className="winner-card">
        <Crown size={28} />
        <div><small>WINNER</small><strong>{winner?.player.name}</strong><span>{winner?.points ?? 0} points · {winner?.wins ?? 0} win{winner?.wins === 1 ? '' : 's'}</span></div>
      </div>
      <div className="leaderboard">
        <div className="leaderboard-header"><span>Place</span><span>Player</span><span>Wins</span><span>Points</span></div>
        {rows.map((row, index) => (
          <div className="leaderboard-row" key={row.player.id}>
            <strong>{index + 1}</strong><span>{row.player.name}</span><span>{row.wins}</span><span>{row.points}</span>
          </div>
        ))}
      </div>
    </>
  )
}

function StatsView({
  players, stats, mode, onMode,
}: { players: Player[]; stats: StoredStats; mode: 'player' | 'character'; onMode: (m: 'player' | 'character') => void }) {
  const playerRows = leaderboard(players, stats)
  const characterRows = characterLeaderboard(stats.rounds)
  return (
    <div className="stats-view">
      <div className="segmented">
        <button className={mode === 'player' ? 'active' : ''} onClick={() => onMode('player')}>Player</button>
        <button className={mode === 'character' ? 'active' : ''} onClick={() => onMode('character')}>Character</button>
      </div>
      {mode === 'player' ? (
        <div className="stats-list">
          {playerRows.length ? playerRows.map((row, i) => (
            <div className="stat-row" key={row.player.id}><strong>{i + 1}</strong><span>{row.player.name}</span><b>{row.wins} win{row.wins === 1 ? '' : 's'}</b><small>{row.points} pts</small></div>
          )) : <EmptyStats />}
        </div>
      ) : (
        <div className="stats-list">
          {characterRows.length ? characterRows.map((row, i) => (
            <div className="stat-row" key={row.character}>
              <strong>{i + 1}</strong>
              <span className='character-cell'>
                <img src={displayImage(row.character, true).local} style={{ marginRight: '1rem' }} />
                <span>
                  {row.character}
                  <br />
                  <small>{row.appearances} appearances</small>
                </span>
              </span>
              <b>{row.wins} win{row.wins === 1 ? '' : 's'}</b>
            </div>
          )) : <EmptyStats />}
        </div>
      )}
    </div>
  )
}

function EmptyStats() {
  return <div className="empty-state"><Trophy size={30} /><p>No stats yet. Finish a game and they will appear here.</p></div>
}

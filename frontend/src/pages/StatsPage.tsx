import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSessionStore } from '../store/useSessionStore'
import StatCard from '../components/StatCard'
import { SkeletonCard } from '../components/Skeleton'
import { metricsApi } from '../api/metrics'
import { gameApi } from '../api/games'
import apiClient from '../api/client'
import './StatsPage.css'

function StatsPage() {
  const navigate = useNavigate()
  const recordPageView = useSessionStore((state) => state.recordPageView)

  const [sessionStats, setSessionStats] = useState<any>(null)
  const [playStats, setPlayStats] = useState<any>(null)
  const [gameDrawStats, setGameDrawStats] = useState<any[]>([])
  const [games, setGames] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    recordPageView('statistics')
  }, [recordPageView])

  useEffect(() => {
    const loadStats = async () => {
      setLoading(true)
      try {
        // Load both session and play metrics
        const sessionData = await metricsApi.getSessionMetrics().catch(() => null)
        const playData = await metricsApi.getPlayMetrics().catch(() => null)
        const gamesData = await gameApi.getGames().catch(() => [])
        const drawStatsData = await apiClient.get('/stats').then(r => r.data).catch(() => [])

        setSessionStats(sessionData)
        setPlayStats(playData)
        setGames(gamesData || [])
        setGameDrawStats(drawStatsData || [])
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load statistics')
      } finally {
        setLoading(false)
      }
    }

    loadStats()
  }, [])

  const handleGameClick = (gameId: string) => {
    navigate(`/stats/${gameId}`)
  }

  const formatNumber = (num: number): string => {
    return new Intl.NumberFormat('en-US').format(num)
  }

  return (
    <div className="stats-page">
      <header className="stats-header">
        <h1>Lottery Statistics</h1>
        <p>
          Explore the odds and win rates across all lottery games. Understand why lottery
          tickets are statistically a losing proposition.
        </p>
      </header>

      {error && (
        <div className="error-banner" role="alert">
          <span aria-hidden="true">&#9888;</span>
          <p>{error}</p>
        </div>
      )}

      {loading && (
        <div role="status" aria-label="Loading statistics">
          <span className="sr-only">Loading statistics...</span>
          <div className="stats-grid">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        </div>
      )}

      {!loading && !sessionStats && !playStats && gameDrawStats.length === 0 && !error && (
        <div className="empty-state">
          <h2>No Statistics Available</h2>
          <p>Play some games first to see statistics!</p>
          <button className="play-button" onClick={() => navigate('/games')}>
            Go to Games
          </button>
        </div>
      )}

      {!loading && (sessionStats || playStats || gameDrawStats.length > 0) && (
        <>
          <section className="stats-grid" aria-label="Session and play metrics">
            {sessionStats && (
              <>
                <StatCard
                  label="Total Sessions"
                  value={formatNumber(sessionStats.totalSessions || 0)}
                />
                <StatCard
                  label="Active Sessions"
                  value={formatNumber(sessionStats.activeSessions || 0)}
                />
                <StatCard
                  label="Avg Session Duration"
                  value={`${Number(sessionStats.avgSessionDuration || 0).toFixed(1)}m`}
                />
                <StatCard
                  label="Bounce Rate"
                  value={`${Number(sessionStats.bounceRate || 0).toFixed(1)}%`}
                />
              </>
            )}

            {playStats && (
              <>
                <StatCard
                  label="Total Plays"
                  value={formatNumber(playStats.totalPlays || 0)}
                />
                <StatCard
                  label="Play Conversion Rate"
                  value={`${Number(playStats.playConversionRate || 0).toFixed(1)}%`}
                />
                <StatCard
                  label="Avg Plays Per Session"
                  value={Number(playStats.avgPlaysPerSession || 0).toFixed(1)}
                />
                <StatCard
                  label="Favorite Game"
                  value={playStats.favoritGame || 'N/A'}
                />
              </>
            )}
          </section>

          {gameDrawStats.length > 0 && (
            <section className="avg-draws-section" aria-label="Average draws per game">
              <h2>Average Draws to Win</h2>
              <p className="section-subtitle">
                How many draws it takes on average to match your numbers for each game.
              </p>
              <div className="avg-draws-grid">
                {gameDrawStats.map((stat: any) => (
                  <div
                    key={stat.game_id}
                    className="avg-draws-card"
                    onClick={() => handleGameClick(stat.game_id)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => e.key === 'Enter' && handleGameClick(stat.game_id)}
                    aria-label={`${stat.name}: ${Number(stat.avg_draws_to_win).toLocaleString('de-DE')} average draws. Click for details.`}
                  >
                    <span className="avg-draws-name">{stat.name}</span>
                    <span className="avg-draws-value">
                      {Number(stat.avg_draws_to_win).toLocaleString('de-DE')}
                    </span>
                    <span className="avg-draws-label">avg draws</span>
                    <span className="avg-draws-plays">
                      {Number(stat.total_plays).toLocaleString('de-DE')} plays
                    </span>
                  </div>
                ))}
              </div>
            </section>
          )}

          {games.length > 0 && (
            <section className="games-stats-section" aria-label="Game-specific statistics">
              <h2>Game-Specific Statistics</h2>
              <div className="games-list">
                {games.map((game) => (
                  <button
                    key={game.id}
                    className="game-stat-link"
                    onClick={() => handleGameClick(game.id)}
                    aria-label={`View statistics for ${game.name}`}
                  >
                    {game.name}
                  </button>
                ))}
              </div>
            </section>
          )}

          <section className="stats-info" aria-label="Educational information">
            <div className="info-section">
              <h3>Understanding Lottery Odds</h3>
              <p>
                Lottery games are designed with odds heavily stacked against players. The average
                draws to win metric shows how many iterations you would need to run before hitting
                the specific combination you selected.
              </p>
              <p>
                Click on any game to see detailed probability calculations and learn more about the
                mathematical impossibility of winning based on combinatorics.
              </p>
            </div>

            <div className="info-section">
              <h3>Why This Matters</h3>
              <ul>
                <li>
                  <strong>Personal Finance:</strong> Understanding odds helps you make better
                  financial decisions
                </li>
                <li>
                  <strong>Statistical Literacy:</strong> Lottery odds are a great way to learn
                  about probability
                </li>
                <li>
                  <strong>Expected Value:</strong> Most lotteries have a negative expected value,
                  meaning you lose money on average
                </li>
              </ul>
            </div>
          </section>
        </>
      )}
    </div>
  )
}

export default StatsPage

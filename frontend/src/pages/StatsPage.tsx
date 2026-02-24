import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSessionStore } from '../store/useSessionStore'
import StatCard from '../components/StatCard'
import { metricsApi } from '../api/metrics'
import { gameApi } from '../api/games'
import './StatsPage.css'

function StatsPage() {
  const navigate = useNavigate()
  const recordPageView = useSessionStore((state) => state.recordPageView)
  
  const [sessionStats, setSessionStats] = useState<any>(null)
  const [playStats, setPlayStats] = useState<any>(null)
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

        setSessionStats(sessionData)
        setPlayStats(playData)
        setGames(gamesData || [])
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
      <div className="stats-header">
        <h1>Lottery Statistics</h1>
        <p>
          Explore the odds and win rates across all lottery games. Understand why lottery
          tickets are statistically a losing proposition.
        </p>
      </div>

      {error && (
        <div className="error-banner">
          <span>⚠️</span>
          <p>{error}</p>
        </div>
      )}

      {loading && (
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Loading statistics...</p>
        </div>
      )}

      {!loading && !sessionStats && !playStats && !error && (
        <div className="empty-state">
          <h2>No Statistics Available</h2>
          <p>Play some games first to see statistics!</p>
          <button className="play-button" onClick={() => navigate('/games')}>
            Go to Games →
          </button>
        </div>
      )}

      {!loading && (sessionStats || playStats) && (
        <>
          <div className="stats-grid">
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
                  value={`${(sessionStats.avgSessionDuration || 0).toFixed(1)}m`}
                />
                <StatCard
                  label="Bounce Rate"
                  value={`${(sessionStats.bounceRate || 0).toFixed(1)}%`}
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
                  value={`${(playStats.playConversionRate || 0).toFixed(1)}%`}
                />
                <StatCard
                  label="Avg Plays Per Session"
                  value={(playStats.avgPlaysPerSession || 0).toFixed(1)}
                />
                <StatCard
                  label="Favorite Game"
                  value={playStats.favoritGame || 'N/A'}
                />
              </>
            )}
          </div>

          {games.length > 0 && (
            <div className="games-stats-section">
              <h2>Game-Specific Statistics</h2>
              <div className="games-list">
                {games.map((game) => (
                  <button
                    key={game.id}
                    className="game-stat-link"
                    onClick={() => handleGameClick(game.id)}
                  >
                    {game.name}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="stats-info">
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
          </div>
        </>
      )}
    </div>
  )
}

export default StatsPage

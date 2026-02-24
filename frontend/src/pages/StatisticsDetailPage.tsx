import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { gameApi } from '../api/games'
import { useAppStore } from '../store/useAppStore'
import { useSessionStore } from '../store/useSessionStore'
import { SkeletonCard, Skeleton } from '../components/Skeleton'
import './StatisticsDetailPage.css'

interface GameStats {
  game_id: string
  name: string
  total_plays: number
  total_wins: number
  win_rate_percent: number
  avg_draws_to_win: number
}

export default function StatisticsDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [stats, setStats] = useState<GameStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const games = useAppStore((state) => state.games)
  const recordPageView = useSessionStore((state) => state.recordPageView)

  const currentGame = games.find((g) => g.id === id)

  useEffect(() => {
    if (id) {
      recordPageView(`stats_detail/${id}`)
    }
  }, [id, recordPageView])

  useEffect(() => {
    const loadStats = async () => {
      try {
        setLoading(true)
        const data = await gameApi.getStatistics(id!)
        setStats(data)
      } catch (err) {
        setError('Failed to load game statistics. Please try again.')
        console.error('Error loading statistics:', err)
      } finally {
        setLoading(false)
      }
    }

    if (id) {
      loadStats()
    }
  }, [id])

  if (loading) {
    return (
      <div className="stats-detail-page" role="status" aria-label="Loading statistics">
        <span className="sr-only">Loading statistics...</span>
        <button className="back-button" onClick={() => navigate('/stats')}>
          <ArrowLeft size={20} aria-hidden="true" />
          <span>Back to Statistics</span>
        </button>
        <div style={{ marginTop: 24 }}>
          <Skeleton width="300px" height="32px" />
          <Skeleton width="200px" height="16px" />
        </div>
        <div className="stats-overview" style={{ marginTop: 24 }}>
          {[1, 2, 3, 4].map((i) => (
            <div className="stat-item" key={i}>
              <Skeleton width="80px" height="32px" />
              <Skeleton width="100px" height="14px" />
            </div>
          ))}
        </div>
        <div className="probability-cards" style={{ marginTop: 24 }}>
          {[1, 2, 3, 4].map((i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      </div>
    )
  }

  if (error || !stats) {
    return (
      <div className="stats-detail-page">
        <button className="back-button" onClick={() => navigate('/stats')}>
          <ArrowLeft size={20} aria-hidden="true" />
          <span>Back to Statistics</span>
        </button>
        <div className="error-banner" role="alert">
          <span aria-hidden="true">&#9888;</span>
          <p>{error || 'No statistics available for this game.'}</p>
        </div>
      </div>
    )
  }

  const odds = currentGame?.number_range
    ? `1 in ${Math.round((currentGame.number_range.length * currentGame.numbers_to_select) / 10)}`
    : '1 in unknown'

  const expectedDraws = currentGame?.number_range
    ? Math.round(
        (10 *
          Math.pow(currentGame.number_range.length, currentGame.numbers_to_select)) /
          (currentGame.numbers_to_select * (currentGame.number_range.length - currentGame.numbers_to_select + 1))
      )
    : 0

  return (
    <div className="stats-detail-page">
      <button className="back-button" onClick={() => navigate('/stats')}>
        <ArrowLeft size={20} aria-hidden="true" />
        <span>Back to Statistics</span>
      </button>

      <header className="detail-header">
        <h1>{stats.name} - Game Statistics</h1>
        <p>Detailed analysis and probability breakdown</p>
      </header>

      <section className="stats-overview" aria-label="Key statistics">
        <div className="stat-item">
          <div className="stat-value">{stats.total_plays}</div>
          <div className="stat-label">Total Plays</div>
        </div>
        <div className="stat-item">
          <div className="stat-value">{stats.total_wins}</div>
          <div className="stat-label">Total Wins</div>
        </div>
        <div className="stat-item">
          <div className="stat-value">{stats.win_rate_percent.toFixed(2)}%</div>
          <div className="stat-label">Win Rate</div>
        </div>
        <div className="stat-item">
          <div className="stat-value">{stats.avg_draws_to_win.toFixed(1)}</div>
          <div className="stat-label">Avg Draws to Win</div>
        </div>
      </section>

      <section className="probability-section" aria-label="Probability analysis">
        <h2>Probability Analysis</h2>

        <div className="probability-cards">
          <div className="prob-card">
            <div className="prob-label">Theoretical Odds</div>
            <div className="prob-value">{odds}</div>
            <p className="prob-desc">Mathematical probability of winning based on game rules</p>
          </div>

          <div className="prob-card">
            <div className="prob-label">Expected Draws to Win</div>
            <div className="prob-value">{expectedDraws}</div>
            <p className="prob-desc">Average number of attempts before winning (theoretical)</p>
          </div>

          <div className="prob-card">
            <div className="prob-label">Observed vs Expected</div>
            <div className="prob-value">{((stats.avg_draws_to_win / expectedDraws) * 100).toFixed(0)}%</div>
            <p className="prob-desc">How actual results compare to mathematical expectations</p>
          </div>

          <div className="prob-card">
            <div className="prob-label">Sample Size</div>
            <div className="prob-value">{stats.total_plays}</div>
            <p className="prob-desc">Total plays in this dataset (larger = more reliable)</p>
          </div>
        </div>
      </section>

      <section className="educational-section" aria-label="Educational content">
        <h2>Understanding These Numbers</h2>

        <div className="education-cards">
          <div className="edu-card">
            <h3>What is Win Rate?</h3>
            <p>The win rate shows what percentage of all plays resulted in a win. With {stats.total_plays} plays and {stats.total_wins} wins, the win rate is {stats.win_rate_percent.toFixed(2)}%.</p>
          </div>

          <div className="edu-card">
            <h3>What are Odds?</h3>
            <p>
              The odds represent how difficult it is to win. Lower odds (like 1 in 10) are easier to beat, while higher odds (like 1 in 1000) are much harder. These are mathematical probabilities calculated from the game rules.
            </p>
          </div>

          <div className="edu-card">
            <h3>Draws to Win</h3>
            <p>
              This is the average number of times you need to play to win once. If the average is {stats.avg_draws_to_win.toFixed(1)}, it means on average, after that many attempts, you'd expect one win.
            </p>
          </div>

          <div className="edu-card">
            <h3>Sample Size Matters</h3>
            <p>
              With {stats.total_plays} total plays, we have enough data to see real patterns. Larger sample sizes give us more confidence that these numbers represent the true probability.
            </p>
          </div>

          <div className="edu-card">
            <h3>Comparing Theory to Reality</h3>
            <p>
              Lottery games are designed so that theoretically, players are expected to lose money over time. The observed win rate helps us understand if real game results match mathematical predictions.
            </p>
          </div>

          <div className="edu-card">
            <h3>Financial Literacy Tip</h3>
            <p>
              Remember: lotteries are entertainment with a built-in expected loss. Never spend money on lottery games that you can't afford to lose. Always play responsibly!
            </p>
          </div>
        </div>
      </section>

      <div className="disclaimer">
        <p>
          <strong>Disclaimer:</strong> These statistics are educational demonstrations of lottery mathematics. Real lottery games have carefully balanced odds designed to ensure the house always has an advantage over time. This simulator is for learning purposes only and should never be used as a basis for real gambling decisions.
        </p>
      </div>
    </div>
  )
}

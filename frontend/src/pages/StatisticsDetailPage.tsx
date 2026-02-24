import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { gameApi } from '../api/games'
import { useGamesStore } from '../store/gamesStore'
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
  const [currentGame, setCurrentGame] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const games = useGamesStore((state) => state.games)
  const recordPageView = useSessionStore((state) => state.recordPageView)

  useEffect(() => {
    if (id) {
      recordPageView(`stats_detail/${id}`)
    }
  }, [id, recordPageView])

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true)
        const gameData = games.find((g) => g.id === id) || await gameApi.getGame(id!)
        setCurrentGame(gameData)

        try {
          const statsData = await gameApi.getStatistics(id!)
          setStats(statsData)
        } catch (statsErr: any) {
          // 404 means no plays yet — not an error
          if (statsErr.response?.status !== 404) {
            throw statsErr
          }
        }
      } catch (err) {
        setError('Failed to load game statistics. Please try again.')
        console.error('Error loading statistics:', err)
      } finally {
        setLoading(false)
      }
    }

    if (id) {
      loadData()
    }
  }, [id, games])

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

  if (error) {
    return (
      <div className="stats-detail-page">
        <button className="back-button" onClick={() => navigate('/stats')}>
          <ArrowLeft size={20} aria-hidden="true" />
          <span>Back to Statistics</span>
        </button>
        <div className="error-banner" role="alert">
          <span aria-hidden="true">&#9888;</span>
          <p>{error}</p>
        </div>
      </div>
    )
  }

  if (!stats) {
    return (
      <div className="stats-detail-page">
        <button className="back-button" onClick={() => navigate('/stats')}>
          <ArrowLeft size={20} aria-hidden="true" />
          <span>Back to Statistics</span>
        </button>
        <div className="empty-state">
          <h2>No statistics gathered yet</h2>
          <p>{currentGame ? `Be the first to play ${currentGame.name} and generate statistics!` : 'Play this game to start gathering statistics.'}</p>
          <button className="play-link-btn" onClick={() => navigate(`/games/${id}`)}>
            Play Now
          </button>
        </div>
      </div>
    )
  }

  // Use the pre-calculated probability from the database (accounts for bonus pools)
  const probability = currentGame?.probability_of_winning ? Number(currentGame.probability_of_winning) : 0
  const expectedDraws = probability > 0 ? Math.round(1 / probability) : 0

  const odds = expectedDraws ? `1 in ${expectedDraws.toLocaleString('de-DE')}` : '1 in unknown'

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
          <div className="stat-value">{Number(stats.win_rate_percent).toFixed(2)}%</div>
          <div className="stat-label">Win Rate</div>
        </div>
        <div className="stat-item">
          <div className="stat-value">{Number(stats.avg_draws_to_win).toLocaleString('de-DE')}</div>
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
            <div className="prob-label">Observed Avg Draws to Win</div>
            <div className="prob-value">{Number(stats.avg_draws_to_win).toLocaleString('de-DE')}</div>
            <p className="prob-desc">Actual average attempts before winning from {stats.total_plays} simulations</p>
          </div>

          <div className="prob-card">
            <div className="prob-label">Observed vs Theoretical</div>
            <div className="prob-value">{expectedDraws ? ((Number(stats.avg_draws_to_win) / expectedDraws) * 100).toFixed(1) : 'N/A'}%</div>
            <p className="prob-desc">How actual results compare to mathematical expectations (closer to 100% = more accurate)</p>
          </div>

          <div className="prob-card">
            <div className="prob-label">Sample Size</div>
            <div className="prob-value">{stats.total_plays}</div>
            <p className="prob-desc">Total plays in this dataset (larger = more reliable)</p>
          </div>
        </div>
      </section>

      {expectedDraws > 0 && (
        <section className="odds-perspective-section" aria-label="Odds in perspective">
          <h2>Putting the Odds in Perspective</h2>

          <div className="perspective-card">
            <h3>How Long Would It Take?</h3>
            <p>If you played {stats.name} regularly, here's how long you'd expect to wait for a single win:</p>
            <div className="time-grid">
              <div className="time-item">
                <div className="time-value">{Math.round(expectedDraws / 365).toLocaleString('de-DE')}</div>
                <div className="time-label">years playing daily</div>
              </div>
              <div className="time-item">
                <div className="time-value">{Math.round(expectedDraws / 104).toLocaleString('de-DE')}</div>
                <div className="time-label">years playing twice a week</div>
              </div>
              <div className="time-item">
                <div className="time-value">{Math.round(expectedDraws / 52).toLocaleString('de-DE')}</div>
                <div className="time-label">years playing once a week</div>
              </div>
            </div>
          </div>

          <div className="perspective-card">
            <h3>How Much Would You Spend?</h3>
            <p>At $2 per ticket, here's what you'd expect to spend before winning once:</p>
            <div className="time-grid">
              <div className="time-item">
                <div className="time-value">${(expectedDraws * 2).toLocaleString('de-DE')}</div>
                <div className="time-label">total cost ({Math.round((expectedDraws * 2) / (Math.round(expectedDraws / 365))).toLocaleString('de-DE')}/yr playing daily)</div>
              </div>
              <div className="time-item">
                <div className="time-value">${(104 * 2).toLocaleString('de-DE')}</div>
                <div className="time-label">per year playing twice a week</div>
              </div>
              <div className="time-item">
                <div className="time-value">${(52 * 2).toLocaleString('de-DE')}</div>
                <div className="time-label">per year playing once a week</div>
              </div>
            </div>
          </div>
          <div className="perspective-card">
            <h3>Lightning Strike Comparison</h3>
            <p>The odds of being struck by lightning in a given year are roughly 1 in 1,222,000.</p>
            <div className="time-grid single">
              <div className="time-item">
                <div className="time-value">{(expectedDraws / 1222000).toFixed(1)}x</div>
                <div className="time-label">more likely to be struck by lightning than to win {stats.name}</div>
              </div>
            </div>
          </div>

          <div className="perspective-card">
            <h3>Coin Flip Equivalent</h3>
            <p>Winning {stats.name} is as likely as flipping a coin and getting heads every single time:</p>
            <div className="time-grid single">
              <div className="time-item">
                <div className="time-value">{Math.round(Math.log2(expectedDraws))} times in a row</div>
                <div className="time-label">consecutive heads needed (each flip halves your chances)</div>
              </div>
            </div>
          </div>

          <div className="perspective-card">
            <h3>Ticket Stack</h3>
            <p>If each lottery ticket were 1mm thick and you stacked all the tickets needed to expect one win:</p>
            <div className="time-grid">
              <div className="time-item">
                <div className="time-value">{(expectedDraws / 1000).toLocaleString('de-DE')} m</div>
                <div className="time-label">stack height</div>
              </div>
              <div className="time-item">
                <div className="time-value">{(expectedDraws / 1000000).toFixed(1)} km</div>
                <div className="time-label">{expectedDraws >= 8848000 ? `${(expectedDraws / 8848000).toFixed(1)}x the height of Mt. Everest` : expectedDraws >= 324000 ? `${(expectedDraws / 324000).toFixed(1)}x the Eiffel Tower` : 'stacked up'}</div>
              </div>
              <div className="time-item">
                <div className="time-value">{expectedDraws >= 384400000000 ? `${(expectedDraws / 384400000000).toFixed(2)}x` : expectedDraws >= 1000000000 ? `${((expectedDraws / 384400000000) * 100).toFixed(2)}%` : `${((expectedDraws / 1000000) / 384400 * 100).toFixed(4)}%`}</div>
                <div className="time-label">of the distance to the Moon (384,400 km)</div>
              </div>
            </div>
          </div>

          <div className="perspective-card">
            <h3>Pick a Card</h3>
            <p>A standard deck has 52 cards. Winning {stats.name} is like picking one specific card from a huge pile:</p>
            <div className="time-grid single">
              <div className="time-item">
                <div className="time-value">{Math.round(expectedDraws / 52).toLocaleString('de-DE')} decks</div>
                <div className="time-label">shuffle {Math.round(expectedDraws / 52).toLocaleString('de-DE')} decks together and draw the Ace of Spades on your first try</div>
              </div>
            </div>
          </div>

          <div className="perspective-card">
            <h3>How Many Lifetimes?</h3>
            <p>Assuming an average human lifespan of 80 years, here's how many lifetimes you'd need:</p>
            <div className="time-grid">
              <div className="time-item">
                <div className="time-value">{Math.round(expectedDraws / 365 / 80).toLocaleString('de-DE')}</div>
                <div className="time-label">lifetimes playing daily</div>
              </div>
              <div className="time-item">
                <div className="time-value">{Math.round(expectedDraws / 104 / 80).toLocaleString('de-DE')}</div>
                <div className="time-label">lifetimes playing twice a week</div>
              </div>
              <div className="time-item">
                <div className="time-value">{Math.round(expectedDraws / 52 / 80).toLocaleString('de-DE')}</div>
                <div className="time-label">lifetimes playing once a week</div>
              </div>
            </div>
          </div>

          <div className="perspective-card">
            <h3>Birthday Match</h3>
            <p>The chance of a random stranger sharing your exact birthday is 1 in 365. Winning {stats.name} is like:</p>
            <div className="time-grid single">
              <div className="time-item">
                <div className="time-value">{Math.round(Math.log(expectedDraws) / Math.log(365))} strangers in a row</div>
                <div className="time-label">meeting {Math.round(Math.log(expectedDraws) / Math.log(365))} random people and ALL of them sharing your exact birthday</div>
              </div>
            </div>
          </div>
        </section>
      )}

      <section className="educational-section" aria-label="Educational content">
        <h2>Understanding These Numbers</h2>

        <div className="education-cards">
          <div className="edu-card">
            <h3>What is Win Rate?</h3>
            <p>The win rate shows what percentage of all plays resulted in a win. With {stats.total_plays} plays and {stats.total_wins} wins, the win rate is {Number(stats.win_rate_percent).toFixed(2)}%.</p>
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
              This is the average number of times you need to play to win once. If the average is {Number(stats.avg_draws_to_win).toLocaleString('de-DE')}, it means on average, after that many attempts, you'd expect one win.
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

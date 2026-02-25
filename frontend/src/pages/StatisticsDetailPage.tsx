import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { ArrowLeft } from 'lucide-react'
import { gameApi } from '../api/games'
import { useGamesStore } from '../store/gamesStore'
import { useSessionStore } from '../store/useSessionStore'
import { SkeletonCard, Skeleton } from '../components/Skeleton'
import { formatNumber } from '../utils/formatNumber'
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
  const { t, i18n } = useTranslation('stats')
  const lng = i18n.language
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
        setError(t('detail.failedToLoad'))
        console.error('Error loading statistics:', err)
      } finally {
        setLoading(false)
      }
    }

    if (id) {
      loadData()
    }
  }, [id, games, t])

  if (loading) {
    return (
      <div className="stats-detail-page" role="status" aria-label={t('loadingStats')}>
        <span className="sr-only">{t('loadingText')}</span>
        <button className="back-button" onClick={() => navigate('/stats')}>
          <ArrowLeft size={20} aria-hidden="true" />
          <span>{t('detail.backToStats')}</span>
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
          <span>{t('detail.backToStats')}</span>
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
          <span>{t('detail.backToStats')}</span>
        </button>
        <div className="empty-state">
          <h2>{t('detail.noStatsYet')}</h2>
          <p>{currentGame ? t('detail.beFirstToPlay', { name: currentGame.name }) : t('detail.playToGenerate')}</p>
          <button className="play-link-btn" onClick={() => navigate(`/games/${id}`)}>
            {t('detail.playNow')}
          </button>
        </div>
      </div>
    )
  }

  // Use the pre-calculated probability from the database (accounts for bonus pools)
  const probability = currentGame?.probability_of_winning ? Number(currentGame.probability_of_winning) : 0
  const expectedDraws = probability > 0 ? Math.round(1 / probability) : 0

  const odds = expectedDraws ? `1 in ${formatNumber(expectedDraws, lng)}` : '1 in unknown'

  return (
    <div className="stats-detail-page">
      <button className="back-button" onClick={() => navigate('/stats')}>
        <ArrowLeft size={20} aria-hidden="true" />
        <span>{t('detail.backToStats')}</span>
      </button>

      <header className="detail-header">
        <h1>{t('detail.gameStats', { name: stats.name })}</h1>
        <p>{t('detail.detailedAnalysis')}</p>
      </header>

      <section className="stats-overview" aria-label="Key statistics">
        <div className="stat-item">
          <div className="stat-value">{stats.total_plays}</div>
          <div className="stat-label">{t('detail.totalPlays')}</div>
        </div>
        <div className="stat-item">
          <div className="stat-value">{stats.total_wins}</div>
          <div className="stat-label">{t('detail.totalWins')}</div>
        </div>
        <div className="stat-item">
          <div className="stat-value">{Number(stats.win_rate_percent).toFixed(2)}%</div>
          <div className="stat-label">{t('detail.winRate')}</div>
        </div>
        <div className="stat-item">
          <div className="stat-value">{formatNumber(Number(stats.avg_draws_to_win), lng)}</div>
          <div className="stat-label">{t('detail.avgDrawsToWin')}</div>
        </div>
      </section>

      <section className="probability-section" aria-label={t('detail.probabilityAnalysis')}>
        <h2>{t('detail.probabilityAnalysis')}</h2>

        <div className="probability-cards">
          <div className="prob-card">
            <div className="prob-label">{t('detail.theoreticalOdds')}</div>
            <div className="prob-value">{odds}</div>
            <p className="prob-desc">{t('detail.theoreticalOddsDesc')}</p>
          </div>

          <div className="prob-card">
            <div className="prob-label">{t('detail.observedAvgDraws')}</div>
            <div className="prob-value">{formatNumber(Number(stats.avg_draws_to_win), lng)}</div>
            <p className="prob-desc">{t('detail.observedAvgDrawsDesc', { count: stats.total_plays })}</p>
          </div>

          <div className="prob-card">
            <div className="prob-label">{t('detail.observedVsTheoretical')}</div>
            <div className="prob-value">{expectedDraws ? ((Number(stats.avg_draws_to_win) / expectedDraws) * 100).toFixed(1) : 'N/A'}%</div>
            <p className="prob-desc">{t('detail.observedVsTheoreticalDesc')}</p>
          </div>

          <div className="prob-card">
            <div className="prob-label">{t('detail.sampleSize')}</div>
            <div className="prob-value">{stats.total_plays}</div>
            <p className="prob-desc">{t('detail.sampleSizeDesc')}</p>
          </div>
        </div>
      </section>

      {expectedDraws > 0 && (
        <section className="odds-perspective-section" aria-label={t('detail.oddsInPerspective')}>
          <h2>{t('detail.oddsInPerspective')}</h2>

          <div className="perspective-card">
            <h3>{t('perspective.howLong', { ns: 'gameplay' })}</h3>
            <p>{t('perspective.howLongDesc', { ns: 'gameplay', name: stats.name })}</p>
            <div className="time-grid">
              <div className="time-item">
                <div className="time-value">{formatNumber(Math.round(expectedDraws / 365), lng)}</div>
                <div className="time-label">{t('perspective.yearsDaily', { ns: 'gameplay' })}</div>
              </div>
              <div className="time-item">
                <div className="time-value">{formatNumber(Math.round(expectedDraws / 104), lng)}</div>
                <div className="time-label">{t('perspective.yearsTwiceWeek', { ns: 'gameplay' })}</div>
              </div>
              <div className="time-item">
                <div className="time-value">{formatNumber(Math.round(expectedDraws / 52), lng)}</div>
                <div className="time-label">{t('perspective.yearsOnceWeek', { ns: 'gameplay' })}</div>
              </div>
            </div>
          </div>

          <div className="perspective-card">
            <h3>{t('perspective.howMuchSpend', { ns: 'gameplay' })}</h3>
            <p>{t('perspective.howMuchSpendDesc', { ns: 'gameplay' })}</p>
            <div className="time-grid">
              <div className="time-item">
                <div className="time-value">${formatNumber(expectedDraws * 2, lng)}</div>
                <div className="time-label">{t('perspective.totalCost', { ns: 'gameplay', perYear: formatNumber(Math.round((expectedDraws * 2) / (Math.round(expectedDraws / 365))), lng) })}</div>
              </div>
              <div className="time-item">
                <div className="time-value">${formatNumber(104 * 2, lng)}</div>
                <div className="time-label">{t('perspective.perYearTwiceWeek', { ns: 'gameplay' })}</div>
              </div>
              <div className="time-item">
                <div className="time-value">${formatNumber(52 * 2, lng)}</div>
                <div className="time-label">{t('perspective.perYearOnceWeek', { ns: 'gameplay' })}</div>
              </div>
            </div>
          </div>

          <div className="perspective-card">
            <h3>{t('perspective.lightning', { ns: 'gameplay' })}</h3>
            <p>{t('perspective.lightningDesc', { ns: 'gameplay' })}</p>
            <div className="time-grid single">
              <div className="time-item">
                <div className="time-value">{(expectedDraws / 1222000).toFixed(1)}x</div>
                <div className="time-label">{t('perspective.lightningLabel', { ns: 'gameplay', name: stats.name })}</div>
              </div>
            </div>
          </div>

          <div className="perspective-card">
            <h3>{t('perspective.coinFlip', { ns: 'gameplay' })}</h3>
            <p>{t('perspective.coinFlipDesc', { ns: 'gameplay', name: stats.name })}</p>
            <div className="time-grid single">
              <div className="time-item">
                <div className="time-value">{t('perspective.coinFlipValue', { ns: 'gameplay', count: Math.round(Math.log2(expectedDraws)) })}</div>
                <div className="time-label">{t('perspective.coinFlipLabel', { ns: 'gameplay' })}</div>
              </div>
            </div>
          </div>

          <div className="perspective-card">
            <h3>{t('perspective.ticketStack', { ns: 'gameplay' })}</h3>
            <p>{t('perspective.ticketStackDesc', { ns: 'gameplay' })}</p>
            <div className="time-grid">
              <div className="time-item">
                <div className="time-value">{formatNumber(expectedDraws / 1000, lng)} m</div>
                <div className="time-label">{t('perspective.stackHeight', { ns: 'gameplay' })}</div>
              </div>
              <div className="time-item">
                <div className="time-value">{(expectedDraws / 1000000).toFixed(1)} km</div>
                <div className="time-label">{expectedDraws >= 8848000 ? t('perspective.everestComparison', { ns: 'gameplay', value: (expectedDraws / 8848000).toFixed(1) }) : expectedDraws >= 324000 ? t('perspective.eiffelComparison', { ns: 'gameplay', value: (expectedDraws / 324000).toFixed(1) }) : t('perspective.stackedUp', { ns: 'gameplay' })}</div>
              </div>
              <div className="time-item">
                <div className="time-value">{expectedDraws >= 384400000000 ? `${(expectedDraws / 384400000000).toFixed(2)}x` : expectedDraws >= 1000000000 ? `${((expectedDraws / 384400000000) * 100).toFixed(2)}%` : `${((expectedDraws / 1000000) / 384400 * 100).toFixed(4)}%`}</div>
                <div className="time-label">{t('perspective.moonDistance', { ns: 'gameplay' })}</div>
              </div>
            </div>
          </div>

          <div className="perspective-card">
            <h3>{t('perspective.pickCard', { ns: 'gameplay' })}</h3>
            <p>{t('perspective.pickCardDesc', { ns: 'gameplay', name: stats.name })}</p>
            <div className="time-grid single">
              <div className="time-item">
                <div className="time-value">{t('perspective.pickCardValue', { ns: 'gameplay', decks: formatNumber(Math.round(expectedDraws / 52), lng) })}</div>
                <div className="time-label">{t('perspective.pickCardLabel', { ns: 'gameplay', decks: formatNumber(Math.round(expectedDraws / 52), lng) })}</div>
              </div>
            </div>
          </div>

          <div className="perspective-card">
            <h3>{t('perspective.lifetimes', { ns: 'gameplay' })}</h3>
            <p>{t('perspective.lifetimesDesc', { ns: 'gameplay' })}</p>
            <div className="time-grid">
              <div className="time-item">
                <div className="time-value">{formatNumber(Math.round(expectedDraws / 365 / 80), lng)}</div>
                <div className="time-label">{t('perspective.lifetimesDaily', { ns: 'gameplay' })}</div>
              </div>
              <div className="time-item">
                <div className="time-value">{formatNumber(Math.round(expectedDraws / 104 / 80), lng)}</div>
                <div className="time-label">{t('perspective.lifetimesTwiceWeek', { ns: 'gameplay' })}</div>
              </div>
              <div className="time-item">
                <div className="time-value">{formatNumber(Math.round(expectedDraws / 52 / 80), lng)}</div>
                <div className="time-label">{t('perspective.lifetimesOnceWeek', { ns: 'gameplay' })}</div>
              </div>
            </div>
          </div>

          <div className="perspective-card">
            <h3>{t('perspective.birthday', { ns: 'gameplay' })}</h3>
            <p>{t('perspective.birthdayDesc', { ns: 'gameplay', name: stats.name })}</p>
            <div className="time-grid single">
              <div className="time-item">
                <div className="time-value">{t('perspective.birthdayValue', { ns: 'gameplay', count: Math.round(Math.log(expectedDraws) / Math.log(365)) })}</div>
                <div className="time-label">{t('perspective.birthdayLabel', { ns: 'gameplay', count: Math.round(Math.log(expectedDraws) / Math.log(365)) })}</div>
              </div>
            </div>
          </div>
        </section>
      )}

      <section className="educational-section" aria-label={t('detail.understandingNumbers')}>
        <h2>{t('detail.understandingNumbers')}</h2>

        <div className="education-cards">
          <div className="edu-card">
            <h3>{t('detail.whatIsWinRate')}</h3>
            <p>{t('detail.whatIsWinRateText', { totalPlays: stats.total_plays, totalWins: stats.total_wins, winRate: Number(stats.win_rate_percent).toFixed(2) })}</p>
          </div>

          <div className="edu-card">
            <h3>{t('detail.whatAreOdds')}</h3>
            <p>{t('detail.whatAreOddsText')}</p>
          </div>

          <div className="edu-card">
            <h3>{t('detail.drawsToWin')}</h3>
            <p>{t('detail.drawsToWinText', { avgDraws: formatNumber(Number(stats.avg_draws_to_win), lng) })}</p>
          </div>

          <div className="edu-card">
            <h3>{t('detail.sampleSizeMatters')}</h3>
            <p>{t('detail.sampleSizeMattersText', { totalPlays: stats.total_plays })}</p>
          </div>

          <div className="edu-card">
            <h3>{t('detail.theoryVsReality')}</h3>
            <p>{t('detail.theoryVsRealityText')}</p>
          </div>

          <div className="edu-card">
            <h3>{t('detail.financialTip')}</h3>
            <p>{t('detail.financialTipText')}</p>
          </div>
        </div>
      </section>

      <div className="disclaimer">
        <p>
          <strong>{t('detail.disclaimerLabel')}</strong> {t('detail.disclaimer')}
        </p>
      </div>
    </div>
  )
}

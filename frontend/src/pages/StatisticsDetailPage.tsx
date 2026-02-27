import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { ArrowLeft } from 'lucide-react'
import { gameApi } from '../api/games'
import { useGamesStore } from '../store/gamesStore'
import { useSessionStore } from '../store/useSessionStore'
import { SkeletonCard, Skeleton } from '../components/Skeleton'
import { formatNumber } from '../utils/formatNumber'
import OddsPerspective from '../components/OddsPerspective'
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
        <OddsPerspective expectedDraws={Math.round(Number(stats.avg_draws_to_win))} gameName={stats.name} />
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

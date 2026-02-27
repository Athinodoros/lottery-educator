import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useSessionStore } from '../store/useSessionStore'
import StatCard from '../components/StatCard'
import { SkeletonCard } from '../components/Skeleton'
import { metricsApi } from '../api/metrics'
import apiClient from '../api/client'
import { formatNumber as fmtNum } from '../utils/formatNumber'
import AdBanner from '../components/AdBanner'
import './StatsPage.css'

function StatsPage() {
  const navigate = useNavigate()
  const { t, i18n } = useTranslation('stats')
  const recordPageView = useSessionStore((state) => state.recordPageView)
  const lng = i18n.language

  const [sessionStats, setSessionStats] = useState<any>(null)
  const [playStats, setPlayStats] = useState<any>(null)
  const [gameDrawStats, setGameDrawStats] = useState<any[]>([])
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
        const drawStatsData = await apiClient.get('/stats').then(r => r.data).catch(() => [])

        setSessionStats(sessionData)
        setPlayStats(playData)
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
        <h1>{t('title')}</h1>
        <p>
          {t('subtitle')}
        </p>
      </header>

      {error && (
        <div className="error-banner" role="alert">
          <span aria-hidden="true">&#9888;</span>
          <p>{error}</p>
        </div>
      )}

      {loading && (
        <div role="status" aria-label={t('loadingStats')}>
          <span className="sr-only">{t('loadingText')}</span>
          <div className="stats-grid">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        </div>
      )}

      {!loading && !sessionStats && !playStats && gameDrawStats.length === 0 && !error && (
        <div className="empty-state">
          <h2>{t('noStatsTitle')}</h2>
          <p>{t('noStatsText')}</p>
          <button className="play-button" onClick={() => navigate('/games')}>
            {t('goToGames')}
          </button>
        </div>
      )}

      {!loading && (sessionStats || playStats || gameDrawStats.length > 0) && (
        <>
          <section className="stats-grid" aria-label="Session and play metrics">
            {sessionStats && (
              <>
                <StatCard
                  label={t('totalSessions')}
                  value={formatNumber(sessionStats.totalSessions || 0)}
                />
                <StatCard
                  label={t('activeSessions')}
                  value={formatNumber(sessionStats.activeSessions || 0)}
                />
                <StatCard
                  label={t('avgSessionDuration')}
                  value={`${Number(sessionStats.avgSessionDuration || 0).toFixed(1)}m`}
                />
                <StatCard
                  label={t('bounceRate')}
                  value={`${Number(sessionStats.bounceRate || 0).toFixed(1)}%`}
                />
              </>
            )}

            {playStats && (
              <>
                <StatCard
                  label={t('totalPlays')}
                  value={formatNumber(playStats.totalPlays || 0)}
                />
                <StatCard
                  label={t('playConversionRate')}
                  value={`${Number(playStats.playConversionRate || 0).toFixed(1)}%`}
                />
                <StatCard
                  label={t('avgPlaysPerSession')}
                  value={Number(playStats.avgPlaysPerSession || 0).toFixed(1)}
                />
                <StatCard
                  label={t('favoriteGame')}
                  value={playStats.favoritGame || 'N/A'}
                />
              </>
            )}
          </section>

          {gameDrawStats.length > 0 && (
            <section className="avg-draws-section" aria-label={t('avgDrawsToWin')}>
              <h2>{t('avgDrawsToWin')}</h2>
              <p className="section-subtitle">
                {t('avgDrawsSubtitle')}
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
                    aria-label={`${stat.name}: ${fmtNum(Number(stat.avg_draws_to_win), lng)} average draws.`}
                  >
                    <span className="avg-draws-name">{stat.name}</span>
                    <span className="avg-draws-value">
                      {fmtNum(Number(stat.avg_draws_to_win), lng)}
                    </span>
                    <span className="avg-draws-label">{t('avgDrawsLabel')}</span>
                    <span className="avg-draws-plays">
                      {t('playsLabel', { count: Number(stat.total_plays) })}
                    </span>
                  </div>
                ))}
              </div>
            </section>
          )}

          <section className="stats-info" aria-label="Educational information">
            <div className="info-section">
              <h3>{t('understandingOdds')}</h3>
              <p>{t('understandingOddsText1')}</p>
              <p>{t('understandingOddsText2')}</p>
            </div>

            <div className="info-section">
              <h3>{t('whyMatters')}</h3>
              <ul>
                <li>
                  <strong>{t('personalFinance')}</strong> {t('personalFinanceText')}
                </li>
                <li>
                  <strong>{t('statLiteracy')}</strong> {t('statLiteracyText')}
                </li>
                <li>
                  <strong>{t('expectedValue')}</strong> {t('expectedValueText')}
                </li>
              </ul>
            </div>
          </section>

          <AdBanner variant="footer" />
        </>
      )}
    </div>
  )
}

export default StatsPage

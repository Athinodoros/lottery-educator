import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useSessionStore } from '../store/useSessionStore'
import './HomePage.css'

function HomePage() {
  const { t } = useTranslation('home')
  const recordPageView = useSessionStore((state) => state.recordPageView)

  useEffect(() => {
    recordPageView('home')
  }, [recordPageView])

  return (
    <div className="home-page">
      <header className="hero">
        <h1>{t('title')}</h1>
        <p className="subtitle">{t('subtitle')}</p>
        <p className="description">
          {t('description')}
        </p>
        <Link to="/games" className="cta-button">
          {t('cta')}
        </Link>
      </header>

      <section className="features" aria-label="Key features">
        <div className="feature-card">
          <h2>{t('features.interactiveGames')}</h2>
          <p>{t('features.interactiveGamesDesc')}</p>
        </div>
        <div className="feature-card">
          <h2>{t('features.realStatistics')}</h2>
          <p>{t('features.realStatisticsDesc')}</p>
        </div>
        <div className="feature-card">
          <h2>{t('features.financialEducation')}</h2>
          <p>{t('features.financialEducationDesc')}</p>
        </div>
      </section>
    </div>
  )
}

export default HomePage

import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useGamesStore } from '../store/gamesStore'
import { useSessionStore } from '../store/useSessionStore'
import GameCard from '../components/GameCard'
import { SkeletonCard } from '../components/Skeleton'
import './GamesPage.css'

function GamesPage() {
  const { t } = useTranslation('games')
  const { games, isLoading, error, fetchGames } = useGamesStore()
  const recordPageView = useSessionStore((state) => state.recordPageView)

  useEffect(() => {
    fetchGames()
    recordPageView('games')
  }, [fetchGames, recordPageView])

  return (
    <div className="games-page">
      <header className="games-header">
        <div className="games-header-top">
          <div>
            <h1>{t('title')}</h1>
            <p>{t('subtitle')}</p>
          </div>
          <Link to="/games/create" className="create-game-link">
            {t('createGame')}
          </Link>
        </div>
      </header>

      {error && (
        <div className="error" role="alert">
          <h3>{t('errorTitle')}</h3>
          <p>{error}</p>
        </div>
      )}

      {isLoading && (
        <div className="games-grid" role="status" aria-label={t('loadingGames')}>
          <span className="sr-only">{t('loadingText')}</span>
          {[1, 2, 3, 4].map((i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      )}

      {!isLoading && games.length === 0 && !error && (
        <div className="empty">
          <h2>{t('noGamesTitle')}</h2>
          <p>{t('noGamesText')}</p>
        </div>
      )}

      {!isLoading && games.length > 0 && (
        <div className="games-grid">
          {games.map((game) => (
            <GameCard key={game.id} game={game} />
          ))}
        </div>
      )}
    </div>
  )
}

export default GamesPage

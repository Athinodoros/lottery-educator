import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useGamesStore } from '../store/gamesStore'
import { useSessionStore } from '../store/useSessionStore'
import GameCard from '../components/GameCard'
import { SkeletonCard } from '../components/Skeleton'
import './GamesPage.css'

function GamesPage() {
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
            <h1>Games</h1>
            <p>Select a lottery game to play and learn the odds.</p>
          </div>
          <Link to="/games/create" className="create-game-link">
            + Create a Game
          </Link>
        </div>
      </header>

      {error && (
        <div className="error" role="alert">
          <h3>Error Loading Games</h3>
          <p>{error}</p>
        </div>
      )}

      {isLoading && (
        <div className="games-grid" role="status" aria-label="Loading games">
          <span className="sr-only">Loading games...</span>
          {[1, 2, 3, 4].map((i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      )}

      {!isLoading && games.length === 0 && !error && (
        <div className="empty">
          <h2>No Games Available</h2>
          <p>Check back soon for lottery games to play.</p>
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

import { useEffect } from 'react'
import { useGamesStore } from '../store/gamesStore'
import { useSessionStore } from '../store/useSessionStore'
import GameCard from '../components/GameCard'
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
      <div className="games-header">
        <h1>Games</h1>
        <p>Select a lottery game to play and learn the odds.</p>
      </div>

      {error && (
        <div className="error">
          <h3>⚠️ Error Loading Games</h3>
          <p>{error}</p>
        </div>
      )}

      {isLoading && (
        <div className="loading">
          <div className="loading-spinner"></div>
          <p>Loading games...</p>
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

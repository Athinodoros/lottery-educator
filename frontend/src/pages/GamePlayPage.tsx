import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useGamesStore } from '../store/gamesStore'
import { useSessionStore } from '../store/useSessionStore'
import NumberSelector from '../components/NumberSelector'
import DrawAnimation from '../components/DrawAnimation'
import ResultsDisplay from '../components/ResultsDisplay'
import { Skeleton } from '../components/Skeleton'
import { Game, GameResult } from '../types'
import { gameApi } from '../api/games'
import './GamePlayPage.css'

function GamePlayPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { games } = useGamesStore()
  const recordPlay = useSessionStore((state) => state.recordPlay)
  const recordPageView = useSessionStore((state) => state.recordPageView)

  // Local state
  const [game, setGame] = useState<Game | null>(null)
  const [selectedNumbers, setSelectedNumbers] = useState<number[]>([])
  const [selectedExtra, setSelectedExtra] = useState<number[]>([])
  const [isPlaying, setIsPlaying] = useState(false)
  const [drawProgress, setDrawProgress] = useState(0)
  const [result, setResult] = useState<GameResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  const hasBonus = !!(game?.bonus_number_range && game?.bonus_numbers_to_select)

  // Load game details
  useEffect(() => {
    const loadGame = async () => {
      try {
        if (!id) {
          setError('Game ID not found')
          return
        }

        // Check if game is in store
        const gameFromStore = games.find((g) => g.id === id)
        if (gameFromStore) {
          setGame(gameFromStore)
        } else {
          // Fetch from API
          const fetchedGame = await gameApi.getGame(id)
          setGame(fetchedGame)
        }

        // Record page view
        recordPageView(`gameplay/${id}`)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load game')
      } finally {
        setLoading(false)
      }
    }

    loadGame()
  }, [id, games, recordPageView])

  const handleNumberToggle = (number: number) => {
    setSelectedNumbers((prev) => {
      if (prev.includes(number)) {
        return prev.filter((n) => n !== number)
      } else if (prev.length < (game?.numbers_to_select || 0)) {
        return [...prev, number]
      }
      return prev
    })
  }

  const handleExtraToggle = (number: number) => {
    setSelectedExtra((prev) => {
      if (prev.includes(number)) {
        return prev.filter((n) => n !== number)
      } else if (prev.length < (game?.bonus_numbers_to_select || 0)) {
        return [...prev, number]
      }
      return prev
    })
  }

  const mainComplete = selectedNumbers.length === (game?.numbers_to_select || 0)
  const bonusComplete = !hasBonus || selectedExtra.length === (game?.bonus_numbers_to_select || 0)
  const canPlay = mainComplete && bonusComplete

  const handlePlayGame = async () => {
    if (!id || !game || !canPlay) {
      return
    }

    setIsPlaying(true)
    setDrawProgress(0)
    setError(null)

    // Simulate draw progress
    const interval = setInterval(() => {
      setDrawProgress((prev) => {
        if (prev >= 90) {
          clearInterval(interval)
          return prev
        }
        return prev + Math.random() * 30
      })
    }, 200)

    try {
      const gameResult = await gameApi.playGame(
        id,
        selectedNumbers,
        hasBonus ? selectedExtra : undefined
      )
      setDrawProgress(100)

      // Record play for tracking
      recordPlay(id)

      // Show result after animation completes
      setTimeout(() => {
        setResult(gameResult)
        setIsPlaying(false)
      }, 400)
    } catch (err) {
      clearInterval(interval)
      setError(err instanceof Error ? err.message : 'Failed to play game')
      setIsPlaying(false)
    }
  }

  const handlePlayAgain = () => {
    setSelectedNumbers([])
    setSelectedExtra([])
    setResult(null)
    setDrawProgress(0)
  }

  const [rerunRequested, setRerunRequested] = useState(false)

  const handleRerun = () => {
    setResult(null)
    setDrawProgress(0)
    setRerunRequested(true)
  }

  useEffect(() => {
    if (rerunRequested && !result && !isPlaying) {
      setRerunRequested(false)
      handlePlayGame()
    }
  }, [rerunRequested, result, isPlaying])

  const handleBackToGames = () => {
    navigate('/games')
  }

  if (loading) {
    return (
      <div className="game-play-page" role="status" aria-label="Loading game">
        <span className="sr-only">Loading game...</span>
        <div className="game-header">
          <Skeleton width="80px" height="36px" borderRadius="8px" />
          <div style={{ flex: 1 }}>
            <Skeleton width="200px" height="28px" />
            <Skeleton width="300px" height="16px" />
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(48px, 1fr))', gap: '8px', padding: '24px' }}>
          {Array.from({ length: 20 }).map((_, i) => (
            <Skeleton key={i} width="48px" height="48px" borderRadius="8px" />
          ))}
        </div>
      </div>
    )
  }

  if (!game) {
    return (
      <div className="game-play-page error-state">
        <div className="error-box" role="alert">
          <h2>Game Not Found</h2>
          <p>{error || 'Could not load this game'}</p>
          <button className="back-button" onClick={handleBackToGames}>
            Back to Games
          </button>
        </div>
      </div>
    )
  }

  const bonusLabel = game.bonus_numbers_to_select === 1 ? 'bonus number' : 'bonus numbers'

  return (
    <div className="game-play-page">
      <div className="game-header">
        <button className="back-button" onClick={handleBackToGames} aria-label="Back to games list">
          &#8592; Back
        </button>
        <div>
          <h1>{game.name}</h1>
          {game.description && <p className="game-description">{game.description}</p>}
        </div>
      </div>

      {error && (
        <div className="error-banner" role="alert">
          <span aria-hidden="true">&#9888;</span>
          <p>{error}</p>
        </div>
      )}

      {!result ? (
        <div className="game-content">
          <NumberSelector
            minNumber={game.number_range[0]}
            maxNumber={game.number_range[game.number_range.length - 1]}
            numbersToSelect={game.numbers_to_select}
            selectedNumbers={selectedNumbers}
            onNumberToggle={handleNumberToggle}
            disabled={isPlaying}
          />

          {hasBonus && game.bonus_number_range && game.bonus_numbers_to_select && (
            <NumberSelector
              minNumber={game.bonus_number_range[0]}
              maxNumber={game.bonus_number_range[1]}
              numbersToSelect={game.bonus_numbers_to_select}
              selectedNumbers={selectedExtra}
              onNumberToggle={handleExtraToggle}
              disabled={isPlaying}
            />
          )}

          <div className="play-button-container">
            <button
              className="play-button"
              onClick={handlePlayGame}
              disabled={!canPlay || isPlaying}
              aria-label={isPlaying ? 'Drawing numbers in progress' : 'Play game'}
            >
              {isPlaying ? 'Drawing...' : 'Play Game'}
            </button>
            {!canPlay && selectedNumbers.length > 0 && (
              <p className="selection-hint" aria-live="polite">
                {!mainComplete && (
                  <>Select {game.numbers_to_select - selectedNumbers.length} more main number{game.numbers_to_select - selectedNumbers.length !== 1 ? 's' : ''}</>
                )}
                {mainComplete && !bonusComplete && hasBonus && (
                  <>Select {(game.bonus_numbers_to_select || 0) - selectedExtra.length} more {bonusLabel}</>
                )}
              </p>
            )}
          </div>

          <div className="game-info">
            <div className="info-card">
              <h4>How to Play</h4>
              <ol>
                <li>Select {game.numbers_to_select} numbers from {game.number_range[0]} to{' '}
                  {game.number_range[game.number_range.length - 1]}</li>
                {hasBonus && game.bonus_number_range && (
                  <li>Select {game.bonus_numbers_to_select} {bonusLabel} from {game.bonus_number_range[0]} to {game.bonus_number_range[1]}</li>
                )}
                <li>Click the Play button to start the draw</li>
                <li>Watch as the lottery simulates drawings until your numbers match</li>
                <li>See how many draws it takes!</li>
              </ol>
            </div>

            {game.probability_of_winning && (
              <div className="info-card">
                <h4>Your Odds</h4>
                <p>
                  Your chance of winning this game on any single draw is approximately{' '}
                  <strong>1 in {Math.round(1 / game.probability_of_winning)}</strong>
                </p>
                <p className="odds-note">
                  This is why understanding lottery odds matters for your financial health!
                </p>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="results-container">
          <ResultsDisplay result={result} />
          <div className="results-actions">
            <button className="play-again-button" onClick={handleRerun}>
              Rerun Same Numbers
            </button>
            <button className="play-again-button secondary" onClick={handlePlayAgain}>
              Pick New Numbers
            </button>
            <button className="back-button secondary" onClick={handleBackToGames}>
              Back to Games
            </button>
          </div>
        </div>
      )}

      <DrawAnimation
        isDrawing={isPlaying}
        progress={drawProgress}
        message="Simulating lottery draws..."
      />
    </div>
  )
}

export default GamePlayPage

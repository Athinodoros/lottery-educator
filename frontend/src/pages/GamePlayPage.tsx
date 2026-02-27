import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useGamesStore } from '../store/gamesStore'
import { useSessionStore } from '../store/useSessionStore'
import NumberSelector from '../components/NumberSelector'
import DrawAnimation from '../components/DrawAnimation'
import ResultsDisplay from '../components/ResultsDisplay'
import { Skeleton } from '../components/Skeleton'
import { Game, GameResult } from '../types'
import { gameApi } from '../api/games'
import { formatNumber } from '../utils/formatNumber'
import AdBanner from '../components/AdBanner'
import OddsPerspective from '../components/OddsPerspective'
import './GamePlayPage.css'

function GamePlayPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { t, i18n } = useTranslation('gameplay')
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
  const lng = i18n.language

  // Load game details
  useEffect(() => {
    const loadGame = async () => {
      try {
        if (!id) {
          setError(t('gameIdNotFound'))
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
        setError(err instanceof Error ? err.message : t('failedToLoad'))
      } finally {
        setLoading(false)
      }
    }

    loadGame()
  }, [id, games, recordPageView, t])

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

  useEffect(() => {
    if (result) {
      const scroller = document.querySelector('.main-wrapper')
      if (scroller) {
        scroller.scrollTo({ top: 0, behavior: 'instant' })
      }
    }
  }, [result])

  const handleBackToGames = () => {
    navigate('/games')
  }

  if (loading) {
    return (
      <div className="game-play-page" role="status" aria-label={t('loadingGame')}>
        <span className="sr-only">{t('loadingText')}</span>
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
          <h2>{t('gameNotFound')}</h2>
          <p>{error || t('couldNotLoad')}</p>
          <button className="back-button" onClick={handleBackToGames}>
            {t('backToGames')}
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="game-play-page">
      <div className="game-header">
        <button className="back-button" onClick={handleBackToGames} aria-label={t('backAriaLabel')}>
          {t('back')}
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
              aria-label={isPlaying ? t('drawingAriaLabel') : t('playAriaLabel')}
            >
              {isPlaying ? t('drawing') : t('playGame')}
            </button>
            {!canPlay && selectedNumbers.length > 0 && (
              <p className="selection-hint" aria-live="polite">
                {!mainComplete && (
                  <>{t('selectMoreMain', { count: game.numbers_to_select - selectedNumbers.length })}</>
                )}
                {mainComplete && !bonusComplete && hasBonus && (
                  <>{t('selectMoreBonus', { count: (game.bonus_numbers_to_select || 0) - selectedExtra.length })}</>
                )}
              </p>
            )}
          </div>

          <div className="game-info">
            <div className="info-card">
              <h4>{t('howToPlay')}</h4>
              <ol>
                <li>{t('howToPlayStep1', { count: game.numbers_to_select, min: game.number_range[0], max: game.number_range[game.number_range.length - 1] })}</li>
                {hasBonus && game.bonus_number_range && (
                  <li>{t('howToPlayStep2', { count: game.bonus_numbers_to_select || 1, min: game.bonus_number_range[0], max: game.bonus_number_range[1] })}</li>
                )}
                <li>{t('howToPlayStep3')}</li>
                <li>{t('howToPlayStep4')}</li>
                <li>{t('howToPlayStep5')}</li>
              </ol>
            </div>

            {game.probability_of_winning && (
              <div className="info-card">
                <h4>{t('yourOdds')}</h4>
                <p dangerouslySetInnerHTML={{ __html: t('oddsDescription', { odds: formatNumber(Math.round(1 / game.probability_of_winning), lng) }) }} />
                <p className="odds-note">
                  {t('oddsNote')}
                </p>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="results-container">
          <ResultsDisplay result={result} />

          <OddsPerspective expectedDraws={result.draws_to_win} gameName={game.name} />

          <AdBanner variant="inline" />

          <div className="results-actions">
            <button className="play-again-button" onClick={handleRerun}>
              {t('rerunSameNumbers')}
            </button>
            <button className="play-again-button secondary" onClick={handlePlayAgain}>
              {t('pickNewNumbers')}
            </button>
            <button className="back-button secondary" onClick={handleBackToGames}>
              {t('backToGames')}
            </button>
          </div>
        </div>
      )}

      <DrawAnimation
        isDrawing={isPlaying}
        progress={drawProgress}
        message={t('simulatingDraws')}
      />
    </div>
  )
}

export default GamePlayPage

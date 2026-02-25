import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Game } from '../types'
import './GameCard.css'

interface GameCardProps {
  game: Game
}

export function GameCard({ game }: GameCardProps) {
  const { t } = useTranslation('games')

  // Extract number range info
  const minNum = game.number_range[0] || 1
  const maxNum = game.number_range[game.number_range.length - 1] || 49
  const numSelect = game.numbers_to_select

  const hasBonus = !!(game.bonus_number_range && game.bonus_numbers_to_select)

  return (
    <div className="game-card">
      <div className="game-card-header">
        <h3>{game.name}</h3>
      </div>

      <p className="game-card-description">{game.description}</p>

      <div className="game-card-info">
        <div className="info-item">
          <span className="info-label">{t('card.pick')}</span>
          <span className="info-value">{numSelect}</span>
        </div>
        <div className="info-item">
          <span className="info-label">{t('card.from')}</span>
          <span className="info-value">{minNum}-{maxNum}</span>
        </div>
        {hasBonus && game.bonus_number_range && (
          <div className="info-item">
            <span className="info-label">{t('card.bonus')}</span>
            <span className="info-value">+{game.bonus_numbers_to_select} ({game.bonus_number_range[0]}-{game.bonus_number_range[1]})</span>
          </div>
        )}
        {game.probability_of_winning && (
          <div className="info-item">
            <span className="info-label">{t('card.odds')}</span>
            <span className="info-value">{t('card.oddsValue', { value: Math.round(1 / game.probability_of_winning) })}</span>
          </div>
        )}
      </div>

      <div className="game-card-actions">
        <Link to={`/games/${game.id}`} className="play-button">
          {t('card.playGame')}
        </Link>
        <Link to={`/stats/${game.id}`} className="stats-button">
          {t('card.viewStats')}
        </Link>
      </div>
    </div>
  )
}

export default GameCard

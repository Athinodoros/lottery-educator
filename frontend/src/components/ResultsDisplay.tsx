import { useTranslation } from 'react-i18next'
import { GameResult } from '../types'
import { formatNumber } from '../utils/formatNumber'
import './ResultsDisplay.css'

interface ResultsDisplayProps {
  result: GameResult
}

export function ResultsDisplay({ result }: ResultsDisplayProps) {
  const { t, i18n } = useTranslation('gameplay')
  const lng = i18n.language

  const matchCount = result.selected_numbers.filter((num) =>
    result.winning_numbers.includes(num)
  ).length

  const hasBonus = !!(result.winning_extra && result.winning_extra.length > 0)
  const bonusMatchCount = result.matched_bonus ?? 0

  const bonusSuffix = hasBonus ? t('results.plusBonus', { count: bonusMatchCount }) : ''

  return (
    <div className={`results-display ${result.is_winner ? 'winner' : 'loser'}`}>
      <div className="results-header">
        {result.is_winner ? (
          <>
            <div className="results-icon winner-icon">🎉</div>
            <h2>{t('results.youWon')}</h2>
            <p className="results-subtitle">
              {t('results.matchedNumbers', { count: matchCount })}{bonusSuffix}
            </p>
          </>
        ) : (
          <>
            <div className="results-icon loser-icon">😅</div>
            <h2>{t('results.betterLuck')}</h2>
            <p className="results-subtitle">
              {t('results.matchedNumbersLoss', { count: matchCount })}{bonusSuffix}
            </p>
          </>
        )}
      </div>

      <div className="results-body">
        <div className="results-stat">
          <span className="stat-label">{t('results.drawsRequired')}</span>
          <span className="stat-value">{formatNumber(result.draws_to_win, lng)}</span>
        </div>

        <div className="results-boxes">
          <div className="results-box">
            <h4>{t('results.yourNumbers')}</h4>
            <div className="numbers-list">
              {result.selected_numbers.map((num) => (
                <div
                  key={num}
                  className={`number-badge ${
                    result.winning_numbers.includes(num) ? 'match' : ''
                  }`}
                >
                  {num}
                </div>
              ))}
            </div>
          </div>

          <div className="results-box">
            <h4>{t('results.winningNumbers')}</h4>
            <div className="numbers-list">
              {result.winning_numbers.map((num) => (
                <div key={num} className="number-badge winning">
                  {num}
                </div>
              ))}
            </div>
          </div>
        </div>

        {hasBonus && result.selected_extra && result.winning_extra && (
          <div className="results-boxes bonus-results">
            <div className="results-box">
              <h4>{t('results.yourBonusNumbers')}</h4>
              <div className="numbers-list">
                {result.selected_extra.map((num) => (
                  <div
                    key={`extra-${num}`}
                    className={`number-badge bonus ${
                      result.winning_extra!.includes(num) ? 'match' : ''
                    }`}
                  >
                    {num}
                  </div>
                ))}
              </div>
            </div>

            <div className="results-box">
              <h4>{t('results.winningBonusNumbers')}</h4>
              <div className="numbers-list">
                {result.winning_extra.map((num) => (
                  <div key={`wextra-${num}`} className="number-badge bonus winning">
                    {num}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        <div className="results-stats">
          <div className="stat">
            <span className="label">{t('results.matchedNumbersStat')}</span>
            <span className="value">{matchCount}</span>
          </div>
          {hasBonus && (
            <div className="stat">
              <span className="label">{t('results.matchedBonus')}</span>
              <span className="value">{bonusMatchCount}</span>
            </div>
          )}
          <div className="stat">
            <span className="label">{t('results.totalSelected')}</span>
            <span className="value">{result.selected_numbers.length}{hasBonus && result.selected_extra ? ` + ${result.selected_extra.length}` : ''}</span>
          </div>
        </div>
      </div>

      <div className="results-footer">
        <p className="fact">
          {t('results.fact', { draws: formatNumber(result.draws_to_win, lng) })}
        </p>
      </div>
    </div>
  )
}

export default ResultsDisplay

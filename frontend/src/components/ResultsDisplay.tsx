import { GameResult } from '../types'
import './ResultsDisplay.css'

interface ResultsDisplayProps {
  result: GameResult
}

export function ResultsDisplay({ result }: ResultsDisplayProps) {
  const matchCount = result.selected_numbers.filter((num) =>
    result.winning_numbers.includes(num)
  ).length

  const hasBonus = !!(result.winning_extra && result.winning_extra.length > 0)
  const bonusMatchCount = result.matched_bonus ?? 0

  return (
    <div className={`results-display ${result.is_winner ? 'winner' : 'loser'}`}>
      <div className="results-header">
        {result.is_winner ? (
          <>
            <div className="results-icon winner-icon">🎉</div>
            <h2>You Won!</h2>
            <p className="results-subtitle">
              Congratulations! You matched {matchCount} number{matchCount !== 1 ? 's' : ''}
              {hasBonus && ` + ${bonusMatchCount} bonus`}
            </p>
          </>
        ) : (
          <>
            <div className="results-icon loser-icon">😅</div>
            <h2>Better Luck Next Time</h2>
            <p className="results-subtitle">
              You matched {matchCount} number{matchCount !== 1 ? 's' : ''}
              {hasBonus && ` + ${bonusMatchCount} bonus`}
            </p>
          </>
        )}
      </div>

      <div className="results-body">
        <div className="results-stat">
          <span className="stat-label">Draws Required</span>
          <span className="stat-value">{result.draws_to_win.toLocaleString('de-DE')}</span>
        </div>

        <div className="results-boxes">
          <div className="results-box">
            <h4>Your Numbers</h4>
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
            <h4>Winning Numbers</h4>
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
              <h4>Your Bonus Numbers</h4>
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
              <h4>Winning Bonus Numbers</h4>
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
            <span className="label">Matched Numbers</span>
            <span className="value">{matchCount}</span>
          </div>
          {hasBonus && (
            <div className="stat">
              <span className="label">Matched Bonus</span>
              <span className="value">{bonusMatchCount}</span>
            </div>
          )}
          <div className="stat">
            <span className="label">Total Selected</span>
            <span className="value">{result.selected_numbers.length}{hasBonus && result.selected_extra ? ` + ${result.selected_extra.length}` : ''}</span>
          </div>
        </div>
      </div>

      <div className="results-footer">
        <p className="fact">
          This is why lottery odds matter - on average, you need {result.draws_to_win.toLocaleString('de-DE')}{' '}
          draws to win the jackpot!
        </p>
      </div>
    </div>
  )
}

export default ResultsDisplay

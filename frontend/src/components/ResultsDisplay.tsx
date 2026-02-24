import { GameResult } from '../types'
import './ResultsDisplay.css'

interface ResultsDisplayProps {
  result: GameResult
}

export function ResultsDisplay({ result }: ResultsDisplayProps) {
  const matchCount = result.selected_numbers.filter((num) =>
    result.winning_numbers.includes(num)
  ).length

  return (
    <div className={`results-display ${result.is_winner ? 'winner' : 'loser'}`}>
      <div className="results-header">
        {result.is_winner ? (
          <>
            <div className="results-icon winner-icon">🎉</div>
            <h2>You Won!</h2>
            <p className="results-subtitle">
              Congratulations! You matched {matchCount} number{matchCount !== 1 ? 's' : ''}
            </p>
          </>
        ) : (
          <>
            <div className="results-icon loser-icon">😅</div>
            <h2>Better Luck Next Time</h2>
            <p className="results-subtitle">
              You matched {matchCount} number{matchCount !== 1 ? 's' : ''}
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

        <div className="results-stats">
          <div className="stat">
            <span className="label">Matched Numbers</span>
            <span className="value">{matchCount}</span>
          </div>
          <div className="stat">
            <span className="label">Total Selected</span>
            <span className="value">{result.selected_numbers.length}</span>
          </div>
          <div className="stat">
            <span className="label">Odds</span>
            <span className="value">
              1 in {Math.round(1 / (1 - matchCount / result.selected_numbers.length))}
            </span>
          </div>
        </div>
      </div>

      <div className="results-footer">
        <p className="fact">
          This is why lottery odds matter - on average, you need {result.draws_to_win.toLocaleString('de-DE')}{' '}
          draws to match {matchCount} number{matchCount !== 1 ? 's' : ''}!
        </p>
      </div>
    </div>
  )
}

export default ResultsDisplay

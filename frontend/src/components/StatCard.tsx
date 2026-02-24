import './StatCard.css'

interface StatCardProps {
  name?: string
  totalPlays?: number
  totalWins?: number
  winRate?: number
  avgDraws?: number
  onClick?: () => void
  label?: string
  value?: string | number
}

export function StatCard({
  name = 'N/A',
  totalPlays = 0,
  totalWins = 0,
  winRate = 0,
  avgDraws = 0,
  onClick,
  label,
  value,
}: StatCardProps) {
  // Handle simple label/value display
  if (label && value !== undefined) {
    return (
      <div className="stat-card" onClick={onClick} role="button" tabIndex={0}>
        <div className="stat-card-header">
          <h3>{label}</h3>
        </div>
        <div className="stat-card-stats">
          <div className="stat-item">
            <span className="stat-value" style={{ fontSize: '1.5em' }}>
              {value}
            </span>
          </div>
        </div>
      </div>
    )
  }

  // Handle full game statistics display
  return (
    <div className="stat-card" onClick={onClick} role="button" tabIndex={0}>
      <div className="stat-card-header">
        <h3>{name}</h3>
      </div>

      <div className="stat-card-stats">
        <div className="stat-item">
          <span className="stat-label">Total Plays</span>
          <span className="stat-value">{totalPlays}</span>
        </div>
        <div className="stat-item">
          <span className="stat-label">Total Wins</span>
          <span className="stat-value">{totalWins}</span>
        </div>
        <div className="stat-item">
          <span className="stat-label">Win Rate</span>
          <span className="stat-value">{(winRate || 0).toFixed(2)}%</span>
        </div>
        <div className="stat-item">
          <span className="stat-label">Avg Draws</span>
          <span className="stat-value">{(avgDraws || 0).toFixed(1)}</span>
        </div>
      </div>

      <div className="stat-card-progress">
        <div className="progress-bar">
          <div className="progress-fill" style={{ width: `${Math.min((winRate || 0) * 10, 100)}%` }}></div>
        </div>
        <p className="progress-label">Win rate: {(winRate || 0).toFixed(2)}%</p>
      </div>

      {onClick && <div className="stat-card-arrow">→</div>}
    </div>
  )
}

export default StatCard

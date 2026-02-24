import { useState, useEffect, useCallback } from 'react'
import apiClient from '../api/client'
import './AdminPage.css'

interface AdminOverview {
  total_games: number
  total_plays: number
  total_wins: number
  global_win_rate: number
  top_game: { name: string; play_count: number } | null
}

interface ClickMetricItem {
  link_id: string
  click_count: number
  percentage: string
}

interface EmailItem {
  id: string
  sender_email: string
  subject: string
  body: string
  created_at: string
  is_deleted: boolean
}

interface GameStat {
  game_id: string
  name: string
  total_plays: number
  total_wins: number
  avg_draws_to_win: number
  win_rate_percent: number
}

interface ServiceStatus {
  game_engine: string
  statistics: string
  metrics: string
}

interface DashboardData {
  overview: AdminOverview
  games: any[]
  statistics: GameStat[]
  click_metrics: { total_clicks: number; by_link: ClickMetricItem[] }
  services: ServiceStatus
  timestamp: string
}

type Tab = 'overview' | 'emails' | 'metrics' | 'games'

function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [token, setToken] = useState('')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [loginError, setLoginError] = useState('')
  const [loginLoading, setLoginLoading] = useState(false)

  const [activeTab, setActiveTab] = useState<Tab>('overview')
  const [dashboard, setDashboard] = useState<DashboardData | null>(null)
  const [emails, setEmails] = useState<EmailItem[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // Check for existing token on mount
  useEffect(() => {
    const savedToken = localStorage.getItem('admin_token')
    if (savedToken) {
      setToken(savedToken)
      setIsAuthenticated(true)
    }
  }, [])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoginError('')
    setLoginLoading(true)

    try {
      const response = await apiClient.post('/admin/login', { username, password })
      const newToken = response.data.token
      setToken(newToken)
      setIsAuthenticated(true)
      localStorage.setItem('admin_token', newToken)
      setPassword('')
    } catch (err: any) {
      setLoginError(err.response?.data?.error || 'Login failed')
    } finally {
      setLoginLoading(false)
    }
  }

  const handleLogout = async () => {
    try {
      await apiClient.post('/admin/logout', {}, {
        headers: { Authorization: `Bearer ${token}` },
      })
    } catch {
      // Ignore logout errors
    }
    setToken('')
    setIsAuthenticated(false)
    setDashboard(null)
    setEmails([])
    localStorage.removeItem('admin_token')
  }

  const loadDashboard = useCallback(async () => {
    if (!token) return
    setLoading(true)
    setError('')
    try {
      const response = await apiClient.get('/admin/dashboard', {
        headers: { Authorization: `Bearer ${token}` },
      })
      setDashboard(response.data)
    } catch (err: any) {
      if (err.response?.status === 401) {
        handleLogout()
        return
      }
      setError('Failed to load dashboard data. Are backend services running?')
    } finally {
      setLoading(false)
    }
  }, [token])

  const loadEmails = useCallback(async () => {
    if (!token) return
    setLoading(true)
    try {
      const response = await apiClient.get('/admin/emails', {
        headers: { Authorization: `Bearer ${token}` },
      })
      setEmails(Array.isArray(response.data) ? response.data : [])
    } catch (err: any) {
      if (err.response?.status === 401) {
        handleLogout()
        return
      }
      setEmails([])
    } finally {
      setLoading(false)
    }
  }, [token])

  const deleteEmail = async (emailId: string) => {
    if (!confirm('Are you sure you want to delete this email?')) return
    try {
      await apiClient.delete(`/admin/emails/${emailId}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      setEmails(prev => prev.filter(e => e.id !== emailId))
    } catch (err: any) {
      alert('Failed to delete email')
    }
  }

  // Load data when authenticated or tab changes
  useEffect(() => {
    if (!isAuthenticated) return
    if (activeTab === 'emails') {
      loadEmails()
    } else {
      loadDashboard()
    }
  }, [isAuthenticated, activeTab, loadDashboard, loadEmails])

  // ── Login Screen ──────────────────────────────────────────────────
  if (!isAuthenticated) {
    return (
      <div className="admin-page">
        <div className="login-container">
          <div className="login-card">
            <h1>Admin Login</h1>
            <p>Enter your credentials to access the dashboard</p>

            <form onSubmit={handleLogin} className="login-form">
              {loginError && (
                <div className="login-error">{loginError}</div>
              )}
              <div className="form-group">
                <label htmlFor="username">Username</label>
                <input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Enter username"
                  required
                  autoComplete="username"
                />
              </div>
              <div className="form-group">
                <label htmlFor="password">Password</label>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter password"
                  required
                  autoComplete="current-password"
                />
              </div>
              <button
                type="submit"
                className="login-btn"
                disabled={loginLoading || !username || !password}
              >
                {loginLoading ? 'Signing in...' : 'Sign In'}
              </button>
            </form>
          </div>
        </div>
      </div>
    )
  }

  // ── Dashboard ─────────────────────────────────────────────────────
  return (
    <div className="admin-page">
      <div className="admin-header">
        <div className="admin-header-top">
          <div>
            <h1>Admin Dashboard</h1>
            <p>System statistics and platform analytics</p>
          </div>
          <button onClick={handleLogout} className="logout-btn">
            Sign Out
          </button>
        </div>

        <div className="admin-tabs">
          {(['overview', 'emails', 'metrics', 'games'] as Tab[]).map(tab => (
            <button
              key={tab}
              className={`tab-btn ${activeTab === tab ? 'active' : ''}`}
              onClick={() => setActiveTab(tab)}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {error && (
        <div className="error-banner">
          <span>!</span>
          <p>{error}</p>
        </div>
      )}

      {loading && (
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Loading data...</p>
        </div>
      )}

      {/* ── Overview Tab ────────────────────────────── */}
      {!loading && activeTab === 'overview' && dashboard && (
        <>
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-label">Total Games</div>
              <div className="stat-value">{dashboard.overview.total_games}</div>
              <p className="stat-desc">Available lottery games</p>
            </div>
            <div className="stat-card highlight">
              <div className="stat-label">Total Plays</div>
              <div className="stat-value">{dashboard.overview.total_plays.toLocaleString()}</div>
              <p className="stat-desc">Cumulative game plays</p>
            </div>
            <div className="stat-card highlight">
              <div className="stat-label">Total Wins</div>
              <div className="stat-value">{dashboard.overview.total_wins.toLocaleString()}</div>
              <p className="stat-desc">Winning outcomes</p>
            </div>
            <div className="stat-card">
              <div className="stat-label">Win Rate</div>
              <div className="stat-value">{dashboard.overview.global_win_rate.toFixed(2)}%</div>
              <p className="stat-desc">Global winning percentage</p>
            </div>
          </div>

          <div className="admin-sections">
            {dashboard.overview.top_game && (
              <section className="admin-section">
                <h2>Top Performing Game</h2>
                <div className="info-box">
                  <h3>{dashboard.overview.top_game.name}</h3>
                  <p className="info-value">{dashboard.overview.top_game.play_count.toLocaleString()} plays</p>
                </div>
              </section>
            )}

            <section className="admin-section">
              <h2>Service Health</h2>
              <div className="services-grid">
                {Object.entries(dashboard.services).map(([name, status]) => (
                  <div key={name} className={`service-item ${status}`}>
                    <span className={`status-dot ${status}`}></span>
                    <span className="service-name">{name.replace('_', ' ')}</span>
                    <span className={`service-status ${status}`}>{status}</span>
                  </div>
                ))}
              </div>
            </section>

            <section className="admin-section">
              <h2>Click Metrics Summary</h2>
              <div className="info-box">
                <h3>Total Clicks</h3>
                <p className="info-value">{dashboard.click_metrics.total_clicks.toLocaleString()}</p>
              </div>
              {dashboard.click_metrics.by_link.length > 0 && (
                <div className="metrics-bars">
                  {dashboard.click_metrics.by_link.slice(0, 5).map(m => (
                    <div key={m.link_id} className="metric-bar-row">
                      <span className="metric-label">{m.link_id}</span>
                      <div className="metric-bar-track">
                        <div
                          className="metric-bar-fill"
                          style={{ width: `${Math.min(parseFloat(m.percentage), 100)}%` }}
                        ></div>
                      </div>
                      <span className="metric-pct">{m.percentage}%</span>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </div>

          <div className="dashboard-footer">
            <p>Last updated: {new Date(dashboard.timestamp).toLocaleString()}</p>
            <button onClick={loadDashboard} className="refresh-btn">Refresh</button>
          </div>
        </>
      )}

      {/* ── Emails Tab ──────────────────────────────── */}
      {!loading && activeTab === 'emails' && (
        <div className="admin-section full-width">
          <h2>Contact Form Submissions</h2>
          {emails.length === 0 ? (
            <p className="no-data">No emails submitted yet</p>
          ) : (
            <div className="email-list">
              <div className="email-header-row">
                <span>From</span>
                <span>Subject</span>
                <span>Date</span>
                <span>Actions</span>
              </div>
              {emails.filter(e => !e.is_deleted).map(email => (
                <div key={email.id} className="email-row">
                  <span className="email-from">{email.sender_email}</span>
                  <span className="email-subject">{email.subject}</span>
                  <span className="email-date">
                    {new Date(email.created_at).toLocaleDateString()}
                  </span>
                  <button
                    className="delete-btn"
                    onClick={() => deleteEmail(email.id)}
                    title="Delete email"
                  >
                    Delete
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── Metrics Tab ─────────────────────────────── */}
      {!loading && activeTab === 'metrics' && dashboard && (
        <div className="admin-section full-width">
          <h2>Click Tracking Metrics</h2>
          <div className="metrics-summary">
            <div className="stat-card">
              <div className="stat-label">Total Clicks</div>
              <div className="stat-value">{dashboard.click_metrics.total_clicks.toLocaleString()}</div>
            </div>
            <div className="stat-card">
              <div className="stat-label">Tracked Links</div>
              <div className="stat-value">{dashboard.click_metrics.by_link.length}</div>
            </div>
          </div>
          {dashboard.click_metrics.by_link.length === 0 ? (
            <p className="no-data">No click data recorded yet</p>
          ) : (
            <div className="metrics-table">
              <div className="metrics-table-header">
                <span>Link ID</span>
                <span>Clicks</span>
                <span>Percentage</span>
                <span>Distribution</span>
              </div>
              {dashboard.click_metrics.by_link.map(m => (
                <div key={m.link_id} className="metrics-table-row">
                  <span className="link-id">{m.link_id}</span>
                  <span className="click-count">{m.click_count.toLocaleString()}</span>
                  <span className="click-pct">{m.percentage}%</span>
                  <div className="mini-bar-track">
                    <div
                      className="mini-bar-fill"
                      style={{ width: `${Math.min(parseFloat(m.percentage), 100)}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── Games Tab ───────────────────────────────── */}
      {!loading && activeTab === 'games' && dashboard && (
        <div className="admin-section full-width">
          <h2>Game Statistics</h2>
          {dashboard.statistics.length === 0 ? (
            <p className="no-data">No game statistics available</p>
          ) : (
            <div className="games-stats-table">
              <div className="games-stats-header">
                <span>Game</span>
                <span>Plays</span>
                <span>Wins</span>
                <span>Win Rate</span>
                <span>Avg Draws</span>
              </div>
              {dashboard.statistics.map(stat => (
                <div key={stat.game_id} className="games-stats-row">
                  <span className="game-name">{stat.name || stat.game_id}</span>
                  <span>{stat.total_plays.toLocaleString()}</span>
                  <span>{stat.total_wins.toLocaleString()}</span>
                  <span className="win-rate">{stat.win_rate_percent.toFixed(2)}%</span>
                  <span>{stat.avg_draws_to_win.toLocaleString()}</span>
                </div>
              ))}
            </div>
          )}

          <h2 style={{ marginTop: '32px' }}>Available Games</h2>
          <div className="games-list">
            {dashboard.games.map((game: any) => (
              <div key={game.id} className="game-item">
                <div className="game-header">
                  <span className="game-name">{game.name}</span>
                  <span className="game-id">ID: {game.id?.substring(0, 8)}...</span>
                </div>
                {game.description && <p className="game-description">{game.description}</p>}
                <div className="game-meta">
                  <span className="meta-item">Numbers: {game.numbers_to_select}</span>
                  <span className="meta-item">Range: 1-{game.number_range?.length || '?'}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default AdminPage

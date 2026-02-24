import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import AdminPage from '../../pages/AdminPage'

// Mock apiClient
const mockPost = vi.fn()
const mockGet = vi.fn()
const mockDelete = vi.fn()

vi.mock('../../api/client', () => ({
  default: {
    post: (...args: any[]) => mockPost(...args),
    get: (...args: any[]) => mockGet(...args),
    delete: (...args: any[]) => mockDelete(...args),
    interceptors: { response: { use: vi.fn() } },
  },
}))

const renderAdmin = () =>
  render(
    <BrowserRouter>
      <AdminPage />
    </BrowserRouter>
  )

describe('Admin Page - Integration Test', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    localStorage.clear()
  })

  afterEach(() => {
    localStorage.clear()
  })

  describe('Login screen', () => {
    it('should show login form when not authenticated', () => {
      renderAdmin()
      expect(screen.getByRole('heading', { level: 1, name: /Admin Login/i })).toBeTruthy()
      expect(screen.getByLabelText(/Username/i)).toBeTruthy()
      expect(screen.getByLabelText(/Password/i)).toBeTruthy()
      expect(screen.getByRole('button', { name: /Sign In/i })).toBeTruthy()
    })

    it('should disable login button when fields are empty', () => {
      renderAdmin()
      const btn = screen.getByRole('button', { name: /Sign In/i })
      expect(btn).toBeDisabled()
    })

    it('should enable login button when fields are filled', () => {
      renderAdmin()
      fireEvent.change(screen.getByLabelText(/Username/i), { target: { value: 'admin' } })
      fireEvent.change(screen.getByLabelText(/Password/i), { target: { value: 'pass' } })
      const btn = screen.getByRole('button', { name: /Sign In/i })
      expect(btn).not.toBeDisabled()
    })

    it('should show error on invalid credentials', async () => {
      mockPost.mockRejectedValueOnce({
        response: { data: { error: 'Invalid credentials' } },
      })
      renderAdmin()
      fireEvent.change(screen.getByLabelText(/Username/i), { target: { value: 'bad' } })
      fireEvent.change(screen.getByLabelText(/Password/i), { target: { value: 'wrong' } })
      fireEvent.click(screen.getByRole('button', { name: /Sign In/i }))
      await waitFor(() => {
        expect(screen.getByText(/Invalid credentials/i)).toBeTruthy()
      })
    })

    it('should login and show dashboard on valid credentials', async () => {
      mockPost.mockResolvedValueOnce({ data: { token: 'test-token-123' } })
      mockGet.mockResolvedValueOnce({
        data: {
          overview: { total_games: 3, total_plays: 1000, total_wins: 50, global_win_rate: 5.0, top_game: null },
          games: [],
          statistics: [],
          click_metrics: { total_clicks: 0, by_link: [] },
          services: { game_engine: 'ok', statistics: 'ok', metrics: 'ok' },
          timestamp: new Date().toISOString(),
        },
      })

      renderAdmin()
      fireEvent.change(screen.getByLabelText(/Username/i), { target: { value: 'admin' } })
      fireEvent.change(screen.getByLabelText(/Password/i), { target: { value: 'pass' } })
      fireEvent.click(screen.getByRole('button', { name: /Sign In/i }))

      await waitFor(() => {
        expect(screen.getByRole('heading', { level: 1, name: /Admin Dashboard/i })).toBeTruthy()
      })
    })
  })

  describe('Dashboard (authenticated)', () => {
    beforeEach(() => {
      localStorage.setItem('admin_token', 'saved-token')
    })

    it('should auto-login with saved token and load dashboard', async () => {
      mockGet.mockResolvedValueOnce({
        data: {
          overview: { total_games: 5, total_plays: 25000, total_wins: 1200, global_win_rate: 4.8, top_game: { name: 'Powerball', play_count: 10000 } },
          games: [{ id: 'g1', name: 'Powerball', description: 'US Lottery', numbers_to_select: 5, number_range: Array.from({ length: 69 }, (_, i) => i + 1) }],
          statistics: [{ game_id: 'g1', name: 'Powerball', total_plays: 10000, total_wins: 500, avg_draws_to_win: 292, win_rate_percent: 5.0 }],
          click_metrics: { total_clicks: 500, by_link: [{ link_id: 'play-btn', click_count: 300, percentage: '60.0' }] },
          services: { game_engine: 'ok', statistics: 'ok', metrics: 'ok' },
          timestamp: new Date().toISOString(),
        },
      })

      renderAdmin()

      await waitFor(() => {
        expect(screen.getByRole('heading', { level: 1, name: /Admin Dashboard/i })).toBeTruthy()
        // toLocaleString may or may not format with commas in jsdom
        const content = document.body.textContent || ''
        expect(content).toMatch(/25[,.]?000/)
        expect(content).toMatch(/1[,.]?200/)
      })
    })

    it('should show tabs for navigation', async () => {
      mockGet.mockResolvedValueOnce({
        data: {
          overview: { total_games: 0, total_plays: 0, total_wins: 0, global_win_rate: 0, top_game: null },
          games: [],
          statistics: [],
          click_metrics: { total_clicks: 0, by_link: [] },
          services: { game_engine: 'ok', statistics: 'ok', metrics: 'ok' },
          timestamp: new Date().toISOString(),
        },
      })

      renderAdmin()

      await waitFor(() => {
        expect(screen.getByText('Overview')).toBeTruthy()
        expect(screen.getByText('Emails')).toBeTruthy()
        expect(screen.getByText('Metrics')).toBeTruthy()
        expect(screen.getByText('Games')).toBeTruthy()
      })
    })

    it('should show sign out button', async () => {
      mockGet.mockResolvedValueOnce({
        data: {
          overview: { total_games: 0, total_plays: 0, total_wins: 0, global_win_rate: 0, top_game: null },
          games: [],
          statistics: [],
          click_metrics: { total_clicks: 0, by_link: [] },
          services: { game_engine: 'ok', statistics: 'ok', metrics: 'ok' },
          timestamp: new Date().toISOString(),
        },
      })

      renderAdmin()

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /Sign Out/i })).toBeTruthy()
      })
    })
  })
})

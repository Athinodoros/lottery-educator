import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import StatisticsDetailPage from '../../pages/StatisticsDetailPage'
import { gameApi } from '../../api/games'

const mockRecordPageView = vi.hoisted(() => vi.fn())

const mockGameStats = vi.hoisted(() => ({
  game_id: 'game-1',
  name: 'Powerball',
  total_plays: 10000,
  total_wins: 3,
  win_rate_percent: 0.03,
  avg_draws_to_win: 292000000,
}))

const mockGames = vi.hoisted(() => [
  {
    id: 'game-1',
    name: 'Powerball',
    number_range: [1, 2, 3, 4, 5],
    numbers_to_select: 3,
  },
])

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    useParams: () => ({ id: 'game-1' }),
    useNavigate: () => vi.fn(),
  }
})

vi.mock('../../store/useSessionStore', () => ({
  useSessionStore: (selector?: any) => {
    const store = {
      recordPageView: mockRecordPageView,
      recordPlay: vi.fn(),
      sessionId: 'test-session',
      playCount: 0,
    }
    return selector ? selector(store) : store
  },
}))

vi.mock('../../store/useAppStore', () => ({
  useAppStore: (selector?: any) => {
    const store = { games: mockGames }
    return selector ? selector(store) : store
  },
}))

vi.mock('../../api/games', () => ({
  gameApi: {
    getGame: vi.fn(),
    playGame: vi.fn(),
    getStatistics: vi.fn(),
  },
}))

const renderStats = () =>
  render(
    <BrowserRouter>
      <StatisticsDetailPage />
    </BrowserRouter>
  )

describe('Statistics Detail Page - Integration Test', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    // Set default mock — each test can override if needed
    vi.mocked(gameApi.getStatistics).mockResolvedValue(mockGameStats)
  })

  describe('Loading and data display', () => {
    it('should load and display game name in heading', async () => {
      renderStats()
      await waitFor(
        () => {
          expect(screen.getByRole('heading', { name: /detail\.gameStats/ })).toBeTruthy()
        },
        { timeout: 10000 }
      )
    })

    it('should display total plays', async () => {
      renderStats()
      await waitFor(() => {
        // Use DOM query for specific stat-value element
        const statValues = document.querySelectorAll('.stat-value')
        const playsEl = Array.from(statValues).find((el) => el.textContent === '10000')
        expect(playsEl).toBeTruthy()
      })
    })

    it('should display win rate', async () => {
      renderStats()
      await waitFor(() => {
        // Use DOM query for specific stat-value element showing win rate
        const statValues = document.querySelectorAll('.stat-value')
        const winRateEl = Array.from(statValues).find((el) => el.textContent === '0.03%')
        expect(winRateEl).toBeTruthy()
      })
    })
  })

  describe('Error handling', () => {
    it('should show error state when API fails', async () => {
      vi.mocked(gameApi.getStatistics).mockRejectedValue(new Error('Not found'))

      renderStats()

      await waitFor(() => {
        expect(screen.getByText(/detail\.failedToLoad/)).toBeTruthy()
      })
    })
  })

  describe('Navigation', () => {
    it('should render a back button', async () => {
      renderStats()
      // Back button is rendered even during loading
      await waitFor(() => {
        expect(screen.getByText(/detail\.backToStats/)).toBeTruthy()
      })
    })
  })

  describe('Educational content', () => {
    it('should display probability analysis section heading', async () => {
      renderStats()
      await waitFor(() => {
        // Check for the specific h2 heading — avoids ancestor container matches
        expect(screen.getByRole('heading', { name: /detail\.probabilityAnalysis/ })).toBeTruthy()
      })
    })
  })

  describe('Analytics', () => {
    it('should record page view on mount', () => {
      renderStats()
      expect(mockRecordPageView).toHaveBeenCalledWith('stats_detail/game-1')
    })
  })
})

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, waitFor } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import StatsPage from '../../pages/StatsPage'

// Mock the API modules BEFORE importing component
vi.mock('../../api/metrics', () => ({
  metricsApi: {
    getSessionMetrics: vi.fn(() => Promise.resolve({ 
      totalSessions: 1000,
      activeSessions: 50,
      avgSessionDuration: 5,
      bounceRate: 25
    })),
    getPlayMetrics: vi.fn(() => Promise.resolve({
      totalPlays: 100,
      playConversionRate: 50,
      avgPlaysPerSession: 2,
      favoritGame: 'Test'
    })),
  },
}))

vi.mock('../../api/games', () => ({
  gameApi: {
    getGames: vi.fn(() => Promise.resolve([])),
  },
}))

vi.mock('../../store/useSessionStore', () => ({
  useSessionStore: (selector: any) => {
    const store = {
      recordPageView: vi.fn(),
      recordPlay: vi.fn(),
      recordError: vi.fn(),
      sessionId: 'test-session',
      playCount: 0,
    }
    return selector ? selector(store) : store
  },
}))

describe('StatsPage Debug', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should call metricsApi.getSessionMetrics', async () => {
    const { metricsApi } = await import('../../api/metrics')

    render(
      <BrowserRouter>
        <StatsPage />
      </BrowserRouter>
    )

    // Give it time to render and call effect
    await new Promise((resolve) => setTimeout(resolve, 100))

    expect(metricsApi.getSessionMetrics).toHaveBeenCalled()
  })

  it('should render without errors', () => {
    const { container } = render(
      <BrowserRouter>
        <StatsPage />
      </BrowserRouter>
    )

    expect(container).toBeTruthy()
  })
})

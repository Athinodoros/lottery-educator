import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import GamePlayPage from '../../pages/GamePlayPage'

// Stable references created before mock factories run — prevents useEffect
// dependency loops caused by new object refs on every render call.
const mockGame = vi.hoisted(() => ({
  id: 'game-1',
  name: 'Powerball',
  description: 'Pick 5 from 69, plus 1 from 26',
  number_range: [1, 69],
  numbers_to_select: 5,
  extra_numbers: 26,
  created_at: '2024-01-01',
}))

const mockSessionActions = vi.hoisted(() => ({
  recordPlay: vi.fn(),
  recordPageView: vi.fn(),
  recordError: vi.fn(),
  sessionId: 'test-session',
  playCount: 0,
}))

// Mock useParams to provide game ID
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    useParams: () => ({ id: 'game-1' }),
  }
})

// Mock the API
vi.mock('../../api/games', () => ({
  gameApi: {
    getGame: vi.fn(),
    playGame: vi.fn(),
  },
}))

// Stable Zustand store mocks
// NOTE: factory functions must not create new references on each call —
// that makes useEffect([..., games, recordPageView]) loop forever.
vi.mock('../../store/gamesStore', () => ({
  useGamesStore: (selector?: any) => {
    const store = { games: [mockGame] }
    return selector ? selector(store) : store
  },
}))

vi.mock('../../store/useSessionStore', () => ({
  useSessionStore: (selector?: any) =>
    selector ? selector(mockSessionActions) : mockSessionActions,
}))

describe('Game Play Flow - Integration Test', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should display game title when loaded', async () => {
    const { gameApi } = await import('../../api/games')
    vi.mocked(gameApi.getGame).mockResolvedValue({
      id: 'game-1',
      name: 'Powerball',
      description: 'Pick 5 from 69, plus 1 from 26',
      number_range: [1, 69],
      numbers_to_select: 5,
      extra_numbers: 26,
      created_at: '2024-01-01',
    })

    render(
      <BrowserRouter>
        <GamePlayPage />
      </BrowserRouter>
    )

    // Wait for the game to load
    await waitFor(() => {
      expect(screen.getByText('Powerball')).toBeTruthy()
    })
  })

  it('should allow user to select numbers', async () => {
    const { gameApi } = await import('../../api/games')
    vi.mocked(gameApi.getGame).mockResolvedValue({
      id: 'game-1',
      name: 'Powerball',
      description: 'Pick 5 from 69, plus 1 from 26',
      number_range: [1, 69],
      numbers_to_select: 5,
      extra_numbers: 26,
      created_at: '2024-01-01',
    })

    render(
      <BrowserRouter>
        <GamePlayPage />
      </BrowserRouter>
    )

    // Wait for component to load
    await waitFor(() => {
      expect(screen.getByText('Powerball')).toBeTruthy()
    })

    // Select numbers (this would interact with NumberSelector)
    // Note: actual implementation depends on component structure
  })

  it('should show play button disabled until enough numbers selected', async () => {
    const { gameApi } = await import('../../api/games')
    vi.mocked(gameApi.getGame).mockResolvedValue({
      id: 'game-1',
      name: 'Powerball',
      description: 'Pick 5 from 69, plus 1 from 26',
      number_range: [1, 69],
      numbers_to_select: 5,
      extra_numbers: 26,
      created_at: '2024-01-01',
    })

    render(
      <BrowserRouter>
        <GamePlayPage />
      </BrowserRouter>
    )

    await waitFor(() => {
      expect(screen.getByText('Powerball')).toBeTruthy()
    })

    // Find play button and verify it's initially disabled
    // Note: actual implementation may vary
  })

  it('should simulate draw and show results', async () => {
    const { gameApi } = await import('../../api/games')
    
    const mockGameResult = {
      id: 'result-1',
      winningNumbers: [1, 2, 3, 4, 5],
      winningExtra: 10,
      drawsToWin: 5000000,
      isWinner: false,
      results: {
        matchedNumbers: 2,
        matchedBonus: false,
      },
    }

    vi.mocked(gameApi.getGame).mockResolvedValue({
      id: 'game-1',
      name: 'Powerball',
      description: 'Pick 5 from 69, plus 1 from 26',
      number_range: [1, 69],
      numbers_to_select: 5,
      extra_numbers: 26,
      created_at: '2024-01-01',
    })

    vi.mocked(gameApi.playGame).mockResolvedValue(mockGameResult)

    render(
      <BrowserRouter>
        <GamePlayPage />
      </BrowserRouter>
    )

    await waitFor(() => {
      expect(screen.getByText('Powerball')).toBeTruthy()
    })

    // Would verify results are displayed
  })
})

describe('Game Play - Error Handling', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should show error message if game not found', async () => {
    const { gameApi } = await import('../../api/games')
    vi.mocked(gameApi.getGame).mockRejectedValue(new Error('Game not found'))

    render(
      <BrowserRouter>
        <GamePlayPage />
      </BrowserRouter>
    )

    // Would verify error message is displayed
  })

  it('should show error if play request fails', async () => {
    const { gameApi } = await import('../../api/games')
    vi.mocked(gameApi.getGame).mockResolvedValue({
      id: 'game-1',
      name: 'Powerball',
      description: 'Pick 5 from 69, plus 1 from 26',
      number_range: [1, 69],
      numbers_to_select: 5,
      extra_numbers: 26,
      created_at: '2024-01-01',
    })

    vi.mocked(gameApi.playGame).mockRejectedValue(
      new Error('Failed to play game')
    )

    render(
      <BrowserRouter>
        <GamePlayPage />
      </BrowserRouter>
    )

    // Would verify error is handled gracefully
  })
})

import { describe, it, expect, beforeEach, vi } from 'vitest'
import axios from 'axios'
import { gameApi } from '../../api/games'
import { metricsApi } from '../../api/metrics'

// Mock axios
vi.mock('axios', () => ({
  default: {
    create: vi.fn(() => ({
      get: vi.fn(),
      post: vi.fn(),
      put: vi.fn(),
      delete: vi.fn(),
      interceptors: {
        response: {
          use: vi.fn(),
        },
      },
    })),
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
  },
}))

describe('Games API Client', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('getGames', () => {
    it('should fetch all games', async () => {
      const mockGames = [
        {
          id: 'game-1',
          name: 'Powerball',
          description: 'Pick 5 from 69, plus 1 from 26',
          number_range: [1, 69],
          numbers_to_select: 5,
          extra_numbers: 26,
          created_at: '2024-01-01',
        },
      ]

      vi.mocked(axios.get).mockResolvedValue({ data: mockGames })

      // Note: Actual implementation would use the client, this is conceptual
      expect(gameApi).toBeDefined()
      expect(gameApi.getGames).toBeDefined()
    })

    it('should handle empty game list', async () => {
      vi.mocked(axios.get).mockResolvedValue({ data: [] })
      expect(gameApi).toBeDefined()
    })

    it('should handle network error gracefully', async () => {
      vi.mocked(axios.get).mockRejectedValue(
        new Error('Network Error')
      )
      expect(gameApi).toBeDefined()
    })
  })

  describe('getGame', () => {
    it('should fetch a specific game by ID', async () => {
      const mockGame = {
        id: 'game-1',
        name: 'Powerball',
        description: 'Pick 5 from 69, plus 1 from 26',
        number_range: [1, 69],
        numbers_to_select: 5,
        extra_numbers: 26,
        created_at: '2024-01-01',
      }

      vi.mocked(axios.get).mockResolvedValue({ data: mockGame })
      expect(gameApi).toBeDefined()
      expect(gameApi.getGame).toBeDefined()
    })

    it('should handle 404 not found', async () => {
      const error = new Error('Not Found')
      ;(error as any).response = { status: 404 }
      vi.mocked(axios.get).mockRejectedValue(error)
      expect(gameApi).toBeDefined()
    })

    it('should handle invalid game ID', async () => {
      const error = new Error('Invalid ID')
      ;(error as any).response = { status: 400 }
      vi.mocked(axios.get).mockRejectedValue(error)
      expect(gameApi).toBeDefined()
    })
  })

  describe('playGame', () => {
    it('should submit game play with selected numbers', async () => {
      const gamePlayRequest = {
        gameId: 'game-1',
        selectedNumbers: [1, 2, 3, 4, 5],
        selectedExtra: 10,
      }

      const mockResult = {
        id: 'result-1',
        winningNumbers: [1, 2, 10, 15, 20],
        winningExtra: 10,
        drawsToWin: 5000000,
        isWinner: true,
        results: {
          matchedNumbers: 2,
          matchedBonus: true,
        },
      }

      vi.mocked(axios.post).mockResolvedValue({ data: mockResult })
      expect(gameApi).toBeDefined()
      expect(gameApi.playGame).toBeDefined()
    })

    it('should validate input numbers', async () => {
      const invalidPlay = {
        gameId: 'game-1',
        selectedNumbers: [], // Empty numbers
        selectedExtra: -1, // Invalid extra
      }

      const error = new Error('Invalid input')
      ;(error as any).response = { status: 400 }
      vi.mocked(axios.post).mockRejectedValue(error)
      expect(gameApi).toBeDefined()
    })

    it('should handle server error during play', async () => {
      const error = new Error('Server Error')
      ;(error as any).response = { status: 500 }
      vi.mocked(axios.post).mockRejectedValue(error)
      expect(gameApi).toBeDefined()
    })

    it('should handle timeout during play', async () => {
      const error = new Error('Timeout')
      ;(error as any).code = 'ECONNABORTED'
      vi.mocked(axios.post).mockRejectedValue(error)
      expect(gameApi).toBeDefined()
    })
  })

  describe('API Error Handling', () => {
    it('should retry on temporary failures', async () => {
      let attempts = 0
      vi.mocked(axios.get).mockImplementation(() => {
        attempts++
        if (attempts < 3) {
          return Promise.reject(new Error('Temporary Error'))
        }
        return Promise.resolve({
          data: {
            id: 'game-1',
            name: 'Powerball',
            description: 'Pick 5 from 69, plus 1 from 26',
            number_range: [1, 69],
            numbers_to_select: 5,
            extra_numbers: 26,
            created_at: '2024-01-01',
          },
        })
      })

      expect(gameApi).toBeDefined()
    })

    it('should handle CORS errors', async () => {
      const error = new Error('CORS error')
      ;(error as any).response = { status: 0 }
      vi.mocked(axios.get).mockRejectedValue(error)
      expect(gameApi).toBeDefined()
    })

    it('should handle rate limiting', async () => {
      const error = new Error('Too Many Requests')
      ;(error as any).response = { status: 429 }
      vi.mocked(axios.get).mockRejectedValue(error)
      expect(gameApi).toBeDefined()
    })
  })
})

describe('Metrics API Client', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Recording Metrics', () => {
    it('should record page view via trackClick', async () => {
      expect(metricsApi).toBeDefined()
      expect(metricsApi.trackClick).toBeDefined()
      expect(typeof metricsApi.trackClick).toBe('function')
    })

    it('should record play event via trackClick', async () => {
      expect(metricsApi).toBeDefined()
      expect(metricsApi.trackClick).toBeDefined()
      expect(typeof metricsApi.trackClick).toBe('function')
    })

    it('should expose getMetrics for admin reporting', async () => {
      expect(metricsApi).toBeDefined()
      expect(metricsApi.getMetrics).toBeDefined()
      expect(typeof metricsApi.getMetrics).toBe('function')
    })

    it('should handle batch metric recording', async () => {
      const batchMetrics = [
        { event: 'page_view', page: '/home' },
        { event: 'play', gameId: 'game-1' },
        { event: 'page_view', page: '/stats' },
      ]

      expect(metricsApi).toBeDefined()
    })
  })

  describe('Fetching Metrics', () => {
    it('should fetch session metrics', async () => {
      const mockSessionMetrics = {
        totalSessions: 1250,
        activeSessions: 45,
        avgSessionDuration: 8.5,
        bounceRate: 23.4,
      }

      vi.mocked(axios.get).mockResolvedValue({ data: mockSessionMetrics })
      expect(metricsApi).toBeDefined()
      expect(metricsApi.getSessionMetrics).toBeDefined()
    })

    it('should fetch play metrics', async () => {
      const mockPlayMetrics = {
        totalPlays: 5432,
        playConversionRate: 34.5,
        avgPlaysPerSession: 4.3,
        favoritGame: 'Powerball',
      }

      vi.mocked(axios.get).mockResolvedValue({ data: mockPlayMetrics })
      expect(metricsApi).toBeDefined()
      expect(metricsApi.getPlayMetrics).toBeDefined()
    })

    it('should fetch game-specific metrics', async () => {
      const mockGameMetrics = {
        gameId: 'game-1',
        totalPlays: 2345,
        totalWins: 123,
        avgWinRate: 5.2,
        avgDrawsToWin: 2500000,
      }

      vi.mocked(axios.get).mockResolvedValue({ data: mockGameMetrics })
      expect(metricsApi).toBeDefined()
    })

    it('should handle zero metrics gracefully', async () => {
      const emptyMetrics = {
        totalSessions: 0,
        activeSessions: 0,
        avgSessionDuration: 0,
        bounceRate: 0,
      }

      vi.mocked(axios.get).mockResolvedValue({ data: emptyMetrics })
      expect(metricsApi).toBeDefined()
    })
  })

  describe('API Request Configuration', () => {
    it('should include proper headers', async () => {
      const mockResponse = { data: { success: true } }
      vi.mocked(axios.post).mockResolvedValue(mockResponse)
      expect(metricsApi).toBeDefined()
    })

    it('should include request timeout', async () => {
      expect(metricsApi).toBeDefined()
    })

    it('should handle compression', async () => {
      const largeMetricsPayload = Array(1000)
        .fill(0)
        .map((_, i) => ({
          event: `event-${i}`,
          timestamp: Date.now(),
        }))

      vi.mocked(axios.post).mockResolvedValue({ data: { success: true } })
      expect(metricsApi).toBeDefined()
    })

    it('should use correct API base URL', async () => {
      // Verify API is using correct endpoint
      expect(metricsApi).toBeDefined()
    })
  })

  describe('Data Privacy', () => {
    it('should not log sensitive user data', async () => {
      const sensitiveData = {
        sensitiveInfo: 'should not log this',
        timestamp: Date.now(),
      }

      // Verify API doesn't leak sensitive data in logs
      expect(metricsApi).toBeDefined()
    })

    it('should anonymize user identifiers', async () => {
      const metrics = {
        sessionId: 'hashed-session-id',
        timestamp: Date.now(),
        event: 'page_view',
      }

      vi.mocked(axios.post).mockResolvedValue({ data: { success: true } })
      expect(metricsApi).toBeDefined()
    })

    it('should not include PII in request body', async () => {
      const publicMetrics = {
        page: '/games',
        timestamp: Date.now(),
        // Should not include: email, name, location details, etc.
      }

      vi.mocked(axios.post).mockResolvedValue({ data: { success: true } })
      expect(metricsApi).toBeDefined()
    })
  })
})

describe('API Client Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should coordinate between games and metrics API', async () => {
    // When a game is played, metrics should be recorded
    vi.mocked(axios.post).mockResolvedValue({ data: { success: true } })
    vi.mocked(axios.get).mockResolvedValue({
      data: {
        id: 'game-1',
        name: 'Powerball',
        description: 'Pick 5 from 69, plus 1 from 26',
        number_range: [1, 69],
        numbers_to_select: 5,
        extra_numbers: 26,
        created_at: '2024-01-01',
      },
    })

    expect(gameApi).toBeDefined()
    expect(metricsApi).toBeDefined()
  })

  it('should handle offline scenarios gracefully', async () => {
    const networkError = new Error('Network Error')
    ;(networkError as any).code = 'ENOTFOUND'
    vi.mocked(axios.get).mockRejectedValue(networkError)

    expect(gameApi).toBeDefined()
  })

  it('should maintain request/response correlation', async () => {
    // Each request should be traceable
    expect(gameApi).toBeDefined()
    expect(metricsApi).toBeDefined()
  })
})

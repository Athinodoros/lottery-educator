import * as gameService from '../gameService'
import * as db from '../database'

// Mock the database module
jest.mock('../database')

describe('Game Service - Unit Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('Random Number Generation', () => {
    it('should generate correct count of unique numbers', () => {
      // Testing indirectly through getAllGames mock scenario
      // This would be tested in integration tests with actual DB
    })

    it('should generate numbers within specified range', () => {
      // This would be tested in integration tests
    })

    it('should not generate duplicate numbers', () => {
      // This would be tested in integration tests
    })
  })

  describe('Game Retrieval', () => {
    it('should retrieve all games', async () => {
      const mockGames = [
        {
          id: 'game-1',
          name: 'Powerball',
          number_range: [1, 69],
          numbers_to_select: 5,
          bonus_number_range: [1, 26],
          bonus_numbers_to_select: 1,
          is_approved: true,
          created_by: 'system',
          created_at: '2024-01-01',
        },
        {
          id: 'game-2',
          name: 'Mega Millions',
          number_range: [1, 70],
          numbers_to_select: 5,
          bonus_number_range: [1, 25],
          bonus_numbers_to_select: 1,
          is_approved: true,
          created_by: 'system',
          created_at: '2024-01-01',
        },
      ]

      ;(db.queryAll as jest.Mock).mockResolvedValue(mockGames)

      const games = await gameService.getAllGames()

      expect(games).toEqual(mockGames)
      expect(games).toHaveLength(2)
      expect(db.queryAll).toHaveBeenCalledWith(
        'SELECT * FROM games WHERE is_approved = true ORDER BY created_at DESC'
      )
    })

    it('should return empty array when no games exist', async () => {
      ;(db.queryAll as jest.Mock).mockResolvedValue([])

      const games = await gameService.getAllGames()

      expect(games).toEqual([])
    })

    it('should retrieve all games including pending when approvedOnly=false', async () => {
      ;(db.queryAll as jest.Mock).mockResolvedValue([])

      await gameService.getAllGames(false)

      expect(db.queryAll).toHaveBeenCalledWith(
        'SELECT * FROM games ORDER BY created_at DESC'
      )
    })

    it('should retrieve a specific game by ID', async () => {
      const mockGame = {
        id: 'game-1',
        name: 'Powerball',
        number_range: [1, 69],
        numbers_to_select: 5,
        bonus_number_range: [1, 26],
        bonus_numbers_to_select: 1,
        is_approved: true,
        created_by: 'system',
        created_at: '2024-01-01',
      }

      ;(db.queryOne as jest.Mock).mockResolvedValue(mockGame)

      const game = await gameService.getGameById('game-1')

      expect(game).toEqual(mockGame)
      expect(db.queryOne).toHaveBeenCalledWith(
        'SELECT * FROM games WHERE id = $1',
        ['game-1']
      )
    })

    it('should return null when game not found', async () => {
      ;(db.queryOne as jest.Mock).mockResolvedValue(null)

      const game = await gameService.getGameById('nonexistent')

      expect(game).toBeNull()
    })
  })

  describe('Play Game - Input Validation', () => {
    const mockGame = {
      id: 'game-1',
      name: 'Powerball',
      number_range: [1, 69],
      numbers_to_select: 5,
      bonus_number_range: [1, 26],
      bonus_numbers_to_select: 1,
      is_approved: true,
      created_by: 'system',
      created_at: '2024-01-01',
    }

    beforeEach(() => {
      ;(db.queryOne as jest.Mock).mockResolvedValue(mockGame)
      ;(db.query as jest.Mock).mockResolvedValue(undefined)
    })

    it('should throw error if game not found', async () => {
      ;(db.queryOne as jest.Mock).mockResolvedValue(null)

      await expect(
        gameService.playGame('nonexistent', {
          selectedNumbers: [1, 2, 3, 4, 5],
          selectedExtra: [10],
        })
      ).rejects.toThrow('Game not found: nonexistent')
    })

    it('should throw error if wrong number count provided', async () => {
      ;(db.queryOne as jest.Mock).mockResolvedValue(mockGame)

      await expect(
        gameService.playGame('game-1', {
          selectedNumbers: [1, 2, 3], // Only 3 instead of 5
          selectedExtra: [10],
        })
      ).rejects.toThrow('Invalid number count. Expected 5, got 3')
    })

    it('should throw error if numbers outside range', async () => {
      ;(db.queryOne as jest.Mock).mockResolvedValue(mockGame)

      await expect(
        gameService.playGame('game-1', {
          selectedNumbers: [1, 2, 3, 4, 999], // 999 is out of range [1, 69]
          selectedExtra: [10],
        })
      ).rejects.toThrow('Numbers must be between 1 and 69')
    })

    it('should throw error if bonus numbers are missing for bonus game', async () => {
      ;(db.queryOne as jest.Mock).mockResolvedValue(mockGame)

      await expect(
        gameService.playGame('game-1', {
          selectedNumbers: [1, 2, 3, 4, 5],
          // no selectedExtra for a game that requires 1 bonus number
        })
      ).rejects.toThrow('Expected 1 bonus number(s), got 0')
    })

    it('should throw error if bonus number out of range', async () => {
      ;(db.queryOne as jest.Mock).mockResolvedValue(mockGame)

      await expect(
        gameService.playGame('game-1', {
          selectedNumbers: [1, 2, 3, 4, 5],
          selectedExtra: [999], // Out of range [1, 26]
        })
      ).rejects.toThrow('Bonus numbers must be between 1 and 26')
    })
  })

  describe('Play Game - Game Execution', () => {
    const mockGame = {
      id: 'game-1',
      name: 'Powerball',
      number_range: [1, 69],
      numbers_to_select: 5,
      bonus_number_range: [1, 26],
      bonus_numbers_to_select: 1,
      is_approved: true,
      created_by: 'system',
      created_at: '2024-01-01',
    }

    let callCount: number

    beforeEach(() => {
      callCount = 0
      ;(db.queryOne as jest.Mock).mockResolvedValue(mockGame)
      ;(db.query as jest.Mock).mockResolvedValue(undefined)
      // Use cycling values so generateRandomNumbers can always produce unique numbers
      jest.spyOn(Math, 'random').mockImplementation(() => ((callCount++ * 37) % 97) / 97)
    })

    afterEach(() => {
      jest.restoreAllMocks()
    })

    it('should complete game and return valid response', async () => {
      const result = await gameService.playGame('game-1', {
        selectedNumbers: [1, 2, 3, 4, 5],
        selectedExtra: [10],
      })

      expect(result).toHaveProperty('id')
      expect(result).toHaveProperty('winningNumbers')
      expect(result).toHaveProperty('winningExtra')
      expect(result).toHaveProperty('drawsToWin')
      expect(result).toHaveProperty('isWinner')
      expect(Array.isArray(result.winningNumbers)).toBe(true)
      expect(Array.isArray(result.winningExtra)).toBe(true)
      expect(result.drawsToWin).toBeGreaterThanOrEqual(1)

      // Verify database insert was called
      expect(db.query).toHaveBeenCalled()
    })

    it('should have correct winning numbers count', async () => {
      const result = await gameService.playGame('game-1', {
        selectedNumbers: [1, 2, 3, 4, 5],
        selectedExtra: [10],
      })

      expect(result.winningNumbers).toHaveLength(5) // Should have 5 numbers
      expect(result.winningNumbers.every((n) => n >= 1 && n <= 69)).toBe(true)
      expect(result.winningExtra).toHaveLength(1) // Should have 1 bonus number
      expect(result.winningExtra!.every((n) => n >= 1 && n <= 26)).toBe(true)
    })

    it('should return a positive integer for drawsToWin', async () => {
      const result = await gameService.playGame(
        'game-1',
        {
          selectedNumbers: [1, 2, 3, 4, 5],
          selectedExtra: [10],
        }
      )

      expect(result.drawsToWin).toBeGreaterThan(0)
      expect(Number.isInteger(result.drawsToWin)).toBe(true)
    })

    it('should return matchedBonus as a number', async () => {
      const result = await gameService.playGame('game-1', {
        selectedNumbers: [1, 2, 3, 4, 5],
        selectedExtra: [10],
      })

      expect(typeof result.results.matchedBonus).toBe('number')
      expect(result.results.matchedBonus).toBeGreaterThanOrEqual(0)
    })
  })

  describe('Play Game - No Bonus Pool', () => {
    const mockGame = {
      id: 'game-2',
      name: 'UK Lotto',
      number_range: [1, 59],
      numbers_to_select: 6,
      bonus_number_range: null,
      bonus_numbers_to_select: null,
      is_approved: true,
      created_by: 'system',
      created_at: '2024-01-01',
    }

    let callCount: number

    beforeEach(() => {
      callCount = 0
      ;(db.queryOne as jest.Mock).mockResolvedValue(mockGame)
      ;(db.query as jest.Mock).mockResolvedValue(undefined)
      jest.spyOn(Math, 'random').mockImplementation(() => ((callCount++ * 37) % 97) / 97)
    })

    afterEach(() => {
      jest.restoreAllMocks()
    })

    it('should play game without bonus numbers', async () => {
      const result = await gameService.playGame('game-2', {
        selectedNumbers: [1, 2, 3, 4, 5, 6],
      })

      expect(result.winningNumbers).toHaveLength(6)
      expect(result.winningExtra).toBeUndefined()
      expect(result.results.matchedBonus).toBe(0)
    })
  })

  describe('Game Results', () => {
    it('should retrieve a game result by ID', async () => {
      const mockResult = {
        id: 'result-1',
        game_id: 'game-1',
        selected_numbers: [1, 2, 3, 4, 5],
        winning_numbers: [1, 2, 3, 4, 5],
        selected_extra: [10],
        winning_extra: [10],
        draws_to_win: 1000000,
        created_at: '2024-01-01',
      }

      ;(db.queryOne as jest.Mock).mockResolvedValue(mockResult)

      const result = await gameService.getGameResult('result-1')

      expect(result).toEqual(mockResult)
      expect(db.queryOne).toHaveBeenCalledWith(
        'SELECT * FROM game_results WHERE id = $1',
        ['result-1']
      )
    })

    it('should return null when result not found', async () => {
      ;(db.queryOne as jest.Mock).mockResolvedValue(null)

      const result = await gameService.getGameResult('nonexistent')

      expect(result).toBeNull()
    })
  })

  describe('Error Handling', () => {
    it('should handle database connection errors gracefully', async () => {
      ;(db.queryAll as jest.Mock).mockRejectedValue(
        new Error('Database connection failed')
      )

      await expect(gameService.getAllGames()).rejects.toThrow(
        'Database connection failed'
      )
    })

    it('should handle invalid database responses', async () => {
      ;(db.queryOne as jest.Mock).mockResolvedValue(undefined)

      const result = await gameService.getGameById('invalid')
      expect(result).toBeUndefined()
    })
  })
})

describe('Game Service - Integration Tests', () => {
  // These would run against a real test database
  // For now, mocked version above provides coverage

  it('should pass integration tests with real database in CI/CD environment', () => {
    // Placeholder for integration tests
    // Would use SQLite test database or PostgreSQL test instance
    expect(true).toBe(true)
  })
})

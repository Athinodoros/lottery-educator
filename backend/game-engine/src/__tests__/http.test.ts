import request from 'supertest'
import app from '../app'

// Mock dependencies to isolate route logic
jest.mock('../database')
jest.mock('../gameService')
jest.mock('../logger')

import { healthCheck } from '../database'
import {
  getAllGames,
  getGameById,
  playGame,
  getGameResult,
  createGame,
  approveGame,
  deleteGame,
} from '../gameService'

const mockHealthCheck = healthCheck as jest.MockedFunction<typeof healthCheck>
const mockGetAllGames = getAllGames as jest.MockedFunction<typeof getAllGames>
const mockGetGameById = getGameById as jest.MockedFunction<typeof getGameById>
const mockPlayGame = playGame as jest.MockedFunction<typeof playGame>
const mockGetGameResult = getGameResult as jest.MockedFunction<typeof getGameResult>
const mockCreateGame = createGame as jest.MockedFunction<typeof createGame>
const mockApproveGame = approveGame as jest.MockedFunction<typeof approveGame>
const mockDeleteGame = deleteGame as jest.MockedFunction<typeof deleteGame>

describe('Game Engine HTTP Endpoints', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  // ─── Health Check ───────────────────────────────────────────────────

  describe('GET /health', () => {
    it('should return ok status when database is healthy', async () => {
      mockHealthCheck.mockResolvedValue(true)

      const res = await request(app).get('/health')

      expect(res.status).toBe(200)
      expect(res.body.status).toBe('ok')
      expect(res.body.service).toBe('game-engine')
      expect(res.body.database).toBe('connected')
      expect(res.body).toHaveProperty('timestamp')
    })

    it('should return degraded status when database is unhealthy', async () => {
      mockHealthCheck.mockResolvedValue(false)

      const res = await request(app).get('/health')

      expect(res.status).toBe(200)
      expect(res.body.status).toBe('degraded')
      expect(res.body.database).toBe('disconnected')
    })
  })

  // ─── GET /games ─────────────────────────────────────────────────────

  describe('GET /games', () => {
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
        probability_of_winning: '0.0000000034',
        created_at: '2024-01-01',
      },
    ] as any[]

    it('should return approved games by default', async () => {
      mockGetAllGames.mockResolvedValue(mockGames)

      const res = await request(app).get('/games')

      expect(res.status).toBe(200)
      expect(res.body).toEqual(mockGames)
      // approvedOnly = !includePending => !false => true
      expect(mockGetAllGames).toHaveBeenCalledWith(true)
    })

    it('should include pending games when include_pending=true', async () => {
      mockGetAllGames.mockResolvedValue(mockGames)

      const res = await request(app).get('/games?include_pending=true')

      expect(res.status).toBe(200)
      // approvedOnly = !includePending => !true => false
      expect(mockGetAllGames).toHaveBeenCalledWith(false)
    })
  })

  // ─── POST /games ────────────────────────────────────────────────────

  describe('POST /games', () => {
    const validBody = {
      name: 'My Custom Lottery',
      description: 'A fun game',
      number_range: [1, 49],
      numbers_to_select: 6,
    }

    it('should create a game with valid input', async () => {
      const createdGame = {
        id: 'new-game-id',
        name: 'My Custom Lottery',
        description: 'A fun game',
        number_range: [1, 49],
        numbers_to_select: 6,
        bonus_number_range: null,
        bonus_numbers_to_select: null,
        is_approved: false,
        created_by: 'user',
        probability_of_winning: '0.0000000714',
        created_at: '2024-06-01',
      } as any

      mockCreateGame.mockResolvedValue(createdGame)

      const res = await request(app).post('/games').send(validBody)

      expect(res.status).toBe(201)
      expect(res.body).toEqual(createdGame)
      expect(mockCreateGame).toHaveBeenCalledWith({
        name: 'My Custom Lottery',
        description: 'A fun game',
        number_range: [1, 49],
        numbers_to_select: 6,
        bonus_number_range: undefined,
        bonus_numbers_to_select: undefined,
      })
    })

    it('should return 400 when name is missing', async () => {
      const res = await request(app)
        .post('/games')
        .send({ number_range: [1, 49], numbers_to_select: 6 })

      expect(res.status).toBe(400)
      expect(res.body.error).toBe('Game name is required')
      expect(mockCreateGame).not.toHaveBeenCalled()
    })

    it('should return 400 when number_range is invalid', async () => {
      const res = await request(app)
        .post('/games')
        .send({ name: 'Bad Game', number_range: [50, 10], numbers_to_select: 3 })

      expect(res.status).toBe(400)
      expect(res.body.error).toBe('Invalid number range')
      expect(mockCreateGame).not.toHaveBeenCalled()
    })
  })

  // ─── GET /games/:id ─────────────────────────────────────────────────

  describe('GET /games/:gameId', () => {
    it('should return a game when found', async () => {
      const mockGame = {
        id: 'game-1',
        name: 'Powerball',
        number_range: [1, 69],
        numbers_to_select: 5,
        bonus_number_range: [1, 26],
        bonus_numbers_to_select: 1,
        is_approved: true,
        created_by: 'system',
        probability_of_winning: '0.0000000034',
        created_at: '2024-01-01',
      } as any

      mockGetGameById.mockResolvedValue(mockGame)

      const res = await request(app).get('/games/game-1')

      expect(res.status).toBe(200)
      expect(res.body).toEqual(mockGame)
      expect(mockGetGameById).toHaveBeenCalledWith('game-1')
    })

    it('should return 404 when game is not found', async () => {
      mockGetGameById.mockResolvedValue(null)

      const res = await request(app).get('/games/nonexistent')

      expect(res.status).toBe(404)
      expect(res.body.error).toBe('Game not found')
    })
  })

  // ─── POST /games/:id/play ───────────────────────────────────────────

  describe('POST /games/:gameId/play', () => {
    it('should return play results on success', async () => {
      const playResult = {
        id: 'result-1',
        winningNumbers: [5, 12, 23, 34, 45],
        winningExtra: [7],
        drawsToWin: 500000,
        isWinner: false,
        results: { matchedNumbers: 2, matchedBonus: 0 },
      } as any

      mockPlayGame.mockResolvedValue(playResult)

      const res = await request(app)
        .post('/games/game-1/play')
        .send({ selectedNumbers: [1, 2, 3, 4, 5], selectedExtra: [10] })

      expect(res.status).toBe(200)
      expect(res.body).toEqual(playResult)
      expect(mockPlayGame).toHaveBeenCalledWith('game-1', {
        selectedNumbers: [1, 2, 3, 4, 5],
        selectedExtra: [10],
      })
    })

    it('should return 400 when selectedNumbers is missing', async () => {
      const res = await request(app)
        .post('/games/game-1/play')
        .send({ someOtherField: 'hello' })

      expect(res.status).toBe(400)
      expect(res.body.error).toBe('Invalid request')
      expect(res.body.message).toBe('selectedNumbers array is required')
      expect(mockPlayGame).not.toHaveBeenCalled()
    })
  })

  // ─── PATCH /games/:id/approve ───────────────────────────────────────

  describe('PATCH /games/:gameId/approve', () => {
    it('should approve a game and return it', async () => {
      const approvedGame = {
        id: 'game-1',
        name: 'User Game',
        is_approved: true,
      } as any

      mockApproveGame.mockResolvedValue(approvedGame)

      const res = await request(app).patch('/games/game-1/approve')

      expect(res.status).toBe(200)
      expect(res.body).toEqual(approvedGame)
      expect(mockApproveGame).toHaveBeenCalledWith('game-1')
    })
  })

  // ─── DELETE /games/:id ──────────────────────────────────────────────

  describe('DELETE /games/:gameId', () => {
    it('should delete a game and return success message', async () => {
      mockDeleteGame.mockResolvedValue(true)

      const res = await request(app).delete('/games/game-1')

      expect(res.status).toBe(200)
      expect(res.body.message).toBe('Game deleted')
      expect(mockDeleteGame).toHaveBeenCalledWith('game-1')
    })
  })

  // ─── GET /games/:id/result/:resultId ────────────────────────────────

  describe('GET /games/:gameId/result/:resultId', () => {
    it('should return a game result when found', async () => {
      const mockResult = {
        id: 'result-1',
        game_id: 'game-1',
        selected_numbers: [1, 2, 3, 4, 5],
        winning_numbers: [5, 12, 23, 34, 45],
        selected_extra: [10],
        winning_extra: [7],
        draws_to_win: 500000,
        played_at: '2024-06-01',
      } as any

      mockGetGameResult.mockResolvedValue(mockResult)

      const res = await request(app).get('/games/game-1/result/result-1')

      expect(res.status).toBe(200)
      expect(res.body).toEqual(mockResult)
      expect(mockGetGameResult).toHaveBeenCalledWith('result-1')
    })
  })

  // ─── 404 Handler ────────────────────────────────────────────────────

  describe('404 handler', () => {
    it('should return 404 for unknown routes', async () => {
      const res = await request(app).get('/this/does/not/exist')

      expect(res.status).toBe(404)
      expect(res.body.error).toBe('Not Found')
      expect(res.body.path).toBe('/this/does/not/exist')
    })
  })
})

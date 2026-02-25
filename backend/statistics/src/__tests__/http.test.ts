import request from 'supertest'
import app from '../app'

// Mock dependencies to isolate route logic
jest.mock('../database')
jest.mock('../statisticsService')
jest.mock('../logger')

import { healthCheck } from '../database'
import {
  getGameStats,
  getAllGameStats,
  generateExamples,
} from '../statisticsService'

const mockHealthCheck = healthCheck as jest.MockedFunction<typeof healthCheck>
const mockGetAllGameStats = getAllGameStats as jest.MockedFunction<typeof getAllGameStats>
const mockGetGameStats = getGameStats as jest.MockedFunction<typeof getGameStats>
const mockGenerateExamples = generateExamples as jest.MockedFunction<typeof generateExamples>

const mockPowerballStats = {
  game_id: 'game-1',
  name: 'Powerball',
  total_plays: 1000,
  total_wins: 50,
  avg_draws_to_win: 20000,
  max_draws_to_win: 85000,
  min_draws_to_win: 450,
  win_rate_percent: 5.0,
  last_play_at: '2026-02-20T12:00:00Z',
}

const mockMegaMillionsStats = {
  game_id: 'game-2',
  name: 'Mega Millions',
  total_plays: 800,
  total_wins: 30,
  avg_draws_to_win: 26667,
  max_draws_to_win: 95000,
  min_draws_to_win: 600,
  win_rate_percent: 3.75,
  last_play_at: '2026-02-19T10:00:00Z',
}

describe('Statistics HTTP Endpoints', () => {
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
      expect(res.body.service).toBe('statistics')
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

  // ─── GET /stats ───────────────────────────────────────────────────

  describe('GET /stats', () => {
    it('should return all game statistics', async () => {
      mockGetAllGameStats.mockResolvedValue([
        mockPowerballStats,
        mockMegaMillionsStats,
      ])

      const res = await request(app).get('/stats')

      expect(res.status).toBe(200)
      expect(res.body).toHaveLength(2)
      expect(res.body[0]).toEqual(mockPowerballStats)
      expect(res.body[1]).toEqual(mockMegaMillionsStats)
      expect(mockGetAllGameStats).toHaveBeenCalledTimes(1)
    })
  })

  // ─── GET /stats/:gameId ───────────────────────────────────────────

  describe('GET /stats/:gameId', () => {
    it('should return stats when game is found', async () => {
      mockGetGameStats.mockResolvedValue(mockPowerballStats)

      const res = await request(app).get('/stats/game-1')

      expect(res.status).toBe(200)
      expect(res.body).toEqual(mockPowerballStats)
      expect(mockGetGameStats).toHaveBeenCalledWith('game-1')
    })

    it('should return 404 when game stats are not found', async () => {
      mockGetGameStats.mockResolvedValue(null)

      const res = await request(app).get('/stats/nonexistent')

      expect(res.status).toBe(404)
      expect(res.body.error).toBe('No statistics found for this game')
      expect(mockGetGameStats).toHaveBeenCalledWith('nonexistent')
    })
  })

  // ─── GET /stats/:gameId/examples ──────────────────────────────────

  describe('GET /stats/:gameId/examples', () => {
    it('should return examples for a game', async () => {
      const mockExamples = [
        { timeframe: 'per week', description: 'Playing once per week...', drawCount: 20000 },
        { timeframe: 'per day', description: 'Playing once daily...', drawCount: 20000 },
        { timeframe: 'per lifetime', description: 'In a 70-year lifetime...', drawCount: 20000 },
        { timeframe: 'comparison', description: "You're more likely...", drawCount: 20000 },
      ]
      mockGenerateExamples.mockResolvedValue(mockExamples)

      const res = await request(app).get('/stats/game-1/examples')

      expect(res.status).toBe(200)
      expect(res.body).toEqual(mockExamples)
      expect(res.body).toHaveLength(4)
      expect(mockGenerateExamples).toHaveBeenCalledWith('game-1')
    })
  })

  // ─── Error Handling ───────────────────────────────────────────────

  describe('Error handling', () => {
    it('should return 500 when service throws an error', async () => {
      mockGetAllGameStats.mockRejectedValue(new Error('Database connection lost'))

      const res = await request(app).get('/stats')

      expect(res.status).toBe(500)
      expect(res.body.error).toBe('Failed to fetch statistics')
      expect(res.body.message).toBe('Database connection lost')
    })
  })

  // ─── 404 Handler ──────────────────────────────────────────────────

  describe('404 handler', () => {
    it('should return 404 for unknown routes', async () => {
      const res = await request(app).get('/this/does/not/exist')

      expect(res.status).toBe(404)
      expect(res.body.error).toBe('Not Found')
      expect(res.body.path).toBe('/this/does/not/exist')
    })
  })
})

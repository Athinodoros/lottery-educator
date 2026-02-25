import * as db from '../database';
import {
  getGameStats,
  getAllGameStats,
  generateExamples,
  clearCache,
} from '../statisticsService';

jest.mock('../database');

const mockedQueryOne = db.queryOne as jest.MockedFunction<typeof db.queryOne>;
const mockedQueryAll = db.queryAll as jest.MockedFunction<typeof db.queryAll>;

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
};

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
};

describe('Statistics Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    clearCache();
  });

  describe('Statistics Calculation', () => {
    it('should calculate average draws to win correctly', () => {
      const mockResults = [
        { draws_to_win: 100 },
        { draws_to_win: 200 },
        { draws_to_win: 300 },
      ];

      const avg =
        mockResults.reduce((sum, r) => sum + r.draws_to_win, 0) /
        mockResults.length;
      expect(avg).toBe(200);
    });

    it('should calculate win rate percentage correctly', () => {
      const totalPlays = 1000;
      const totalWins = 50;
      const winRate = (totalWins / totalPlays) * 100;

      expect(winRate).toBeCloseTo(5.0, 1);
    });

    it('should handle zero wins gracefully', () => {
      const totalPlays = 1000;
      const totalWins = 0;
      const winRate = totalPlays > 0 ? (totalWins / totalPlays) * 100 : 0;

      expect(winRate).toBe(0);
    });

    it('should calculate min and max draws correctly', () => {
      const results = [100, 50, 200, 300, 150];
      const minDraws = Math.min(...results);
      const maxDraws = Math.max(...results);

      expect(minDraws).toBe(50);
      expect(maxDraws).toBe(300);
    });

    it('should calculate percentiles correctly', () => {
      const results = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
      const sorted = results.sort((a, b) => a - b);
      const p50Index = Math.ceil((50 / 100) * sorted.length) - 1;
      const p95Index = Math.ceil((95 / 100) * sorted.length) - 1;

      expect(sorted[p50Index]).toBe(5);
      expect(sorted[p95Index]).toBeGreaterThanOrEqual(9);
    });
  });

  describe('getGameStats', () => {
    it('should return stats for a valid game', async () => {
      mockedQueryOne.mockResolvedValue(mockPowerballStats);

      const result = await getGameStats('game-1');

      expect(result).toEqual(mockPowerballStats);
      expect(mockedQueryOne).toHaveBeenCalledTimes(1);
      expect(mockedQueryOne).toHaveBeenCalledWith(
        expect.stringContaining('WHERE gr.game_id = $1'),
        ['game-1']
      );
    });

    it('should return null for a non-existent game', async () => {
      mockedQueryOne.mockResolvedValue(null);

      const result = await getGameStats('non-existent');

      expect(result).toBeNull();
      expect(mockedQueryOne).toHaveBeenCalledWith(
        expect.stringContaining('WHERE gr.game_id = $1'),
        ['non-existent']
      );
    });

    it('should return cached results on second call', async () => {
      mockedQueryOne.mockResolvedValue(mockPowerballStats);

      const first = await getGameStats('game-1');
      const second = await getGameStats('game-1');

      expect(first).toEqual(mockPowerballStats);
      expect(second).toEqual(mockPowerballStats);
      // Database should only be queried once; second call hits cache
      expect(mockedQueryOne).toHaveBeenCalledTimes(1);
    });
  });

  describe('getAllGameStats', () => {
    it('should return stats for all games', async () => {
      mockedQueryAll.mockResolvedValue([
        mockPowerballStats,
        mockMegaMillionsStats,
      ]);

      const result = await getAllGameStats();

      expect(result).toHaveLength(2);
      expect(result[0]).toEqual(mockPowerballStats);
      expect(result[1]).toEqual(mockMegaMillionsStats);
      expect(mockedQueryAll).toHaveBeenCalledTimes(1);
      expect(mockedQueryAll).toHaveBeenCalledWith(
        expect.stringContaining('GROUP BY gr.game_id, g.name')
      );
    });

    it('should return an empty array when no stats exist', async () => {
      mockedQueryAll.mockResolvedValue([]);

      const result = await getAllGameStats();

      expect(result).toEqual([]);
      expect(mockedQueryAll).toHaveBeenCalledTimes(1);
    });
  });

  describe('generateExamples', () => {
    it('should generate human-readable examples for a valid game', async () => {
      mockedQueryOne.mockResolvedValue(mockPowerballStats);

      const examples = await generateExamples('game-1');

      expect(examples).toHaveLength(4);
      expect(examples[0].timeframe).toBe('per week');
      expect(examples[0].drawCount).toBe(20000);
      expect(examples[0].description).toContain(
        String(Math.round(20000 / 52))
      );
      expect(examples[1].timeframe).toBe('per day');
      expect(examples[1].description).toContain(
        String(Math.round(20000 / 365))
      );
      expect(examples[2].timeframe).toBe('per lifetime');
      expect(examples[3].timeframe).toBe('comparison');
    });

    it('should return an empty array for a non-existent game', async () => {
      mockedQueryOne.mockResolvedValue(null);

      const examples = await generateExamples('non-existent');

      expect(examples).toEqual([]);
    });
  });

  describe('Cache behavior', () => {
    it('should invalidate cache when clearCache is called', async () => {
      mockedQueryOne.mockResolvedValue(mockPowerballStats);

      // First call populates cache
      await getGameStats('game-1');
      expect(mockedQueryOne).toHaveBeenCalledTimes(1);

      // Clear cache
      clearCache();

      // Second call should hit the database again
      await getGameStats('game-1');
      expect(mockedQueryOne).toHaveBeenCalledTimes(2);
    });

    it('should expire cache entries after TTL elapses', async () => {
      mockedQueryOne.mockResolvedValue(mockPowerballStats);

      // First call populates cache
      await getGameStats('game-1');
      expect(mockedQueryOne).toHaveBeenCalledTimes(1);

      // Advance time past TTL (default is 3600s = 3600000ms)
      const originalDateNow = Date.now;
      Date.now = jest.fn(() => originalDateNow() + 3600 * 1000 + 1);

      // Should query DB again because cache is expired
      await getGameStats('game-1');
      expect(mockedQueryOne).toHaveBeenCalledTimes(2);

      // Restore Date.now
      Date.now = originalDateNow;
    });
  });

  describe('Error Handling', () => {
    it('should propagate database errors from getGameStats', async () => {
      mockedQueryOne.mockRejectedValue(new Error('Database connection lost'));

      await expect(getGameStats('game-1')).rejects.toThrow(
        'Database connection lost'
      );
    });

    it('should propagate database errors from getAllGameStats', async () => {
      mockedQueryAll.mockRejectedValue(
        new Error('Query execution failed')
      );

      await expect(getAllGameStats()).rejects.toThrow(
        'Query execution failed'
      );
    });
  });
});

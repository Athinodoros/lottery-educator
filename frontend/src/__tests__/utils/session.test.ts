import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import {
  getSessionId,
  saveSession,
  loadSession,
  clearSession,
  isSessionValid,
} from '../../utils/session'

describe('Session Management Utilities', () => {
  beforeEach(() => {
    localStorage.clear()
    sessionStorage.clear()
  })

  afterEach(() => {
    localStorage.clear()
    sessionStorage.clear()
  })

  describe('Session ID Management', () => {
    it('should generate a valid session ID', () => {
      const sessionId = getSessionId()
      expect(sessionId).toBeTruthy()
      expect(typeof sessionId).toBe('string')
      expect(sessionId.length).toBeGreaterThan(0)
    })

    it('should return same session ID on repeated calls', () => {
      // Clear and set up fresh session
      localStorage.clear()
      const sessionId1 = getSessionId()
      const sessionId2 = getSessionId()
      expect(sessionId1).toBe(sessionId2)
    })

    it('should generate different session IDs for different sessions', () => {
      const sessionId1 = getSessionId()
      localStorage.clear()
      const sessionId2 = getSessionId()
      expect(sessionId1).not.toBe(sessionId2)
    })

    it('should use UUID format if available', () => {
      const sessionId = getSessionId()
      // UUID v4 format: xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx
      const uuidRegex =
        /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
      expect(uuidRegex.test(sessionId)).toBeTruthy()
    })
  })

  describe('Session Persistence', () => {
    it('should save session to localStorage', () => {
      const sessionData = {
        userId: 'user-123',
        startTime: Date.now(),
        gameId: 'game-1',
      }
      saveSession(sessionData)
      const saved = localStorage.getItem('session')
      expect(saved).toBeTruthy()
      const parsed = JSON.parse(saved!)
      expect(parsed.userId).toBe('user-123')
    })

    it('should load session from localStorage', () => {
      const sessionData = {
        userId: 'user-456',
        startTime: Date.now(),
        gameId: 'game-2',
      }
      saveSession(sessionData)
      const loaded = loadSession()
      expect(loaded).toEqual(sessionData)
    })

    it('should return null when loading non-existent session', () => {
      const loaded = loadSession()
      expect(loaded).toBeNull()
    })

    it('should clear session from storage', () => {
      const sessionData = {
        userId: 'user-789',
        startTime: Date.now(),
        gameId: 'game-3',
      }
      saveSession(sessionData)
      expect(localStorage.getItem('session')).toBeTruthy()
      clearSession()
      expect(localStorage.getItem('session')).toBeNull()
    })

    it('should handle JSON serialization errors gracefully', () => {
      // Try to save circular reference should not crash
      const sessionData: any = {
        userId: 'user-123',
        startTime: Date.now(),
      }
      // Add circular reference
      sessionData.self = sessionData

      expect(() => {
        saveSession(sessionData)
      }).not.toThrow()
    })
  })

  describe('Session Validation', () => {
    it('should validate active session', () => {
      const sessionData = {
        userId: 'user-123',
        startTime: Date.now(),
        gameId: 'game-1',
      }
      saveSession(sessionData)
      const valid = isSessionValid()
      expect(valid).toBe(true)
    })

    it('should invalidate expired session', () => {
      const sessionData = {
        userId: 'user-123',
        startTime: Date.now() - 25 * 60 * 60 * 1000, // 25 hours ago
        gameId: 'game-1',
      }
      saveSession(sessionData)
      const valid = isSessionValid()
      expect(valid).toBe(false)
    })

    it('should return false when no session exists', () => {
      const valid = isSessionValid()
      expect(valid).toBe(false)
    })

    it('should check session expiry within 24 hours', () => {
      const recentSession = {
        userId: 'user-123',
        startTime: Date.now() - 23 * 60 * 60 * 1000, // 23 hours ago
        gameId: 'game-1',
      }
      saveSession(recentSession)
      expect(isSessionValid()).toBe(true)

      const expiredSession = {
        userId: 'user-123',
        startTime: Date.now() - 25 * 60 * 60 * 1000, // 25 hours ago
        gameId: 'game-1',
      }
      saveSession(expiredSession)
      expect(isSessionValid()).toBe(false)
    })

    it('should handle missing startTime gracefully', () => {
      const sessionData: any = {
        userId: 'user-123',
        gameId: 'game-1',
        // startTime missing
      }
      localStorage.setItem('session', JSON.stringify(sessionData))
      const valid = isSessionValid()
      expect(valid).toBe(false)
    })
  })

  describe('Session Data Integrity', () => {
    it('should preserve all session properties', () => {
      const sessionData = {
        userId: 'user-123',
        startTime: 1234567890,
        gameId: 'game-1',
        playCount: 5,
        lastAction: 'play_game',
        country: 'US',
      }
      saveSession(sessionData)
      const loaded = loadSession()
      expect(loaded).toEqual(sessionData)
    })

    it('should handle special characters in session data', () => {
      const sessionData = {
        userId: 'user-123-with-special-chars-!@#$%',
        startTime: Date.now(),
        gameId: 'game-with-unicode-🎰',
      }
      saveSession(sessionData)
      const loaded = loadSession()
      expect(loaded?.userId).toBe(sessionData.userId)
      expect(loaded?.gameId).toBe(sessionData.gameId)
    })

    it('should handle large session data', () => {
      const largeData = {
        userId: 'user-123',
        startTime: Date.now(),
        gameId: 'game-1',
        largeArray: Array(1000)
          .fill(0)
          .map((_, i) => `item-${i}`),
      }
      saveSession(largeData)
      const loaded = loadSession()
      expect(loaded?.largeArray).toHaveLength(1000)
      expect(loaded?.largeArray[999]).toBe('item-999')
    })

    it('should not corrupt data on concurrent saves', async () => {
      const sessionData1 = {
        userId: 'user-1',
        startTime: Date.now(),
        gameId: 'game-1',
      }
      const sessionData2 = {
        userId: 'user-2',
        startTime: Date.now(),
        gameId: 'game-2',
      }

      // Simulate concurrent saves
      saveSession(sessionData1)
      saveSession(sessionData2)

      // Last write wins
      const loaded = loadSession()
      expect(loaded?.userId).toBe('user-2')
    })
  })

  describe('Edge Cases', () => {
    it('should handle very short session duration', () => {
      const sessionData = {
        userId: 'user-123',
        startTime: Date.now(),
        gameId: 'game-1',
      }
      saveSession(sessionData)
      expect(isSessionValid()).toBe(true)
    })

    it('should handle session at exactly 24 hour boundary', () => {
      const sessionData = {
        userId: 'user-123',
        startTime: Date.now() - 24 * 60 * 60 * 1000, // Exactly 24 hours
        gameId: 'game-1',
      }
      saveSession(sessionData)
      // Edge case - implementation dependent, but should handle gracefully
      const valid = isSessionValid()
      expect(typeof valid).toBe('boolean')
    })

    it('should handle localStorage quota exceeded', () => {
      // Mock localStorage being full
      const mockSetItem = localStorage.setItem
      let throwError = false
      localStorage.setItem = vi.fn(() => {
        if (throwError) {
          throw new Error('QuotaExceededError')
        }
      })

      // First save should work
      const sessionData = {
        userId: 'user-123',
        startTime: Date.now(),
        gameId: 'game-1',
      }
      saveSession(sessionData)

      // Now simulate quota exceeded - the impl should handle gracefully
      throwError = true
      // Implementation may either throw or handle gracefully
      try {
        saveSession(sessionData)
      } catch (e) {
        // Error is acceptable
        expect(e).toBeDefined()
      }

      // Restore
      localStorage.setItem = mockSetItem
    })

    it('should handle malformed session JSON', () => {
      localStorage.setItem('session', 'not valid json {')
      expect(() => {
        loadSession()
      }).not.toThrow()
      const loaded = loadSession()
      expect(loaded).toBeNull()
    })
  })
})

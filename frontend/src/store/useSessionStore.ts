import { create } from 'zustand'

interface SessionStore {
  sessionId: string | null
  playCount: number
  lastActivity: string | null
  hasGivenConsent: boolean
  initializeSession: () => void
  recordPlay: (gameId: string) => void
  recordPageView: (page: string) => void
  giveConsent: () => void
  revokeConsent: () => void
  forgetMe: () => void
}

const SESSION_ID_KEY = 'lottery_session_id'
const CONSENT_KEY = 'lottery_consent'
const PLAY_COUNT_KEY = 'lottery_play_count'

function generateSessionId(): string {
  return crypto.randomUUID()
}

export const useSessionStore = create<SessionStore>((set) => ({
  sessionId: null,
  playCount: 0,
  lastActivity: null,
  hasGivenConsent: false,

  initializeSession: () => {
    // Check if session already exists
    let sessionId = localStorage.getItem(SESSION_ID_KEY)
    if (!sessionId) {
      sessionId = generateSessionId()
      localStorage.setItem(SESSION_ID_KEY, sessionId)
    }

    // Check consent status
    const consentGiven = localStorage.getItem(CONSENT_KEY) === 'true'

    // Load play count
    const playCount = parseInt(localStorage.getItem(PLAY_COUNT_KEY) || '0', 10)

    set({
      sessionId,
      playCount,
      hasGivenConsent: consentGiven,
      lastActivity: new Date().toISOString(),
    })

    // Send session tracking data to backend if consent given
    if (consentGiven && sessionId) {
      recordSessionStart(sessionId)
    }
  },

  recordPlay: (gameId: string) => {
    set((state) => {
      const newPlayCount = (state.playCount || 0) + 1
      localStorage.setItem(PLAY_COUNT_KEY, String(newPlayCount))

      // Send metrics data to backend if consent given
      if (state.hasGivenConsent && state.sessionId) {
        recordPlayMetrics(state.sessionId, gameId, newPlayCount)
      }

      return {
        playCount: newPlayCount,
        lastActivity: new Date().toISOString(),
      }
    })
  },

  recordPageView: (page: string) => {
    set((state) => {
      // Send page view tracking to backend if consent given
      if (state.hasGivenConsent && state.sessionId) {
        recordPageViewMetrics(state.sessionId, page)
      }

      return {
        lastActivity: new Date().toISOString(),
      }
    })
  },

  giveConsent: () => {
    localStorage.setItem(CONSENT_KEY, 'true')
    set((state) => {
      // Send consent and retrospective metrics
      if (state.sessionId) {
        recordSessionStart(state.sessionId)
      }
      return { hasGivenConsent: true }
    })
  },

  revokeConsent: () => {
    localStorage.setItem(CONSENT_KEY, 'false')
    set({ hasGivenConsent: false })
  },

  forgetMe: () => {
    const sessionId = localStorage.getItem(SESSION_ID_KEY)
    if (sessionId) {
      // Send deletion request to backend
      deleteSessionData(sessionId)
    }

    // Clear all local storage
    localStorage.removeItem(SESSION_ID_KEY)
    localStorage.removeItem(CONSENT_KEY)
    localStorage.removeItem(PLAY_COUNT_KEY)

    set({
      sessionId: null,
      playCount: 0,
      lastActivity: null,
      hasGivenConsent: false,
    })
  },
}))

// Backend integration functions
async function recordSessionStart(sessionId: string) {
  try {
    await fetch('/api/metrics/session', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        session_id: sessionId,
        event_type: 'session_start',
        timestamp: new Date().toISOString(),
      }),
    })
  } catch (error) {
    console.error('Failed to record session start:', error)
  }
}

async function recordPlayMetrics(sessionId: string, gameId: string, playCount: number) {
  try {
    await fetch('/api/metrics/play', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        session_id: sessionId,
        game_id: gameId,
        play_count: playCount,
        timestamp: new Date().toISOString(),
      }),
    })
  } catch (error) {
    console.error('Failed to record play metrics:', error)
  }
}

async function recordPageViewMetrics(sessionId: string, page: string) {
  try {
    await fetch('/api/metrics/pageview', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        session_id: sessionId,
        page,
        timestamp: new Date().toISOString(),
      }),
    })
  } catch (error) {
    console.error('Failed to record page view:', error)
  }
}

async function deleteSessionData(sessionId: string) {
  try {
    await fetch(`/api/metrics/session/${sessionId}`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (error) {
    console.error('Failed to delete session data:', error)
  }
}

import { v4 as uuidv4 } from 'uuid';

// Storage keys
const STORAGE_KEYS = {
  SESSION_ID: '@lottery_educator/session_id',
  USER_CONSENT: '@lottery_educator/user_consent',
  LAST_PLAYED: '@lottery_educator/last_played',
  PLAY_COUNT: '@lottery_educator/play_count',
  THEME: '@lottery_educator/theme',
  DELETED_AT: '@lottery_educator/deleted_at',
};

export interface UserSession {
  sessionId: string;
  createdAt: string;
  lastActivity: string;
  playCount: number;
  hasConsent: boolean;
  deletedAt?: string;
}

/**
 * Initialize or retrieve user session
 * Creates a unique session ID if none exists
 */
export const initializeSession = (): string => {
  try {
    let sessionId = localStorage.getItem(STORAGE_KEYS.SESSION_ID);

    if (!sessionId) {
      sessionId = uuidv4();
      localStorage.setItem(STORAGE_KEYS.SESSION_ID, sessionId);
      
      const now = new Date().toISOString();
      localStorage.setItem(`@lottery_educator/session_created_${sessionId}`, now);
    }

    const now = new Date().toISOString();
    localStorage.setItem(`@lottery_educator/last_activity_${sessionId}`, now);

    return sessionId;
  } catch (error) {
    console.error('Error initializing session:', error);
    return uuidv4();
  }
};

/**
 * Get current session ID
 */
export const getSessionId = (): string | null => {
  try {
    return localStorage.getItem(STORAGE_KEYS.SESSION_ID);
  } catch (error) {
    console.error('Error getting session ID:', error);
    return null;
  }
};

/**
 * Track user interaction
 */
export const trackInteraction = (linkId: string): void => {
  try {
    const sessionId = getSessionId();
    if (!sessionId) return;

    const key = `@lottery_educator/interaction_${sessionId}_${linkId}`;
    const countStr = localStorage.getItem(key);
    const count = countStr ? parseInt(countStr, 10) : 0;
    localStorage.setItem(key, (count + 1).toString());

    const playCountStr = localStorage.getItem(STORAGE_KEYS.PLAY_COUNT);
    const playCount = playCountStr ? parseInt(playCountStr, 10) : 0;
    localStorage.setItem(STORAGE_KEYS.PLAY_COUNT, (playCount + 1).toString());

    const now = new Date().toISOString();
    localStorage.setItem(STORAGE_KEYS.LAST_PLAYED, now);

    console.log(`Tracked interaction: ${linkId} (count: ${count + 1})`);
  } catch (error) {
    console.error('Error tracking interaction:', error);
  }
};

/**
 * Get user play count
 */
export const getPlayCount = (): number => {
  try {
    const count = localStorage.getItem(STORAGE_KEYS.PLAY_COUNT);
    return count ? parseInt(count, 10) : 0;
  } catch (error) {
    console.error('Error getting play count:', error);
    return 0;
  }
};

/**
 * Store user consent for tracking
 */
export const setUserConsent = (hasConsent: boolean): void => {
  try {
    localStorage.setItem(STORAGE_KEYS.USER_CONSENT, JSON.stringify(hasConsent));
  } catch (error) {
    console.error('Error setting user consent:', error);
  }
};

/**
 * Get user consent status
 */
export const getUserConsent = (): boolean => {
  try {
    const consent = localStorage.getItem(STORAGE_KEYS.USER_CONSENT);
    return consent ? JSON.parse(consent) : false;
  } catch (error) {
    console.error('Error getting user consent:', error);
    return false;
  }
};

/**
 * GDPR "Forget Me" - Mark account as deleted
 */
export const forgetMe = (): void => {
  try {
    const sessionId = getSessionId();
    if (!sessionId) return;

    const now = new Date().toISOString();
    localStorage.setItem(STORAGE_KEYS.DELETED_AT, now);
    localStorage.setItem(`@lottery_educator/deleted_at_${sessionId}`, now);

    console.log('User data marked for deletion (GDPR Forget Me)');
  } catch (error) {
    console.error('Error executing Forget Me:', error);
  }
};

/**
 * Check if user data is marked for deletion
 */
export const isUserDeleted = (): boolean => {
  try {
    const deletedAt = localStorage.getItem(STORAGE_KEYS.DELETED_AT);
    return !!deletedAt;
  } catch (error) {
    console.error('Error checking deletion status:', error);
    return false;
  }
};

/**
 * Get user session info
 */
export const getSessionInfo = (): UserSession | null => {
  try {
    const sessionId = getSessionId();
    if (!sessionId) return null;

    const hasConsent = getUserConsent();
    const playCount = getPlayCount();
    const lastPlayed = localStorage.getItem(STORAGE_KEYS.LAST_PLAYED);
    const deletedAt = localStorage.getItem(STORAGE_KEYS.DELETED_AT);
    const createdAt = localStorage.getItem(`@lottery_educator/session_created_${sessionId}`);
    const lastActivity = localStorage.getItem(`@lottery_educator/last_activity_${sessionId}`);

    return {
      sessionId,
      createdAt: createdAt || new Date().toISOString(),
      lastActivity: lastActivity || lastPlayed || new Date().toISOString(),
      playCount,
      hasConsent,
      deletedAt: deletedAt || undefined,
    };
  } catch (error) {
    console.error('Error getting session info:', error);
    return null;
  }
};

/**
 * Clear all user data (full wipe)
 */
export const clearAllUserData = (): void => {
  try {
    const sessionId = getSessionId();
    
    // Get all keys
    const keys = Object.keys(localStorage);
    
    // Clear session-specific keys
    keys.forEach((key) => {
      if (sessionId && key.includes(`_${sessionId}`)) {
        localStorage.removeItem(key);
      }
    });
    
    // Clear global keys
    Object.values(STORAGE_KEYS).forEach((key) => {
      localStorage.removeItem(key);
    });

    console.log('All user data cleared');
  } catch (error) {
    console.error('Error clearing user data:', error);
  }
};

/**
 * Set app theme preference
 */
export const setThemePreference = (theme: 'light' | 'dark'): void => {
  try {
    localStorage.setItem(STORAGE_KEYS.THEME, theme);
  } catch (error) {
    console.error('Error setting theme:', error);
  }
};

/**
 * Get app theme preference
 */
export const getThemePreference = (): 'light' | 'dark' => {
  try {
    const theme = localStorage.getItem(STORAGE_KEYS.THEME);
    return (theme as 'light' | 'dark') || 'light';
  } catch (error) {
    console.error('Error getting theme:', error);
    return 'light';
  }
};

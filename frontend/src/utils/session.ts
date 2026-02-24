// Session ID utility for anonymous tracking
import { v4 as uuidv4 } from 'uuid';

const SESSION_ID_KEY = 'lottery_educator_session_id';
const SESSION_DATA_KEY = 'session'; // Changed to match test expectations
const SESSION_EXPIRY_MS = 24 * 60 * 60 * 1000; // 24 hours

export interface SessionData {
  userId?: string;
  startTime: number;
  gameId?: string;
  [key: string]: any;
}

// Get or create session ID (UUID v4)
export const getOrCreateSessionId = (): string => {
  try {
    let sessionId = localStorage.getItem(SESSION_ID_KEY);
    if (!sessionId) {
      sessionId = uuidv4();
      localStorage.setItem(SESSION_ID_KEY, sessionId);
    }
    return sessionId;
  } catch (error) {
    console.error('Error managing session ID:', error);
    return uuidv4();
  }
};

// Alias for test compatibility
export const getSessionId = (): string => {
  return getOrCreateSessionId();
};

// Save session data to localStorage
export const saveSession = (data: SessionData): void => {
  try {
    const sessionData: SessionData = {
      ...data,
      startTime: data.startTime || Date.now(),
    };
    localStorage.setItem(SESSION_DATA_KEY, JSON.stringify(sessionData));
  } catch (error) {
    const isJsonError = error instanceof TypeError && 
      (String(error).includes('Converting') || String(error).includes('circular'));
    
    // Silently fail for JSON serialization errors
    if (isJsonError) {
      console.error('Error saving session:', error);
      return;
    }
    
    // Re-throw all other errors (including quota exceeded)
    throw error;
  }
};

// Load session data from localStorage
export const loadSession = (): SessionData | null => {
  try {
    const data = localStorage.getItem(SESSION_DATA_KEY);
    if (!data) {
      return null;
    }
    return JSON.parse(data) as SessionData;
  } catch (error) {
    // Silently fail on malformed JSON
    console.error('Error loading session:', error);
    return null;
  }
};

// Check if session is valid (not expired)
export const isSessionValid = (): boolean => {
  try {
    const session = loadSession();
    if (!session || !session.startTime) {
      return false;
    }

    const now = Date.now();
    const sessionAge = now - session.startTime;

    // Session is valid if less than 24 hours old
    return sessionAge < SESSION_EXPIRY_MS;
  } catch (error) {
    console.error('Error validating session:', error);
    return false;
  }
};

// Clear all session data
export const clearSession = (): void => {
  try {
    localStorage.removeItem(SESSION_DATA_KEY);
  } catch (error) {
    console.error('Error clearing session:', error);
  }
};

export const clearSessionId = (): void => {
  try {
    localStorage.removeItem(SESSION_ID_KEY);
  } catch (error) {
    console.error('Error clearing session ID:', error);
  }
};

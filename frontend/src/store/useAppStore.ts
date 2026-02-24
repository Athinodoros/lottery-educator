// State management store using Zustand
import { create } from 'zustand';
import { Game, GameResult } from '../types';
import { initializeSession, getSessionInfo, forgetMe, trackInteraction, UserSession } from '../utils/storage';

interface AppStore {
  // Game state
  games: Game[];
  currentGame: Game | null;
  currentResult: GameResult | null;
  
  // Session & user state
  sessionId: string | null;
  userSession: UserSession | null;
  isInitialized: boolean;
  
  // Actions
  setGames: (games: Game[]) => void;
  setCurrentGame: (game: Game | null) => void;
  setCurrentResult: (result: GameResult | null) => void;
  resetGameState: () => void;
  
  // Session actions
  initSession: () => Promise<void>;
  trackAction: (linkId: string, page?: string) => Promise<void>;
  deleteUserData: () => Promise<void>;
}

export const useAppStore = create<AppStore>((set, get) => ({
  // Initial state
  games: [],
  currentGame: null,
  currentResult: null,
  sessionId: null,
  userSession: null,
  isInitialized: false,

  // Game state setters
  setGames: (games) => set({ games }),
  setCurrentGame: (game) => set({ currentGame: game }),
  setCurrentResult: (result) => set({ currentResult: result }),
  resetGameState: () => set({ currentGame: null, currentResult: null }),

  // Session initialization
  initSession: async () => {
    try {
      const sessionId = initializeSession();
      const userSession = getSessionInfo();
      set({ sessionId, userSession, isInitialized: true });
      console.info('Session initialized:', sessionId);
    } catch (error) {
      console.error('Error initializing session:', error);
      set({ isInitialized: true });
    }
  },

  // Track user action (click, play, etc.)
  trackAction: async (linkId: string, page?: string) => {
    const { sessionId } = get();
    
    if (!sessionId) {
      console.warn('No session ID available for tracking');
      return;
    }

    try {
      // Track locally
      trackInteraction(linkId);
      
      // Send to backend if you want
      if (page) {
        console.info(`Tracked action: ${linkId} on page: ${page}`);
      }
    } catch (error) {
      console.error('Error tracking action:', error);
    }
  },

  // Delete user data (GDPR Forget Me)
  deleteUserData: async () => {
    try {
      forgetMe();
      set({ sessionId: null, userSession: null });
      console.info('User data deletion initiated');
    } catch (error) {
      console.error('Error deleting user data:', error);
    }
  },
}));


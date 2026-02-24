import { create } from 'zustand';
import { gameApi } from '../api/games';
import { Game, Statistics } from '../types';

interface GamesState {
  games: Game[];
  selectedGameId: string | null;
  statistics: { [key: string]: Statistics };
  isLoading: boolean;
  error: string | null;

  // Actions
  fetchGames: () => Promise<void>;
  selectGame: (gameId: string) => void;
  clearSelection: () => void;
  fetchStatistics: (gameId: string) => Promise<void>;
  resetState: () => void;
}

export const useGamesStore = create<GamesState>((set) => ({
  games: [],
  selectedGameId: null,
  statistics: {},
  isLoading: false,
  error: null,

  fetchGames: async () => {
    set({ isLoading: true, error: null });
    try {
      const games = await gameApi.getGames();
      set({ games, isLoading: false });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to fetch games';
      set({ error: message, isLoading: false });
    }
  },

  selectGame: (gameId: string) => {
    set({ selectedGameId: gameId });
  },

  clearSelection: () => {
    set({ selectedGameId: null });
  },

  fetchStatistics: async (gameId: string) => {
    set({ isLoading: true, error: null });
    try {
      const stats = await gameApi.getStatistics(gameId);
      set((state) => ({
        statistics: {
          ...state.statistics,
          [gameId]: stats,
        },
        isLoading: false,
      }));
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to fetch statistics';
      set({ error: message, isLoading: false });
    }
  },

  resetState: () => {
    set({
      games: [],
      selectedGameId: null,
      statistics: {},
      isLoading: false,
      error: null,
    });
  },
}));

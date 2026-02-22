// State management store using Zustand
import { create } from 'zustand';
import { Game, GameResult } from '../types';

interface AppStore {
  games: Game[];
  currentGame: Game | null;
  currentResult: GameResult | null;
  setGames: (games: Game[]) => void;
  setCurrentGame: (game: Game | null) => void;
  setCurrentResult: (result: GameResult | null) => void;
  resetGameState: () => void;
}

export const useAppStore = create<AppStore>((set) => ({
  games: [],
  currentGame: null,
  currentResult: null,
  setGames: (games) => set({ games }),
  setCurrentGame: (game) => set({ currentGame: game }),
  setCurrentResult: (result) => set({ currentResult: result }),
  resetGameState: () => set({ currentGame: null, currentResult: null }),
}));

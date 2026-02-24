import apiClient from './client';
import { Game, GameResult, Statistics } from '../types';

export const gameApi = {
  // Get all available games
  getGames: async (): Promise<Game[]> => {
    const response = await apiClient.get('/games');
    return response.data;
  },

  // Get specific game
  getGame: async (gameId: string): Promise<Game> => {
    const response = await apiClient.get(`/games/${gameId}`);
    return response.data;
  },

  // Play a game
  playGame: async (gameId: string, selectedNumbers: number[]): Promise<GameResult> => {
    const response = await apiClient.post(`/games/${gameId}/play`, {
      selectedNumbers,
    });
    const d = response.data;
    return {
      id: d.id,
      game_id: gameId,
      selected_numbers: selectedNumbers,
      winning_numbers: d.winningNumbers,
      draws_to_win: d.drawsToWin,
      is_winner: d.isWinner,
      played_at: new Date().toISOString(),
      created_at: new Date().toISOString(),
    };
  },

  // Get game statistics
  getStatistics: async (gameId: string): Promise<Statistics> => {
    const response = await apiClient.get(`/stats/${gameId}`);
    return response.data;
  },

  // Get statistics examples
  getStatisticsExamples: async (gameId: string) => {
    const response = await apiClient.get(`/stats/${gameId}/examples`);
    return response.data;
  },
};

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
  playGame: async (gameId: string, selectedNumbers: number[], selectedExtra?: number[]): Promise<GameResult> => {
    const body: any = { selectedNumbers };
    if (selectedExtra && selectedExtra.length > 0) {
      body.selectedExtra = selectedExtra;
    }

    const response = await apiClient.post(`/games/${gameId}/play`, body);
    const d = response.data;
    return {
      id: d.id,
      game_id: gameId,
      selected_numbers: selectedNumbers,
      winning_numbers: d.winningNumbers,
      selected_extra: d.winningExtra ? selectedExtra : undefined,
      winning_extra: d.winningExtra,
      matched_bonus: d.results?.matchedBonus,
      draws_to_win: d.drawsToWin,
      is_winner: d.isWinner,
      played_at: new Date().toISOString(),
      created_at: new Date().toISOString(),
    };
  },

  // Create a new game (user-submitted)
  createGame: async (data: {
    name: string;
    description?: string;
    number_range: number[];
    numbers_to_select: number;
    bonus_number_range?: number[];
    bonus_numbers_to_select?: number;
  }): Promise<Game> => {
    const response = await apiClient.post('/games', data);
    return response.data;
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

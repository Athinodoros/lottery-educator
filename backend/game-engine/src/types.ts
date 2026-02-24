// Game types and interfaces
export interface Game {
  id: string;
  name: string;
  description: string;
  number_range: number[]; // [min, max]
  numbers_to_select: number;
  bonus_number_range: number[] | null; // [min, max] for bonus pool
  bonus_numbers_to_select: number | null;
  is_approved: boolean;
  created_by: string;
  probability_of_winning: string;
  created_at: string;
}

export interface GamePlay {
  id: string;
  game_id: string;
  selected_numbers: number[];
  winning_numbers: number[];
  selected_extra: number[] | null;
  winning_extra: number[] | null;
  draws_to_win: number;
  is_winner: boolean;
  played_at: string;
}

export interface GamePlayRequest {
  selectedNumbers: number[];
  selectedExtra?: number[];
}

export interface GamePlayResponse {
  id: string;
  winningNumbers: number[];
  winningExtra?: number[];
  drawsToWin: number;
  isWinner: boolean;
  results: {
    matchedNumbers: number;
    matchedBonus: number;
  };
}

export interface CreateGameRequest {
  name: string;
  description?: string;
  number_range: number[]; // [min, max]
  numbers_to_select: number;
  bonus_number_range?: number[]; // [min, max]
  bonus_numbers_to_select?: number;
}

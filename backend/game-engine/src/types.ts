// Game types and interfaces
export interface Game {
  id: string;
  name: string;
  description: string;
  number_range: number[]; // [min, max]
  numbers_to_select: number;
  extra_numbers: number | null;
  probability_of_winning: string;
  created_at: string;
}

export interface GamePlay {
  id: string;
  game_id: string;
  selected_numbers: number[];
  winning_numbers: number[];
  extra_number: number | null;
  draws_to_win: number;
  is_winner: boolean;
  played_at: string;
}

export interface GamePlayRequest {
  selectedNumbers: number[];
  selectedExtra?: number;
}

export interface GamePlayResponse {
  id: string;
  winningNumbers: number[];
  winningExtra?: number;
  drawsToWin: number;
  isWinner: boolean;
  results: {
    matchedNumbers: number;
    matchedBonus: boolean;
  };
}

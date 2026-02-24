// Type definitions for the Lottery Educator application

export interface Game {
  id: string;
  name: string;
  description: string;
  number_range: number[];
  numbers_to_select: number;
  bonus_number_range?: number[] | null;
  bonus_numbers_to_select?: number | null;
  is_approved?: boolean;
  created_by?: string;
  probability_of_winning?: number;
  created_at: string;
  updated_at?: string;
}

export interface GameResult {
  id: string;
  game_id: string;
  selected_numbers: number[];
  winning_numbers: number[];
  selected_extra?: number[];
  winning_extra?: number[];
  matched_bonus?: number;
  draws_to_win: number;
  is_winner: boolean;
  played_at: string;
  created_at: string;
}

export interface Statistics {
  game_id: string;
  name: string;
  total_plays: number;
  total_wins: number;
  avg_draws_to_win: number;
  max_draws_to_win?: number;
  min_draws_to_win?: number;
  win_rate_percent: number;
  last_play_at?: string;
}

export interface StatisticsExample {
  game_id: string;
  description: string;
  example: string;
}

export interface Email {
  id: string;
  sender_email: string;
  subject: string;
  body: string;
  created_at: string;
  is_deleted: boolean;
  deleted_at?: string;
  deleted_reason?: string;
}

export interface ClickMetric {
  id: string;
  link_id: string;
  user_session_id: string;
  click_count: number;
  created_at: string;
  updated_at: string;
}

export interface ApiResponse<T> {
  data?: T;
  error?: string;
  message?: string;
  status: number;
}

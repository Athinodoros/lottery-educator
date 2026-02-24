export interface GameStats {
  game_id: string;
  name: string;
  total_plays: number;
  total_wins: number;
  avg_draws_to_win: number;
  max_draws_to_win: number;
  min_draws_to_win: number;
  win_rate_percent: number;
  last_play_at: string;
}

export interface StatisticsExample {
  timeframe: string;
  description: string;
  drawCount: number;
}

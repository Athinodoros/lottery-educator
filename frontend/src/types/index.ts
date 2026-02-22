// Type definitions for the Lottery Educator application

export interface Game {
  id: string;
  name: string;
  description: string;
  numberRange: number[];
  numbersToSelect: number;
  extraNumbers?: number;
  createdAt: string;
}

export interface GameResult {
  id: string;
  gameId: string;
  selectedNumbers: number[];
  winningNumbers: number[];
  drawsToWin: number;
  playedAt: string;
}

export interface Statistics {
  gameId: string;
  averageDraws: number;
  totalPlays: number;
  winRate: number;
  oddsProbability: number;
}

export interface Email {
  id: string;
  senderEmail: string;
  subject: string;
  body: string;
  createdAt: string;
  isDeleted: boolean;
}

export interface ClickMetric {
  id: string;
  linkId: string;
  userSessionId: string;
  createdAt: string;
}

export interface ApiResponse<T> {
  data?: T;
  error?: string;
  message?: string;
  status: number;
}

import { v4 as uuidv4 } from 'uuid';
import { query, queryOne, queryAll } from './database';
import { Game, GamePlay, GamePlayRequest, GamePlayResponse } from './types';

/**
 * Get all available games
 */
export async function getAllGames(): Promise<Game[]> {
  const games = await queryAll<Game>(
    'SELECT * FROM games ORDER BY created_at DESC'
  );
  return games;
}

/**
 * Get a specific game by ID
 */
export async function getGameById(gameId: string): Promise<Game | null> {
  const game = await queryOne<Game>(
    'SELECT * FROM games WHERE id = $1',
    [gameId]
  );
  return game;
}

/**
 * Generate random unique numbers within a range
 */
function generateRandomNumbers(count: number, min: number, max: number): number[] {
  const numbers = new Set<number>();
  while (numbers.size < count) {
    const num = Math.floor(Math.random() * (max - min + 1)) + min;
    numbers.add(num);
  }
  return Array.from(numbers).sort((a, b) => a - b);
}

/**
 * Count matching numbers between two arrays
 */
function countMatches(selected: number[], winning: number[]): number {
  return selected.filter((num) => winning.includes(num)).length;
}

/**
 * Binomial coefficient C(n, k)
 */
function binomialCoeff(n: number, k: number): number {
  if (k > n) return 0;
  if (k === 0 || k === n) return 1;
  k = Math.min(k, n - k);
  let result = 1;
  for (let i = 0; i < k; i++) {
    result = (result * (n - i)) / (i + 1);
  }
  return Math.round(result);
}

/**
 * Calculate jackpot win probability from game parameters
 */
function calcWinProbability(game: Game): number {
  const [min, max] = game.number_range;
  const range = max - min + 1;
  const combos = binomialCoeff(range, game.numbers_to_select);
  return 1 / (combos * (game.extra_numbers ?? 1));
}

/**
 * Sample draws-to-win from a geometric distribution (O(1), mathematically exact)
 */
function sampleDrawsToWin(probability: number): number {
  // Inverse CDF of geometric distribution: ceil(log(U) / log(1-p))
  // Clamp away from 0 to prevent log(0) = -Infinity
  const u = Math.max(Number.EPSILON, Math.random());
  return Math.ceil(Math.log(u) / Math.log(1 - probability));
}

/**
 * Play a single game draw
 */
function simulateDraw(
  selectedNumbers: number[],
  numberRange: number[],
  numbersToSelect: number,
  selectedExtra?: number,
  extraRange?: [number, number]
): {
  winningNumbers: number[];
  winningExtra?: number;
  matches: number;
  extraMatch: boolean;
} {
  const [min, max] = numberRange;
  const winningNumbers = generateRandomNumbers(numbersToSelect, min, max);
  const matches = countMatches(selectedNumbers, winningNumbers);
  
  let winningExtra: number | undefined;
  let extraMatch = false;
  
  if (selectedExtra !== undefined && extraRange) {
    winningExtra = Math.floor(Math.random() * (extraRange[1] - extraRange[0] + 1)) + extraRange[0];
    extraMatch = winningExtra === selectedExtra;
  }

  return {
    winningNumbers,
    winningExtra,
    matches,
    extraMatch,
  };
}

/**
 * Play a lottery game - simulate draws until winning or reaching limit
 */
export async function playGame(
  gameId: string,
  request: GamePlayRequest
): Promise<GamePlayResponse> {
  // Get game details
  const game = await getGameById(gameId);
  if (!game) {
    throw new Error(`Game not found: ${gameId}`);
  }

  const { number_range, numbers_to_select, extra_numbers } = game;
  const [min, max] = number_range;
  
  // Validate selected numbers
  if (request.selectedNumbers.length !== numbers_to_select) {
    throw new Error(
      `Invalid number count. Expected ${numbers_to_select}, got ${request.selectedNumbers.length}`
    );
  }

  if (request.selectedNumbers.some((n) => n < min || n > max)) {
    throw new Error(
      `Numbers must be between ${min} and ${max}`
    );
  }

  if (request.selectedExtra !== undefined && extra_numbers !== null) {
    if (request.selectedExtra < 1 || request.selectedExtra > extra_numbers) {
      throw new Error(
        `Extra number must be between 1 and ${extra_numbers}`
      );
    }
  }

  // Sample draws-to-win from geometric distribution (mathematically exact, O(1))
  const probability = calcWinProbability(game);
  const drawCount = sampleDrawsToWin(probability);

  // Generate the winning draw to display
  const lastDraw = simulateDraw(
    request.selectedNumbers,
    number_range,
    numbers_to_select,
    request.selectedExtra,
    extra_numbers ? [1, extra_numbers] : undefined
  );
  const isWinner = drawCount === 1;

  // Save result to database
  const resultId = uuidv4();
  await query(
    `INSERT INTO game_results 
      (id, game_id, selected_numbers, winning_numbers, extra_number, draws_to_win)
     VALUES ($1, $2, $3, $4, $5, $6)`,
    [
      resultId,
      gameId,
      request.selectedNumbers,
      lastDraw.winningNumbers,
      lastDraw.winningExtra || null,
      drawCount,
    ]
  );

  return {
    id: resultId,
    winningNumbers: lastDraw.winningNumbers,
    winningExtra: lastDraw.winningExtra,
    drawsToWin: drawCount,
    isWinner,
    results: {
      matchedNumbers: lastDraw.matches,
      matchedBonus: lastDraw.extraMatch,
    },
  };
}

/**
 * Get a game result by ID
 */
export async function getGameResult(resultId: string): Promise<GamePlay | null> {
  const result = await queryOne<GamePlay>(
    'SELECT * FROM game_results WHERE id = $1',
    [resultId]
  );
  return result;
}

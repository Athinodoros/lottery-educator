import { v4 as uuidv4 } from 'uuid';
import { query, queryOne, queryAll } from './database';
import { Game, GamePlay, GamePlayRequest, GamePlayResponse, CreateGameRequest } from './types';

/**
 * Get all available games
 */
export async function getAllGames(approvedOnly = true): Promise<Game[]> {
  const sql = approvedOnly
    ? 'SELECT * FROM games WHERE is_approved = true ORDER BY created_at DESC'
    : 'SELECT * FROM games ORDER BY created_at DESC';
  return queryAll<Game>(sql);
}

/**
 * Get a specific game by ID
 */
export async function getGameById(gameId: string): Promise<Game | null> {
  return queryOne<Game>('SELECT * FROM games WHERE id = $1', [gameId]);
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
  const mainCombos = binomialCoeff(range, game.numbers_to_select);

  let bonusCombos = 1;
  if (game.bonus_number_range && game.bonus_numbers_to_select) {
    const [bMin, bMax] = game.bonus_number_range;
    const bonusRange = bMax - bMin + 1;
    bonusCombos = binomialCoeff(bonusRange, game.bonus_numbers_to_select);
  }

  return 1 / (mainCombos * bonusCombos);
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
 * Simulate a single draw for both main and bonus pools
 */
function simulateDraw(
  selectedNumbers: number[],
  numberRange: number[],
  numbersToSelect: number,
  selectedExtra?: number[],
  bonusRange?: number[] | null,
  bonusCount?: number | null
): {
  winningNumbers: number[];
  winningExtra?: number[];
  matches: number;
  bonusMatches: number;
} {
  const [min, max] = numberRange;
  const winningNumbers = generateRandomNumbers(numbersToSelect, min, max);
  const matches = countMatches(selectedNumbers, winningNumbers);

  let winningExtra: number[] | undefined;
  let bonusMatches = 0;

  if (selectedExtra && bonusRange && bonusCount) {
    const [bMin, bMax] = bonusRange;
    winningExtra = generateRandomNumbers(bonusCount, bMin, bMax);
    bonusMatches = countMatches(selectedExtra, winningExtra);
  }

  return { winningNumbers, winningExtra, matches, bonusMatches };
}

/**
 * Play a lottery game - simulate draws until winning or reaching limit
 */
export async function playGame(
  gameId: string,
  request: GamePlayRequest
): Promise<GamePlayResponse> {
  const game = await getGameById(gameId);
  if (!game) {
    throw new Error(`Game not found: ${gameId}`);
  }

  const { number_range, numbers_to_select, bonus_number_range, bonus_numbers_to_select } = game;
  const [min, max] = number_range;

  // Validate main numbers
  if (request.selectedNumbers.length !== numbers_to_select) {
    throw new Error(
      `Invalid number count. Expected ${numbers_to_select}, got ${request.selectedNumbers.length}`
    );
  }
  if (request.selectedNumbers.some((n) => n < min || n > max)) {
    throw new Error(`Numbers must be between ${min} and ${max}`);
  }

  // Validate bonus numbers
  if (bonus_number_range && bonus_numbers_to_select) {
    const [bMin, bMax] = bonus_number_range;
    if (!request.selectedExtra || request.selectedExtra.length !== bonus_numbers_to_select) {
      throw new Error(
        `Expected ${bonus_numbers_to_select} bonus number(s), got ${request.selectedExtra?.length ?? 0}`
      );
    }
    if (request.selectedExtra.some((n) => n < bMin || n > bMax)) {
      throw new Error(`Bonus numbers must be between ${bMin} and ${bMax}`);
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
    bonus_number_range,
    bonus_numbers_to_select
  );
  const isWinner = drawCount === 1;

  // Save result to database
  const resultId = uuidv4();
  await query(
    `INSERT INTO game_results
      (id, game_id, selected_numbers, winning_numbers, selected_extra, winning_extra, draws_to_win)
     VALUES ($1, $2, $3, $4, $5, $6, $7)`,
    [
      resultId,
      gameId,
      request.selectedNumbers,
      lastDraw.winningNumbers,
      request.selectedExtra || null,
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
      matchedBonus: lastDraw.bonusMatches,
    },
  };
}

/**
 * Get a game result by ID
 */
export async function getGameResult(resultId: string): Promise<GamePlay | null> {
  return queryOne<GamePlay>('SELECT * FROM game_results WHERE id = $1', [resultId]);
}

/**
 * Create a new user-submitted game (pending approval)
 */
export async function createGame(data: CreateGameRequest): Promise<Game> {
  const [min, max] = data.number_range;
  const range = max - min + 1;
  const mainCombos = binomialCoeff(range, data.numbers_to_select);

  let bonusCombos = 1;
  if (data.bonus_number_range && data.bonus_numbers_to_select) {
    const [bMin, bMax] = data.bonus_number_range;
    const bonusRange = bMax - bMin + 1;
    bonusCombos = binomialCoeff(bonusRange, data.bonus_numbers_to_select);
  }

  const probability = 1 / (mainCombos * bonusCombos);
  const id = uuidv4();

  await query(
    `INSERT INTO games (id, name, description, number_range, numbers_to_select, bonus_number_range, bonus_numbers_to_select, probability_of_winning, is_approved, created_by)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, false, 'user')`,
    [
      id,
      data.name,
      data.description || null,
      data.number_range,
      data.numbers_to_select,
      data.bonus_number_range || null,
      data.bonus_numbers_to_select || null,
      probability,
    ]
  );

  const game = await getGameById(id);
  return game!;
}

/**
 * Approve a pending game
 */
export async function approveGame(gameId: string): Promise<Game | null> {
  await query('UPDATE games SET is_approved = true WHERE id = $1', [gameId]);
  return getGameById(gameId);
}

/**
 * Delete an unapproved game (reject)
 */
export async function deleteGame(gameId: string): Promise<boolean> {
  const game = await getGameById(gameId);
  if (!game) return false;
  if (game.is_approved && game.created_by === 'system') {
    throw new Error('Cannot delete system-approved games');
  }
  const result = await query('DELETE FROM games WHERE id = $1', [gameId]);
  return (result as any).rowCount > 0;
}

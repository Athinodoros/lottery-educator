/**
 * Seed: 01_games
 * Inserts the initial lottery game definitions.
 * Safe to re-run: uses INSERT ... ON CONFLICT DO NOTHING.
 */

/** @param {import('knex').Knex} knex */
exports.seed = async function (knex) {
  await knex.raw(`
    INSERT INTO games (name, description, number_range, numbers_to_select, bonus_number_range, bonus_numbers_to_select)
    VALUES
      (
        'Powerball',
        'US Powerball lottery game. Select 5 numbers from 1-69 and 1 Powerball (1-26).',
        ARRAY[1, 69], 5, ARRAY[1, 26], 1
      ),
      (
        'Mega Millions',
        'US Mega Millions lottery game. Select 5 numbers from 1-70 and 1 Mega Ball (1-25).',
        ARRAY[1, 70], 5, ARRAY[1, 25], 1
      ),
      (
        'EuroMillions',
        'European lottery game. Select 5 numbers from 1-50 and 2 Lucky Stars (1-12).',
        ARRAY[1, 50], 5, ARRAY[1, 12], 2
      ),
      (
        'UK Lotto',
        'UK National Lottery game. Select 6 numbers from 1-59.',
        ARRAY[1, 59], 6, NULL, NULL
      ),
      (
        'French Lotto (Loto)',
        'French National Lottery. Select 5 numbers from 1-49 and 1 Chance number (1-10).',
        ARRAY[1, 49], 5, ARRAY[1, 10], 1
      ),
      (
        'Lotto',
        'Greek OPAP Lotto. Select 6 numbers from 1-49. Jackpot odds: 1 in 13,983,816.',
        ARRAY[1, 49], 6, NULL, NULL
      ),
      (
        'Joker',
        'Greek OPAP Joker. Select 5 numbers from 1-45 plus 1 Joker number from 1-20. Jackpot odds: 1 in 24,435,180.',
        ARRAY[1, 45], 5, ARRAY[1, 20], 1
      ),
      (
        'Superball',
        'Greek OPAP Superball. Select 5 numbers from 1-35 plus 1 Superball from 1-10. Jackpot odds: 1 in 3,246,320.',
        ARRAY[1, 35], 5, ARRAY[1, 10], 1
      ),
      (
        'Euromillions',
        'European EuroMillions lottery. Select 5 numbers from 1-50 and 2 Lucky Stars from 1-12. Jackpot odds: 1 in 139,838,160.',
        ARRAY[1, 50], 5, ARRAY[1, 12], 2
      )
    ON CONFLICT (name) DO NOTHING
  `)
}

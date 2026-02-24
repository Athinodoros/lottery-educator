/**
 * Migration: multi_pool_and_user_games
 *
 * - Adds bonus_number_range (INTEGER[]) and bonus_numbers_to_select to games
 * - Adds is_approved and created_by to games (for user-created games)
 * - Adds selected_extra and winning_extra (INTEGER[]) to game_results
 * - Migrates existing data from extra_numbers / extra_number
 * - Drops old extra_numbers / extra_number columns
 * - Recreates game_statistics view to filter approved games only
 */

/** @param {import('knex').Knex} knex */
exports.up = async function (knex) {
  // ── games table: add new columns ──────────────────────────────────
  await knex.schema.alterTable('games', (t) => {
    t.specificType('bonus_number_range', 'INTEGER[]')
    t.integer('bonus_numbers_to_select')
    t.boolean('is_approved').defaultTo(true)
    t.string('created_by', 255).defaultTo('system')
  })

  // Populate bonus columns for existing seeded games
  const bonusMappings = [
    { name: 'Powerball',          range: [1, 26], count: 1 },
    { name: 'Mega Millions',      range: [1, 25], count: 1 },
    { name: 'EuroMillions',       range: [1, 12], count: 2 },
    { name: 'French Lotto (Loto)', range: [1, 10], count: 1 },
    { name: 'Joker',              range: [1, 20], count: 1 },
    { name: 'Superball',          range: [1, 10], count: 1 },
    { name: 'Euromillions',       range: [1, 12], count: 2 },
  ]

  for (const { name, range, count } of bonusMappings) {
    await knex.raw(
      `UPDATE games SET bonus_number_range = ARRAY[?, ?], bonus_numbers_to_select = ? WHERE name = ?`,
      [range[0], range[1], count, name]
    )
  }

  // Drop old extra_numbers column
  await knex.schema.alterTable('games', (t) => {
    t.dropColumn('extra_numbers')
  })

  // ── game_results table: add new columns ───────────────────────────
  await knex.raw(`ALTER TABLE game_results ADD COLUMN selected_extra INTEGER[]`)
  await knex.raw(`ALTER TABLE game_results ADD COLUMN winning_extra INTEGER[]`)

  // Migrate existing extra_number data into winning_extra array
  await knex.raw(`
    UPDATE game_results
    SET winning_extra = ARRAY[extra_number]
    WHERE extra_number IS NOT NULL
  `)

  // Drop old extra_number column
  await knex.raw(`ALTER TABLE game_results DROP COLUMN extra_number`)

  // ── Recreate game_statistics view to only show approved games ─────
  await knex.raw(`DROP VIEW IF EXISTS game_statistics`)
  await knex.raw(`
    CREATE VIEW game_statistics AS
    SELECT
      gr.game_id,
      g.name,
      COUNT(*)                                                                AS total_plays,
      COUNT(CASE WHEN gr.is_winner THEN 1 END)                               AS total_wins,
      ROUND(AVG(gr.draws_to_win), 2)                                         AS avg_draws_to_win,
      MAX(gr.draws_to_win)                                                   AS max_draws_to_win,
      MIN(gr.draws_to_win)                                                   AS min_draws_to_win,
      ROUND(COUNT(CASE WHEN gr.is_winner THEN 1 END)::NUMERIC / COUNT(*) * 100, 4)
                                                                             AS win_rate_percent,
      MAX(gr.created_at)                                                     AS last_play_at
    FROM game_results gr
    JOIN games g ON gr.game_id = g.id
    WHERE g.is_approved = true
    GROUP BY gr.game_id, g.name
  `)
  await knex.raw(`COMMENT ON VIEW game_statistics IS 'Aggregated statistics per game type (approved games only)'`)
}

/** @param {import('knex').Knex} knex */
exports.down = async function (knex) {
  // Restore game_statistics view without is_approved filter
  await knex.raw(`DROP VIEW IF EXISTS game_statistics`)
  await knex.raw(`
    CREATE VIEW game_statistics AS
    SELECT
      gr.game_id,
      g.name,
      COUNT(*)                                                                AS total_plays,
      COUNT(CASE WHEN gr.is_winner THEN 1 END)                               AS total_wins,
      ROUND(AVG(gr.draws_to_win), 2)                                         AS avg_draws_to_win,
      MAX(gr.draws_to_win)                                                   AS max_draws_to_win,
      MIN(gr.draws_to_win)                                                   AS min_draws_to_win,
      ROUND(COUNT(CASE WHEN gr.is_winner THEN 1 END)::NUMERIC / COUNT(*) * 100, 4)
                                                                             AS win_rate_percent,
      MAX(gr.created_at)                                                     AS last_play_at
    FROM game_results gr
    JOIN games g ON gr.game_id = g.id
    GROUP BY gr.game_id, g.name
  `)

  // Restore extra_number on game_results
  await knex.raw(`ALTER TABLE game_results ADD COLUMN extra_number INTEGER`)
  await knex.raw(`
    UPDATE game_results
    SET extra_number = winning_extra[1]
    WHERE winning_extra IS NOT NULL AND array_length(winning_extra, 1) > 0
  `)
  await knex.raw(`ALTER TABLE game_results DROP COLUMN IF EXISTS selected_extra`)
  await knex.raw(`ALTER TABLE game_results DROP COLUMN IF EXISTS winning_extra`)

  // Restore extra_numbers on games
  await knex.schema.alterTable('games', (t) => {
    t.integer('extra_numbers')
  })

  // Re-populate from bonus columns
  await knex.raw(`
    UPDATE games SET extra_numbers = bonus_numbers_to_select WHERE bonus_numbers_to_select IS NOT NULL
  `)

  await knex.schema.alterTable('games', (t) => {
    t.dropColumn('bonus_number_range')
    t.dropColumn('bonus_numbers_to_select')
    t.dropColumn('is_approved')
    t.dropColumn('created_by')
  })
}

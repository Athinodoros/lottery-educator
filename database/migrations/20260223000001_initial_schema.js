/**
 * Migration: initial_schema
 * Creates all tables, indexes, views, triggers, and comments
 * matching database/schema.sql
 */

/** @param {import('knex').Knex} knex */
exports.up = async function (knex) {
  // ── games ──────────────────────────────────────────────────────────────────
  await knex.schema.createTable('games', (t) => {
    t.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'))
    t.string('name', 255).notNullable().unique()
    t.text('description')
    t.specificType('number_range', 'INTEGER[]').notNullable()
    t.integer('numbers_to_select').notNullable()
    t.integer('extra_numbers')
    t.decimal('probability_of_winning', 20, 19)
    t.timestamp('created_at', { useTz: true }).defaultTo(knex.fn.now())
    t.timestamp('updated_at', { useTz: true }).defaultTo(knex.fn.now())
  })

  // ── game_results ───────────────────────────────────────────────────────────
  // Needs raw because of the GENERATED ALWAYS AS computed column
  await knex.raw(`
    CREATE TABLE game_results (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      game_id UUID NOT NULL REFERENCES games(id) ON DELETE RESTRICT,
      selected_numbers INTEGER[] NOT NULL,
      winning_numbers  INTEGER[] NOT NULL,
      extra_number     INTEGER,
      draws_to_win     INTEGER NOT NULL,
      is_winner        BOOLEAN GENERATED ALWAYS AS (draws_to_win = 1) STORED,
      played_at        TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
      created_at       TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    )
  `)

  // ── emails ─────────────────────────────────────────────────────────────────
  await knex.schema.createTable('emails', (t) => {
    t.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'))
    t.string('sender_email', 255).notNullable()
    t.string('subject', 255).notNullable()
    t.text('body').notNullable()
    t.boolean('is_deleted').defaultTo(false)
    t.timestamp('created_at', { useTz: true }).defaultTo(knex.fn.now())
    t.timestamp('deleted_at', { useTz: true })
    t.string('deleted_reason', 255)
  })

  // ── click_metrics ──────────────────────────────────────────────────────────
  await knex.schema.createTable('click_metrics', (t) => {
    t.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'))
    t.string('link_id', 255).notNullable()
    t.uuid('user_session_id')
    t.integer('click_count').defaultTo(1)
    t.timestamp('created_at', { useTz: true }).defaultTo(knex.fn.now())
    t.timestamp('updated_at', { useTz: true }).defaultTo(knex.fn.now())
  })

  // ── indexes ────────────────────────────────────────────────────────────────
  await knex.raw('CREATE INDEX idx_game_results_game_id    ON game_results(game_id)')
  await knex.raw('CREATE INDEX idx_game_results_created_at ON game_results(created_at)')
  await knex.raw('CREATE INDEX idx_game_results_is_winner  ON game_results(is_winner)')
  await knex.raw('CREATE INDEX idx_emails_created_at       ON emails(created_at)')
  await knex.raw('CREATE INDEX idx_emails_is_deleted       ON emails(is_deleted)')
  await knex.raw('CREATE INDEX idx_click_metrics_link_id         ON click_metrics(link_id)')
  await knex.raw('CREATE INDEX idx_click_metrics_user_session_id ON click_metrics(user_session_id)')
  await knex.raw('CREATE INDEX idx_click_metrics_created_at      ON click_metrics(created_at)')

  // ── views ──────────────────────────────────────────────────────────────────
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

  await knex.raw(`
    CREATE VIEW click_metrics_summary AS
    SELECT
      link_id,
      COUNT(DISTINCT user_session_id)  AS unique_sessions,
      COUNT(*)                         AS total_clicks,
      ROUND(AVG(click_count), 2)       AS avg_clicks_per_session,
      MAX(updated_at)                  AS last_click_at
    FROM click_metrics
    GROUP BY link_id
  `)

  // ── trigger function + triggers ────────────────────────────────────────────
  await knex.raw(`
    CREATE OR REPLACE FUNCTION update_updated_at_column()
    RETURNS TRIGGER AS $$
    BEGIN
      NEW.updated_at = CURRENT_TIMESTAMP;
      RETURN NEW;
    END;
    $$ LANGUAGE plpgsql
  `)

  await knex.raw(`
    CREATE TRIGGER update_games_timestamp
    BEFORE UPDATE ON games
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column()
  `)

  await knex.raw(`
    CREATE TRIGGER update_click_metrics_timestamp
    BEFORE UPDATE ON click_metrics
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column()
  `)

  // ── comments ───────────────────────────────────────────────────────────────
  await knex.raw(`COMMENT ON TABLE games             IS 'Lottery game definitions with odds and parameters'`)
  await knex.raw(`COMMENT ON TABLE game_results      IS 'Individual game plays and draw outcomes'`)
  await knex.raw(`COMMENT ON TABLE emails            IS 'Contact form submissions (soft-deletable for GDPR)'`)
  await knex.raw(`COMMENT ON TABLE click_metrics     IS 'User interaction metrics (no IP tracking)'`)
  await knex.raw(`COMMENT ON VIEW  game_statistics   IS 'Aggregated statistics per game type'`)
  await knex.raw(`COMMENT ON VIEW  click_metrics_summary IS 'Aggregated click tracking metrics'`)
}

/** @param {import('knex').Knex} knex */
exports.down = async function (knex) {
  await knex.raw('DROP TRIGGER IF EXISTS update_click_metrics_timestamp ON click_metrics')
  await knex.raw('DROP TRIGGER IF EXISTS update_games_timestamp ON games')
  await knex.raw('DROP FUNCTION IF EXISTS update_updated_at_column()')
  await knex.raw('DROP VIEW IF EXISTS click_metrics_summary')
  await knex.raw('DROP VIEW IF EXISTS game_statistics')
  await knex.schema.dropTableIfExists('click_metrics')
  await knex.schema.dropTableIfExists('emails')
  await knex.schema.dropTableIfExists('game_results')
  await knex.schema.dropTableIfExists('games')
}

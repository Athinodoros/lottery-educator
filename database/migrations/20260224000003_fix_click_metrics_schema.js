/**
 * Migration: fix_click_metrics_schema
 *
 * Aligns click_metrics table with what the metrics service code expects:
 * - Renames user_session_id → session_id
 * - Adds on_page column
 * - Recreates click_metrics_summary view with updated column names
 */

/** @param {import('knex').Knex} knex */
exports.up = async function (knex) {
  // Drop the view that references old column names
  await knex.raw(`DROP VIEW IF EXISTS click_metrics_summary`)

  // Rename user_session_id → session_id
  await knex.raw(`ALTER TABLE click_metrics RENAME COLUMN user_session_id TO session_id`)

  // Add on_page column
  await knex.schema.alterTable('click_metrics', (t) => {
    t.string('on_page', 255)
  })

  // Drop the old index and create a new one with the correct column name
  await knex.raw(`DROP INDEX IF EXISTS idx_click_metrics_user_session_id`)
  await knex.raw(`CREATE INDEX idx_click_metrics_session_id ON click_metrics(session_id)`)

  // Recreate click_metrics_summary view with updated column names
  await knex.raw(`
    CREATE VIEW click_metrics_summary AS
    SELECT
      link_id,
      COUNT(DISTINCT session_id)  AS unique_sessions,
      COUNT(*)                    AS total_clicks,
      ROUND(AVG(click_count), 2) AS avg_clicks_per_session,
      MAX(updated_at)            AS last_click_at
    FROM click_metrics
    GROUP BY link_id
  `)
}

/** @param {import('knex').Knex} knex */
exports.down = async function (knex) {
  await knex.raw(`DROP VIEW IF EXISTS click_metrics_summary`)

  await knex.raw(`DROP INDEX IF EXISTS idx_click_metrics_session_id`)

  await knex.schema.alterTable('click_metrics', (t) => {
    t.dropColumn('on_page')
  })

  await knex.raw(`ALTER TABLE click_metrics RENAME COLUMN session_id TO user_session_id`)

  await knex.raw(`CREATE INDEX idx_click_metrics_user_session_id ON click_metrics(user_session_id)`)

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
}

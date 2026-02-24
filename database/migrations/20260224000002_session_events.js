/**
 * Migration: session_events
 *
 * Creates a table for tracking session-level events (session starts,
 * page views, and play events) sent by the frontend session store.
 */

/** @param {import('knex').Knex} knex */
exports.up = async function (knex) {
  await knex.schema.createTable('session_events', (t) => {
    t.uuid('id').primary()
    t.string('session_id', 255).notNullable()
    t.string('event_type', 50).notNullable() // 'session_start', 'play', 'pageview'
    t.jsonb('metadata').defaultTo('{}')
    t.timestamp('created_at').notNullable().defaultTo(knex.fn.now())

    t.index('session_id')
    t.index('event_type')
    t.index('created_at')
  })
}

/** @param {import('knex').Knex} knex */
exports.down = async function (knex) {
  await knex.schema.dropTableIfExists('session_events')
}

#!/usr/bin/env node
/**
 * Helper: new-migration
 * Usage: npm run new-migration <migration-name>
 * Example: npm run new-migration add_user_preferences_table
 *
 * Generates a timestamped migration file in ./migrations/
 * with an up() and down() stub ready to fill in.
 */

const fs = require('fs')
const path = require('path')

const name = process.argv[2]

if (!name) {
  console.error('Usage: npm run new-migration <migration-name>')
  console.error('Example: npm run new-migration add_user_preferences_table')
  process.exit(1)
}

// Sanitise: lowercase, spaces → underscores, strip non-alphanum/_
const safeName = name
  .toLowerCase()
  .replace(/\s+/g, '_')
  .replace(/[^a-z0-9_]/g, '')

if (!safeName) {
  console.error('Migration name must contain at least one alphanumeric character.')
  process.exit(1)
}

// Timestamp: YYYYMMDDHHmmss
const now = new Date()
const pad = (n) => String(n).padStart(2, '0')
const timestamp =
  `${now.getFullYear()}` +
  `${pad(now.getMonth() + 1)}` +
  `${pad(now.getDate())}` +
  `${pad(now.getHours())}` +
  `${pad(now.getMinutes())}` +
  `${pad(now.getSeconds())}`

const filename = `${timestamp}_${safeName}.js`
const migrationsDir = path.join(__dirname, '..', 'migrations')
const filepath = path.join(migrationsDir, filename)

const template = `/**
 * Migration: ${safeName}
 * Created: ${now.toISOString()}
 */

/** @param {import('knex').Knex} knex */
exports.up = async function (knex) {
  // TODO: implement migration
  //
  // Examples:
  //   await knex.schema.createTable('table_name', (t) => { ... })
  //   await knex.schema.table('table_name', (t) => { t.string('col') })
  //   await knex.raw('ALTER TABLE ... ADD COLUMN ...')
}

/** @param {import('knex').Knex} knex */
exports.down = async function (knex) {
  // TODO: implement rollback
  //
  //   await knex.schema.dropTableIfExists('table_name')
  //   await knex.schema.table('table_name', (t) => { t.dropColumn('col') })
}
`

fs.writeFileSync(filepath, template, 'utf8')
console.log(`Created: migrations/${filename}`)

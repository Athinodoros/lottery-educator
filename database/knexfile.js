require('dotenv').config()

/** @type {import('knex').Knex.Config} */
const base = {
  client: 'pg',
  migrations: {
    directory: './migrations',
    tableName: 'knex_migrations',
  },
  seeds: {
    directory: './seeds',
  },
}

module.exports = {
  development: {
    ...base,
    connection: {
      host: process.env.DB_HOST || '192.168.1.164',
      port: parseInt(process.env.DB_PORT || '5432'),
      user: process.env.DB_USER || 'postgres',
      password: process.env.DB_PASSWORD || 'postgres',
      database: process.env.DB_NAME || 'lottery_dev',
    },
  },

  test: {
    ...base,
    connection:
      process.env.DATABASE_URL ||
      'postgres://postgres:postgres@localhost:5432/lottery_test',
  },

  production: {
    ...base,
    connection: process.env.DATABASE_URL,
    pool: { min: 2, max: 10 },
  },
}

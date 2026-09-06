import { createClient } from '@libsql/client'
import { drizzle } from 'drizzle-orm/libsql'
import * as schema from './schema'

/**
 * Singleton Turso/LibSQL client.
 *
 * In production:  TURSO_DATABASE_URL = libsql://your-db.turso.io
 *                 TURSO_AUTH_TOKEN   = eyJ...
 *
 * In local dev:   TURSO_DATABASE_URL = file:local.db
 *                 TURSO_AUTH_TOKEN   = (omit / leave blank)
 *
 * The `global` trick prevents multiple client instances during
 * Next.js hot-module replacement in development.
 */

// Extend global to hold our singleton
declare global {
  // eslint-disable-next-line no-var
  var __drizzle: ReturnType<typeof drizzle<typeof schema>> | undefined
}

function buildClient() {
  const url = process.env.TURSO_DATABASE_URL

  if (!url) {
    throw new Error(
      '[untold/db] Missing TURSO_DATABASE_URL environment variable.\n' +
        'Copy .env.example to .env.local and fill in your Turso credentials.\n' +
        'For local dev without Turso, set TURSO_DATABASE_URL=file:local.db',
    )
  }

  const authToken = process.env.TURSO_AUTH_TOKEN || undefined

  const client = createClient({ url, authToken })

  return drizzle(client, { schema })
}

// ── Singleton ─────────────────────────────────────────────────────────────────
export const db: ReturnType<typeof drizzle<typeof schema>> =
  globalThis.__drizzle ?? (globalThis.__drizzle = buildClient())

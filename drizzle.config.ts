import { defineConfig } from 'drizzle-kit'
import { loadEnvConfig } from '@next/env'

// Load Next.js .env.local so drizzle-kit CLI picks up credentials
loadEnvConfig(process.cwd())

const url = process.env.TURSO_DATABASE_URL ?? 'file:local.db'
const authToken = process.env.TURSO_AUTH_TOKEN

// Use 'sqlite' dialect for local file-based DB, 'turso' for remote Turso
const isLocal = url.startsWith('file:')

export default defineConfig({
  schema: './src/lib/db/schema.ts',
  out: './drizzle',
  dialect: isLocal ? 'sqlite' : 'turso',
  dbCredentials: isLocal
    ? { url }
    : { url, authToken },
})

import { createClient } from '@libsql/client'
import nextEnv from '@next/env'
const { loadEnvConfig } = nextEnv

loadEnvConfig(process.cwd())

const url = process.env.TURSO_DATABASE_URL
const authToken = process.env.TURSO_AUTH_TOKEN || undefined

if (!url) {
  console.error('No TURSO_DATABASE_URL found.')
  process.exit(1)
}

const client = createClient({ url, authToken })

async function run() {
  console.log('Connecting to database:', url)
  try {
    await client.execute(`
      CREATE INDEX IF NOT EXISTS posts_feed_idx
      ON posts (is_flagged, created_at DESC);
    `)
    console.log('✓ Created index posts_feed_idx')

    await client.execute(`
      CREATE INDEX IF NOT EXISTS posts_category_idx
      ON posts (category, is_flagged, created_at DESC);
    `)
    console.log('✓ Created index posts_category_idx')

    console.log('All indexes successfully created and active!')
  } catch (err) {
    console.error('Error creating indexes:', err)
  }
}

run()

/**
 * Seed script — populates the local SQLite DB with the 12 seed notes.
 * Run with: node scripts/seed.mjs
 * (only needed once, or to reset local dev data)
 */

import { createClient } from '@libsql/client'
import { drizzle } from 'drizzle-orm/libsql'
import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core'
import { sql } from 'drizzle-orm'
import nextEnv from '@next/env'
const { loadEnvConfig } = nextEnv

loadEnvConfig(process.cwd())

const posts = sqliteTable('posts', {
  id:         text('id').primaryKey(),
  content:    text('content').notNull(),
  category:   text('category').notNull(),
  stars:      integer('stars').default(0).notNull(),
  heardCount: integer('heard_count').default(0).notNull(),
  hugCount:   integer('hug_count').default(0).notNull(),
  isFlagged:  integer('is_flagged').default(0).notNull(),
  createdAt:  integer('created_at').default(sql`(unixepoch())`).notNull(),
})

const SEED = [
  { id: 'seed-1',  category: 'quiet-hope',   content: "I applied for the job I thought was way out of my league. I don't know if I'll get it, but for the first time in a long time, I felt brave.", stars: 48, heardCount: 31, hugCount: 22, createdAt: Math.floor(Date.now()/1000) - 60*45 },
  { id: 'seed-2',  category: 'secret-crush', content: "Every morning I rehearse a conversation with you that will never happen. You smell like old books and rain and I'm completely doomed.", stars: 112, heardCount: 87, hugCount: 64, createdAt: Math.floor(Date.now()/1000) - 60*60*3 },
  { id: 'seed-3',  category: 'small-wins',   content: "I made my bed for the 7th day in a row. It sounds so small but it's the first time since the breakup I've cared about my space at all.", stars: 73, heardCount: 56, hugCount: 41, createdAt: Math.floor(Date.now()/1000) - 60*60*5 },
  { id: 'seed-4',  category: 'heavy-heart',  content: "I smiled at everyone today at the party. Nobody knew I cried in my car before going in. I'm getting really good at pretending, and that scares me.", stars: 94, heardCount: 102, hugCount: 88, createdAt: Math.floor(Date.now()/1000) - 60*60*8 },
  { id: 'seed-5',  category: 'silly',        content: "I waved back at someone who wasn't waving at me. I kept waving and smiling for a solid 4 seconds before I realized. I will never recover.", stars: 201, heardCount: 178, hugCount: 143, createdAt: Math.floor(Date.now()/1000) - 60*60*12 },
  { id: 'seed-6',  category: 'wholesome',    content: 'My 70-year-old neighbor knocked on my door just to give me a jar of her homemade jam because "you looked tired last week." I cried a little.', stars: 166, heardCount: 134, hugCount: 119, createdAt: Math.floor(Date.now()/1000) - 60*60*18 },
  { id: 'seed-7',  category: 'unsent',       content: "Dear future me — I hope you're less afraid. I hope you finally took that trip, called that person back, and forgave yourself for the thing you still replay at 2am.", stars: 88, heardCount: 71, hugCount: 60, createdAt: Math.floor(Date.now()/1000) - 60*60*24 },
  { id: 'seed-8',  category: 'quiet-hope',   content: "I've been sober for 30 days. I'm not telling anyone in my life yet. But I needed somewhere to say it: I'm really, really proud of myself.", stars: 143, heardCount: 129, hugCount: 117, createdAt: Math.floor(Date.now()/1000) - 60*60*30 },
  { id: 'seed-9',  category: 'small-wins',   content: "I finally replied to that email I'd been avoiding for three weeks. The person responded warmly. All that anxiety for nothing. Story of my life honestly.", stars: 55, heardCount: 47, hugCount: 33, createdAt: Math.floor(Date.now()/1000) - 60*60*36 },
  { id: 'seed-10', category: 'secret-crush', content: "You laughed at my terrible joke in the meeting and I had to stare at my keyboard for a full minute after because my heart was misbehaving.", stars: 78, heardCount: 62, hugCount: 44, createdAt: Math.floor(Date.now()/1000) - 60*60*48 },
  { id: 'seed-11', category: 'heavy-heart',  content: "Sometimes the loneliest I feel is in a crowded room full of people who love me. I don't know what that means about me but I needed to say it.", stars: 119, heardCount: 108, hugCount: 93, createdAt: Math.floor(Date.now()/1000) - 60*60*52 },
  { id: 'seed-12', category: 'wholesome',    content: 'A stranger picked up the scarf I dropped without me noticing, ran after me half a block, and just said "here you go, stay warm." I think about this weekly.', stars: 137, heardCount: 119, hugCount: 101, createdAt: Math.floor(Date.now()/1000) - 60*60*60 },
]

const url = process.env.TURSO_DATABASE_URL || 'file:local.db'
const authToken = process.env.TURSO_AUTH_TOKEN
const client = createClient({ url, authToken })
const db = drizzle(client)

console.log('Seeding database…')
for (const note of SEED) {
  try {
    await db.insert(posts).values(note).onConflictDoNothing()
  } catch (e) {
    console.warn(`Skipped ${note.id}:`, e.message)
  }
}
console.log(`✓ Seeded ${SEED.length} notes into database (${url})`)
client.close()

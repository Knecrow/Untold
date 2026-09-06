import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core'
import { sql } from 'drizzle-orm'

/**
 * posts table — the single source of truth for all Untold notes.
 *
 * Storage notes:
 *  - `createdAt` is stored as a Unix epoch integer (seconds) for efficient
 *    range comparisons in getTopPosts time-window queries.
 *  - `isFlagged` uses integer 0/1 as SQLite has no native boolean.
 *  - Reaction columns use atomic SQL increments in toggleReaction to avoid
 *    read-modify-write races under concurrent requests.
 */
export const posts = sqliteTable('posts', {
  /** cuid2-generated collision-resistant primary key */
  id: text('id').primaryKey(),

  /** The anonymous confession / thought (max 500 chars enforced at app layer) */
  content: text('content').notNull(),

  /** One of the 7 named categories defined in src/constants */
  category: text('category').notNull(),

  /** Starred count — weighted ×2 in resonance score */
  stars: integer('stars').default(0).notNull(),

  /** "🤍 Heard" empathetic reaction count */
  heardCount: integer('heard_count').default(0).notNull(),

  /** "🫂 Hug" empathetic reaction count */
  hugCount: integer('hug_count').default(0).notNull(),

  /**
   * Soft-delete / moderation flag.
   * 0 = visible, 1 = flagged (hidden from public feed).
   */
  isFlagged: integer('is_flagged').default(0).notNull(),

  /**
   * Unix timestamp (seconds) set by SQLite at insert time.
   * Stored as integer for fast arithmetic in time-range filters.
   */
  createdAt: integer('created_at')
    .default(sql`(unixepoch())`)
    .notNull(),
})

// ─── TypeScript inference helpers ────────────────────────────────────────────

/** Full row as returned from the DB */
export type Post = typeof posts.$inferSelect

/** Shape required for inserting a new post */
export type NewPost = typeof posts.$inferInsert

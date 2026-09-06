'use server'

import { db } from './index'
import { posts, type Post } from './schema'
import { createId } from '@paralleldrive/cuid2'
import { eq, desc, and, gte, sql } from 'drizzle-orm'

// ─── Constants ────────────────────────────────────────────────────────────────

const MAX_CONTENT_LENGTH = 500

const VALID_CATEGORIES = [
  'small-wins',
  'secret-crush',
  'wholesome',
  'silly',
  'quiet-hope',
  'heavy-heart',
  'unsent',
] as const

type Category = (typeof VALID_CATEGORIES)[number]
type ReactionType = 'stars' | 'heardCount' | 'hugCount'

// Map reaction type → column for atomic SQL update
const REACTION_COLUMN_MAP: Record<ReactionType, typeof posts.stars | typeof posts.heardCount | typeof posts.hugCount> = {
  stars: posts.stars,
  heardCount: posts.heardCount,
  hugCount: posts.hugCount,
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function unixNow(): number {
  return Math.floor(Date.now() / 1000)
}

function secondsAgo(seconds: number): number {
  return unixNow() - seconds
}

// ─── 1. createPost ────────────────────────────────────────────────────────────

/**
 * Creates a new anonymous post.
 *
 * Validates content length and category membership before inserting.
 * Returns the newly created post row.
 *
 * @throws {Error} if content or category is invalid
 */
export async function createPost(
  content: string,
  category: string,
): Promise<Post> {
  // ── Validation ──────────────────────────────────────────────────────────────
  const trimmed = content?.trim()
  if (!trimmed || trimmed.length < 5) {
    throw new Error('Content must be at least 5 characters.')
  }
  if (trimmed.length > MAX_CONTENT_LENGTH) {
    throw new Error(`Content must be at most ${MAX_CONTENT_LENGTH} characters.`)
  }
  if (!VALID_CATEGORIES.includes(category as Category)) {
    throw new Error(`Invalid category: "${category}".`)
  }

  // ── Insert ──────────────────────────────────────────────────────────────────
  const id = createId()

  const [row] = await db
    .insert(posts)
    .values({ id, content: trimmed, category })
    .returning()

  return row
}

// ─── 2. getLatestPosts ────────────────────────────────────────────────────────

/**
 * Returns the most recent posts in descending creation order.
 *
 * @param limit   Max number of results (default 50, cap 100)
 * @param offset  Pagination offset (default 0)
 * @param category Optional category filter; undefined = all categories
 */
export async function getLatestPosts(
  limit = 50,
  offset = 0,
  category?: string,
): Promise<Post[]> {
  const safeLimit  = Math.min(Math.max(1, limit), 100)
  const safeOffset = Math.max(0, offset)

  const conditions = [eq(posts.isFlagged, 0)]

  if (category && category !== 'all') {
    conditions.push(eq(posts.category, category))
  }

  return db
    .select()
    .from(posts)
    .where(and(...conditions))
    .orderBy(desc(posts.createdAt))
    .limit(safeLimit)
    .offset(safeOffset)
}

// ─── 3. getTopPosts ───────────────────────────────────────────────────────────

/**
 * Returns posts ranked by resonance score: `stars * 2 + heardCount + hugCount`.
 *
 * @param timeframe  'today' | 'week' | 'all'  (default 'all')
 * @param limit      Max results (default 5)
 */
export async function getTopPosts(
  timeframe: 'today' | 'week' | 'all' = 'all',
  limit = 5,
): Promise<Array<Post & { resonanceScore: number }>> {
  const safeLimit = Math.min(Math.max(1, limit), 50)

  // Time-window cutoff (Unix seconds)
  const cutoffSeconds: Record<typeof timeframe, number> = {
    today: secondsAgo(60 * 60 * 24),       // 24 h
    week:  secondsAgo(60 * 60 * 24 * 7),   // 7 days
    all:   0,                               // no cutoff
  }
  const cutoff = cutoffSeconds[timeframe]

  const conditions = [eq(posts.isFlagged, 0)]
  if (cutoff > 0) {
    conditions.push(gte(posts.createdAt, cutoff))
  }

  // Resonance score expression: stars*2 + heardCount + hugCount
  const resonance = sql<number>`(${posts.stars} * 2 + ${posts.heardCount} + ${posts.hugCount})`

  const rows = await db
    .select({
      id:           posts.id,
      content:      posts.content,
      category:     posts.category,
      stars:        posts.stars,
      heardCount:   posts.heardCount,
      hugCount:     posts.hugCount,
      isFlagged:    posts.isFlagged,
      createdAt:    posts.createdAt,
      resonanceScore: resonance,
    })
    .from(posts)
    .where(and(...conditions))
    .orderBy(desc(resonance))
    .limit(safeLimit)

  return rows
}

// ─── 4. toggleReaction ───────────────────────────────────────────────────────

/**
 * Atomically increments a reaction counter by 1.
 *
 * Uses a raw SQL expression (`col = col + 1`) so concurrent requests
 * can never read stale values — no read-modify-write race condition.
 *
 * The client-side localStorage layer handles the toggle (increment /
 * decrement) so the server only ever increments. This keeps the server
 * action idempotency-friendly (each unique user action = one DB write).
 *
 * @param postId  The post's cuid2 id
 * @param type    'stars' | 'heardCount' | 'hugCount'
 * @returns       Updated post row, or null if post not found
 */
export async function toggleReaction(
  postId: string,
  type: ReactionType,
): Promise<Post | null> {
  if (!postId || typeof postId !== 'string') {
    throw new Error('Invalid postId.')
  }
  if (!(type in REACTION_COLUMN_MAP)) {
    throw new Error(`Invalid reaction type: "${type}". Must be one of: stars, heardCount, hugCount.`)
  }

  const col = REACTION_COLUMN_MAP[type]

  const [updated] = await db
    .update(posts)
    .set({
      // Atomic increment — never a stale read
      [type]: sql`${col} + 1`,
    })
    .where(and(eq(posts.id, postId), eq(posts.isFlagged, 0)))
    .returning()

  return updated ?? null
}

// ─── 5. flagPost ─────────────────────────────────────────────────────────────

/**
 * Flags a post as inappropriate (isFlagged = 1).
 */
export async function flagPost(postId: string): Promise<boolean> {
  if (!postId || typeof postId !== 'string') return false
  await db
    .update(posts)
    .set({ isFlagged: 1 })
    .where(eq(posts.id, postId))
  return true
}

/**
 * Thin fetch wrapper for the Untold API.
 * All functions fall back to a rejected promise (never throw synchronously)
 * so callers can catch and fall back to localStorage.
 */

const BASE = '/api'

// ─── Types ────────────────────────────────────────────────────────────────────

export interface ApiPost {
  id: string
  content: string
  category: string
  stars: number
  heardCount: number
  hugCount: number
  isFlagged: number
  createdAt: number       // Unix seconds
  resonanceScore?: number
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    throw new Error(body?.error ?? `HTTP ${res.status}`)
  }
  return res.json() as Promise<T>
}

// ─── createPost ───────────────────────────────────────────────────────────────

export async function apiCreatePost(
  content: string,
  category: string,
): Promise<ApiPost> {
  const res = await fetch(`${BASE}/posts`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ content, category }),
  })
  const data = await handleResponse<{ post: ApiPost }>(res)
  return data.post
}

// ─── getLatestPosts ───────────────────────────────────────────────────────────

export async function apiGetLatestPosts(
  limit = 50,
  offset = 0,
  category?: string,
): Promise<ApiPost[]> {
  const params = new URLSearchParams({
    limit:  String(limit),
    offset: String(offset),
    ...(category && category !== 'all' ? { category } : {}),
  })
  const res = await fetch(`${BASE}/posts?${params}`, { cache: 'no-store' })
  const data = await handleResponse<{ posts: ApiPost[] }>(res)
  return data.posts
}

// ─── getTopPosts ──────────────────────────────────────────────────────────────

export async function apiGetTopPosts(
  timeframe: 'today' | 'week' | 'all' = 'all',
  limit = 5,
): Promise<ApiPost[]> {
  const params = new URLSearchParams({ timeframe, limit: String(limit) })
  const res = await fetch(`${BASE}/posts/top?${params}`, { cache: 'no-store' })
  const data = await handleResponse<{ posts: ApiPost[] }>(res)
  return data.posts
}

// ─── toggleReaction ───────────────────────────────────────────────────────────

export async function apiToggleReaction(
  postId: string,
  type: 'stars' | 'heardCount' | 'hugCount',
): Promise<ApiPost> {
  const res = await fetch(`${BASE}/posts/${postId}/react`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ type }),
  })
  const data = await handleResponse<{ post: ApiPost }>(res)
  return data.post
}

// ─── Conversion helper ────────────────────────────────────────────────────────
// Convert API post (Unix seconds, heardCount/hugCount) to the shape the
// existing React components expect (milliseconds, heard/hug).

export function apiPostToLocal(p: ApiPost) {
  return {
    id:        p.id,
    category:  p.category,
    text:      p.content,
    stars:     p.stars,
    heard:     p.heardCount,
    hug:       p.hugCount,
    createdAt: p.createdAt * 1000,   // seconds → milliseconds
  }
}

// ─── flagPost ────────────────────────────────────────────────────────────────

export async function apiFlagPost(id: string): Promise<boolean> {
  try {
    await fetch(`${BASE}/posts/${id}/flag`, { method: 'POST' })
    return true
  } catch {
    return false
  }
}

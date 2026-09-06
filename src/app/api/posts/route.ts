import { NextRequest, NextResponse } from 'next/server'
import { createPost, getLatestPosts } from '@/lib/db/actions'

// ─── GET /api/posts ───────────────────────────────────────────────────────────
// Query params:
//   ?limit=50        (default 50, max 100)
//   ?offset=0        (for pagination)
//   ?category=all    (category slug or "all")
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = req.nextUrl

    const limit    = parseInt(searchParams.get('limit')    ?? '50', 10)
    const offset   = parseInt(searchParams.get('offset')   ?? '0',  10)
    const category = searchParams.get('category') ?? undefined

    const posts = await getLatestPosts(limit, offset, category)

    return NextResponse.json({ posts }, { status: 200 })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Internal server error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

// ─── POST /api/posts ──────────────────────────────────────────────────────────
// Body: { content: string, category: string }
export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => null)

    if (!body || typeof body.content !== 'string' || typeof body.category !== 'string') {
      return NextResponse.json(
        { error: 'Request body must include { content: string, category: string }' },
        { status: 400 },
      )
    }

    // Honeypot check — bots often fill hidden fields; surface field = "url"
    if (body.url) {
      // Silent 200 to fool bots — don't actually save
      return NextResponse.json({ ok: true }, { status: 200 })
    }

    const post = await createPost(body.content, body.category)

    return NextResponse.json({ post }, { status: 201 })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Internal server error'
    const status  = message.includes('must be') ? 400 : 500
    return NextResponse.json({ error: message }, { status })
  }
}

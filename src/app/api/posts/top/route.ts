import { NextRequest, NextResponse } from 'next/server'
import { getTopPosts } from '@/lib/db/actions'

// ─── GET /api/posts/top ───────────────────────────────────────────────────────
// Query params:
//   ?timeframe=all   ('today' | 'week' | 'all')
//   ?limit=5         (max 50)
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = req.nextUrl

    const rawTimeframe = searchParams.get('timeframe') ?? 'all'
    const timeframe = (['today', 'week', 'all'] as const).includes(
      rawTimeframe as 'today' | 'week' | 'all',
    )
      ? (rawTimeframe as 'today' | 'week' | 'all')
      : 'all'

    const limit = Math.min(parseInt(searchParams.get('limit') ?? '5', 10), 50)

    const posts = await getTopPosts(timeframe, limit)

    return NextResponse.json({ posts }, { status: 200 })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Internal server error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

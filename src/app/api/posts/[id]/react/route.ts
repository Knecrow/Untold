import { NextRequest, NextResponse } from 'next/server'
import { toggleReaction } from '@/lib/db/actions'

type Params = { params: Promise<{ id: string }> }

// ─── PATCH /api/posts/[id]/react ──────────────────────────────────────────────
// Body: { type: 'stars' | 'heardCount' | 'hugCount' }
//
// Design note:
//   The server always *increments* by 1. The client-side localStorage layer
//   tracks whether the user has already reacted and calls this endpoint only
//   once per new positive reaction. This removes the need for user identity
//   on the server while keeping the atomic guarantee.
export async function PATCH(req: NextRequest, { params }: Params) {
  try {
    const { id } = await params

    if (!id) {
      return NextResponse.json({ error: 'Missing post id.' }, { status: 400 })
    }

    const body = await req.json().catch(() => null)
    const type = body?.type

    if (!['stars', 'heardCount', 'hugCount'].includes(type)) {
      return NextResponse.json(
        {
          error:
            'Body must include { type: "stars" | "heardCount" | "hugCount" }',
        },
        { status: 400 },
      )
    }

    const updated = await toggleReaction(id, type)

    if (!updated) {
      return NextResponse.json(
        { error: 'Post not found or is flagged.' },
        { status: 404 },
      )
    }

    return NextResponse.json({ post: updated }, { status: 200 })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Internal server error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

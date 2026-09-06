import { NextRequest, NextResponse } from 'next/server'
import { flagPost } from '@/lib/db/actions'

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params
    await flagPost(id)
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to flag post' }, { status: 500 })
  }
}

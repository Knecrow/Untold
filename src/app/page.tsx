import type { Metadata } from 'next'
import { getLatestPosts } from '@/lib/db/actions'
import { apiPostToLocal } from '@/lib/api'
import BoardClient from './board-client'

export const metadata: Metadata = {
  title: 'Taleless — Your Unspoken Thoughts, Finally Heard',
  description:
    'Anonymous. Honest. Heard. Drop your unspoken thoughts — no account needed.',
}

// Revalidate every 30 seconds so fresh posts appear without a full redeploy
export const revalidate = 30

export default async function HomePage() {
  // Server-side initial fetch — seeds the client with real data on first load
  let initialNotes: ReturnType<typeof apiPostToLocal>[] = []

  try {
    const posts = await getLatestPosts(50, 0)
    initialNotes = posts.map(apiPostToLocal)
  } catch {
    // DB not configured yet (e.g. missing .env.local) — fall back to empty feed
    // The client will render seed data from localStorage / constants
    initialNotes = []
  }

  return <BoardClient initialNotes={initialNotes} />
}

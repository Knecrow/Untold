'use client'

import { useState, useCallback, useEffect, useRef } from 'react'
import Header from '@/components/Header'
import FilterBar from '@/components/FilterBar'
import MasonryBoard from '@/components/MasonryBoard'
import DropNoteModal from '@/components/DropNoteModal'
import TopPostsDrawer from '@/components/TopPostsDrawer'
import { apiGetLatestPosts, apiToggleReaction, apiPostToLocal } from '@/lib/api'
import { SEED_NOTES } from '@/constants'

// ─── localStorage helpers ─────────────────────────────────────────────────────

const LS_INTERACTIONS = 'untold:interactions'
const LS_FILTER       = 'untold:filter'

function loadInteractions(): Record<string, Record<string, boolean>> {
  try {
    return JSON.parse(localStorage.getItem(LS_INTERACTIONS) ?? '{}')
  } catch { return {} }
}
function saveInteractions(v: Record<string, Record<string, boolean>>) {
  try { localStorage.setItem(LS_INTERACTIONS, JSON.stringify(v)) } catch {}
}
function loadFilter(): string {
  try { return localStorage.getItem(LS_FILTER) ?? 'all' } catch { return 'all' }
}
function saveFilter(v: string) {
  try { localStorage.setItem(LS_FILTER, v) } catch {}
}

// ─── Note shape used throughout the UI ───────────────────────────────────────

export interface LocalNote {
  id: string
  category: string
  text: string
  stars: number
  heard: number
  hug: number
  createdAt: number // ms
}

interface Props {
  initialNotes: LocalNote[]
}

export default function BoardClient({ initialNotes }: Props) {
  // ─── Hydration guard ──────────────────────────────────────────────────────
  const [hydrated, setHydrated] = useState(false)

  // ─── Core state ───────────────────────────────────────────────────────────
  const [notes, setNotes]               = useState<LocalNote[]>(
    initialNotes.length > 0 ? initialNotes : SEED_NOTES,
  )
  const [interactions, setInteractions] = useState<Record<string, Record<string, boolean>>>({})
  const [activeFilter, setActiveFilter] = useState('all')
  const [showDropModal, setShowDropModal] = useState(false)
  const [showTopPosts, setShowTopPosts]   = useState(false)
  const [newNoteId, setNewNoteId]         = useState<string | null>(null)
  const [loading, setLoading]            = useState(false)

  // ─── Hydrate from localStorage (client-only) ──────────────────────────────
  useEffect(() => {
    setInteractions(loadInteractions())
    setActiveFilter(loadFilter())
    setHydrated(true)
  }, [])

  // ─── Persist interactions & filter ───────────────────────────────────────
  useEffect(() => { if (hydrated) saveInteractions(interactions) }, [interactions, hydrated])
  useEffect(() => { if (hydrated) saveFilter(activeFilter) }, [activeFilter, hydrated])

  // ─── Poll for new posts every 60 s ───────────────────────────────────────
  useEffect(() => {
    const tick = async () => {
      try {
        const fresh = await apiGetLatestPosts(50, 0)
        if (fresh.length > 0) {
          setNotes(fresh.map(apiPostToLocal))
        }
      } catch { /* offline or DB not configured */ }
    }

    const id = setInterval(tick, 60_000)
    return () => clearInterval(id)
  }, [])

  // ─── Clear new-note highlight after animation ─────────────────────────────
  const newNoteTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  useEffect(() => {
    if (newNoteId) {
      if (newNoteTimer.current) clearTimeout(newNoteTimer.current)
      newNoteTimer.current = setTimeout(() => setNewNoteId(null), 800)
    }
  }, [newNoteId])

  // ─── Filtered notes ───────────────────────────────────────────────────────
  const filteredNotes = activeFilter === 'all'
    ? notes
    : notes.filter(n => n.category === activeFilter)

  // ─── Interaction toggle ───────────────────────────────────────────────────
  // Maps UI toggle key → API reaction type
  const REACT_MAP: Record<string, 'stars' | 'heardCount' | 'hugCount'> = {
    starred: 'stars',
    heard:   'heardCount',
    hugged:  'hugCount',
  }
  // Maps UI toggle key → note score key
  const SCORE_MAP: Record<string, keyof LocalNote> = {
    starred: 'stars',
    heard:   'heard',
    hugged:  'hug',
  }

  function toggleInteraction(noteId: string, type: string) {
    const scoreKey = SCORE_MAP[type] as 'stars' | 'heard' | 'hug'

    // 1. Optimistic local update
    setInteractions(prev => {
      const mine = prev[noteId] || {}
      const wasActive = mine[type]
      return { ...prev, [noteId]: { ...mine, [type]: !wasActive } }
    })

    setNotes(prev => prev.map(n => {
      if (n.id !== noteId) return n
      const mine = interactions[n.id] || {}
      const wasActive = mine[type]
      const delta = wasActive ? -1 : 1
      return { ...n, [scoreKey]: Math.max(0, n[scoreKey] + delta) }
    }))

    // 2. Only call API when toggling ON (server always increments)
    const wasAlreadyActive = (interactions[noteId] || {})[type]
    if (!wasAlreadyActive) {
      const apiType = REACT_MAP[type]
      if (apiType) {
        apiToggleReaction(noteId, apiType).catch(() => {
          // Silently fail — optimistic update stays for UX continuity
        })
      }
    }
  }

  const handleStar  = useCallback((id: string) => toggleInteraction(id, 'starred'), [interactions])
  const handleHeard = useCallback((id: string) => toggleInteraction(id, 'heard'),   [interactions])
  const handleHug   = useCallback((id: string) => toggleInteraction(id, 'hugged'),  [interactions])

  // ─── Share ────────────────────────────────────────────────────────────────
  const handleShare = useCallback((noteId: string) => {
    const url = `${window.location.origin}${window.location.pathname}?note=${noteId}`
    navigator.clipboard.writeText(url).catch(() => {
      const ta = document.createElement('textarea')
      ta.value = url
      document.body.appendChild(ta)
      ta.select()
      document.execCommand('copy')
      document.body.removeChild(ta)
    })
  }, [])

  // ─── Add note (called by modal after successful API post) ─────────────────
  const handleAddNote = useCallback((newNote: LocalNote) => {
    setNotes(prev => [newNote, ...prev])
    setNewNoteId(newNote.id)
    setActiveFilter('all')
  }, [])

  // ─── Filter change ────────────────────────────────────────────────────────
  const handleFilterChange = useCallback((filterId: string) => {
    setActiveFilter(filterId)
  }, [])

  // ─── Body scroll lock when modal open ────────────────────────────────────
  useEffect(() => {
    document.body.style.overflow = (showDropModal || showTopPosts) ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [showDropModal, showTopPosts])

  return (
    <div className="min-h-screen canvas-texture">
      {/* Header */}
      <Header
        onDropNote={() => setShowDropModal(true)}
        onTopPosts={() => setShowTopPosts(true)}
        noteCount={notes.length}
      />

      {/* Main content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6">

        {/* Hero tagline */}
        <div className="mb-6 text-center sm:text-left">
          <p className="text-base font-semibold text-gray-500 max-w-lg">
            Anonymous. Honest. Heard. Drop your unspoken thoughts — no account needed.
          </p>
        </div>

        {/* Filter bar */}
        <div className="mb-6">
          <FilterBar active={activeFilter} onChange={handleFilterChange} />
        </div>

        {/* Note count for current filter */}
        <div className="flex items-center justify-between mb-4">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">
            {filteredNotes.length} {filteredNotes.length === 1 ? 'note' : 'notes'}
            {activeFilter !== 'all' && ' in this category'}
          </p>
        </div>

        {/* Masonry board */}
        <MasonryBoard
          notes={filteredNotes}
          interactions={interactions}
          onStar={handleStar}
          onHeard={handleHeard}
          onHug={handleHug}
          onShare={handleShare}
          newNoteId={newNoteId}
        />
      </main>

      {/* Footer */}
      <footer className="border-t-2 border-black mt-12 py-6 text-center">
        <p className="text-xs font-semibold text-gray-400">
          Untold · Anonymous, ephemeral, honest · No account. No judgment.
        </p>
      </footer>

      {/* Floating drop button (mobile) */}
      <button
        id="fab-drop-note"
        onClick={() => setShowDropModal(true)}
        className="btn-press fixed bottom-6 right-5 z-40 sm:hidden flex items-center justify-center w-14 h-14 bg-[#1A1A1A] text-white border-2 border-black rounded-full shadow-neo text-2xl cursor-pointer"
        aria-label="Drop a note"
      >
        📌
      </button>

      {/* Modals */}
      {showDropModal && (
        <DropNoteModal
          onClose={() => setShowDropModal(false)}
          onSubmit={handleAddNote}
        />
      )}

      {showTopPosts && (
        <TopPostsDrawer
          notes={notes}
          onClose={() => setShowTopPosts(false)}
        />
      )}
    </div>
  )
}

'use client'

import { useState, useCallback, useEffect, useRef } from 'react'
import Header from '@/components/Header'
import FilterBar from '@/components/FilterBar'
import MasonryBoard from '@/components/MasonryBoard'
import DropNoteModal from '@/components/DropNoteModal'
import AboutSettingsModal from '@/components/AboutSettingsModal'
import { apiGetLatestPosts, apiToggleReaction, apiPostToLocal, apiFlagPost } from '@/lib/api'
import { SEED_NOTES } from '@/constants'

// ─── Fisher-Yates Random Shuffle ─────────────────────────────────────────────
function shuffleArray<T>(array: T[]): T[] {
  const arr = [...array]
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[arr[i], arr[j]] = [arr[j], arr[i]]
  }
  return arr
}

// ─── localStorage helpers ─────────────────────────────────────────────────────

const LS_INTERACTIONS = 'untold:interactions'
const LS_FILTER       = 'untold:filter'
const LS_HIDDEN       = 'untold:hidden'

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
function loadHidden(): Set<string> {
  try {
    return new Set(JSON.parse(localStorage.getItem(LS_HIDDEN) ?? '[]'))
  } catch { return new Set() }
}
function saveHidden(v: Set<string>) {
  try { localStorage.setItem(LS_HIDDEN, JSON.stringify(Array.from(v))) } catch {}
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
  const [showAbout, setShowAbout]         = useState(false)
  const [newNoteId, setNewNoteId]         = useState<string | null>(null)
  const [hiddenIds, setHiddenIds]         = useState<Set<string>>(new Set())
  const [loading, setLoading]            = useState(false)

  // ─── Hydrate from localStorage & Randomize on initial load ────────────────
  useEffect(() => {
    setInteractions(loadInteractions())
    setActiveFilter(loadFilter())
    setHiddenIds(loadHidden())
    setNotes(prev => shuffleArray(prev))
    setHydrated(true)
  }, [])

  // ─── Flag & hide note ─────────────────────────────────────────────────────
  const handleFlag = useCallback((noteId: string) => {
    setHiddenIds(prev => {
      const next = new Set(prev)
      next.add(noteId)
      saveHidden(next)
      return next
    })
    apiFlagPost(noteId).catch(() => {})
  }, [])

  // ─── Persist interactions & filter ───────────────────────────────────────
  useEffect(() => { if (hydrated) saveInteractions(interactions) }, [interactions, hydrated])
  useEffect(() => { if (hydrated) saveFilter(activeFilter) }, [activeFilter, hydrated])

  // ─── Poll for new posts every 60 s (only when tab is active/visible) ──────
  useEffect(() => {
    const tick = async () => {
      // Don't waste database queries if user is in another tab or minimized
      if (typeof document !== 'undefined' && document.visibilityState !== 'visible') {
        return
      }

      try {
        const fresh = await apiGetLatestPosts(50, 0)
        if (fresh.length > 0) {
          setNotes(fresh.map(apiPostToLocal))
        }
      } catch { /* offline or DB not configured */ }
    }

    const id = setInterval(tick, 60_000)

    // Also fetch fresh posts when the user switches back to this tab
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        tick()
      }
    }
    document.addEventListener('visibilitychange', handleVisibilityChange)

    return () => {
      clearInterval(id)
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [])

  // ─── Clear new-note highlight after animation ─────────────────────────────
  const newNoteTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  useEffect(() => {
    if (newNoteId) {
      if (newNoteTimer.current) clearTimeout(newNoteTimer.current)
      newNoteTimer.current = setTimeout(() => setNewNoteId(null), 800)
    }
  }, [newNoteId])

  // ─── Filtered notes (excluding hidden/flagged notes) ──────────────────────
  const visibleNotes = notes.filter(n => !hiddenIds.has(n.id))
  const filteredNotes = activeFilter === 'all'
    ? visibleNotes
    : visibleNotes.filter(n => n.category === activeFilter)

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
    document.body.style.overflow = (showDropModal || showAbout) ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [showDropModal, showAbout])

  return (
    <div className="min-h-screen canvas-texture flex flex-col justify-between">
      <div>
        {/* Header */}
        <Header
          onDropNote={() => setShowDropModal(true)}
          onAbout={() => setShowAbout(true)}
          noteCount={notes.length}
        />

        {/* Main content */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6">

          {/* Hero tagline */}
          <div className="mb-6 text-center sm:text-left">
            <p className="text-base font-medium text-[#2D2A26]/70 max-w-xl">
              Anonymous. Ephemeral. Pure chance. Every refresh re-deals the board so every quiet thought has an equal chance to be heard.
            </p>
          </div>

          {/* Filter bar */}
          <div className="mb-6">
            <FilterBar active={activeFilter} onChange={handleFilterChange} />
          </div>

          {/* Note count for current filter */}
          <div className="flex items-center justify-between mb-4">
            <p className="text-xs font-semibold text-[#2D2A26]/50 uppercase tracking-wide">
              {filteredNotes.length} {filteredNotes.length === 1 ? 'thought' : 'thoughts'}
              {activeFilter !== 'all' && ' in this category'}
            </p>
          </div>

          {/* Bento board */}
          <MasonryBoard
            notes={filteredNotes}
            interactions={interactions}
            onStar={handleStar}
            onHeard={handleHeard}
            onHug={handleHug}
            onShare={handleShare}
            onFlag={handleFlag}
            newNoteId={newNoteId}
          />
        </main>
      </div>

      {/* Footer */}
      <footer className="border-t-2 border-black mt-16 py-8 bg-[#F7F4EE]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-semibold text-[#2D2A26]/70">
          <p>
            Untold · Created with care by{' '}
            <a
              href="https://github.com/Knecrow"
              target="_blank"
              rel="noopener noreferrer"
              className="text-black underline font-bold hover:text-neutral-700"
            >
              Syed Nahian (@Knecrow)
            </a>
          </p>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setShowAbout(true)}
              className="underline hover:text-black cursor-pointer font-bold"
            >
              About & Settings
            </button>
            <a
              href="https://github.com/Knecrow/Untold"
              target="_blank"
              rel="noopener noreferrer"
              className="underline hover:text-black font-bold"
            >
              GitHub
            </a>
          </div>
        </div>
      </footer>

      {/* Floating drop button (mobile) */}
      <button
        id="fab-drop-note"
        onClick={() => setShowDropModal(true)}
        className="btn-press fixed bottom-6 right-5 z-40 sm:hidden flex items-center justify-center w-14 h-14 bg-[#1C1A18] text-white border-2 border-black rounded-full shadow-neo text-2xl cursor-pointer"
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

      {showAbout && (
        <AboutSettingsModal
          onClose={() => setShowAbout(false)}
          onClearInteractions={() => {
            setInteractions({})
            localStorage.removeItem(LS_INTERACTIONS)
          }}
        />
      )}
    </div>
  )
}

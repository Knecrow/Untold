'use client'

import NoteCard from './NoteCard'
import type { LocalNote } from '@/app/board-client'
import { Inbox } from 'lucide-react'

interface Props {
  notes: LocalNote[]
  interactions: Record<string, Record<string, boolean>>
  onStar: (id: string) => void
  onHeard: (id: string) => void
  onHug: (id: string) => void
  onShare: (id: string) => void
  onFlag?: (id: string) => void
  newNoteId: string | null
}

export default function MasonryBoard({ notes, interactions, onStar, onHeard, onHug, onShare, onFlag, newNoteId }: Props) {
  if (notes.length === 0) {
    return (
      <div className="glass-panel rounded-3xl p-10 max-w-md mx-auto my-16 flex flex-col items-center justify-center text-center shadow-neo-sm">
        <div className="w-12 h-12 rounded-2xl glass-pill flex items-center justify-center mb-3">
          <Inbox size={22} strokeWidth={2} className="text-[#1A1714]/60 dark:text-white/60" />
        </div>
        <h3 className="text-lg font-bold text-[#1A1714] dark:text-white mb-1.5">Nothing here yet</h3>
        <p className="text-sm text-[#1A1714]/60 dark:text-white/60 font-medium max-w-xs">
          No notes match this filter. Try another category or be the first to drop one!
        </p>
      </div>
    )
  }

  return (
    <div className="masonry-grid">
      {notes.map((note, index) => (
        <NoteCard
          key={note.id}
          note={note}
          index={index}
          interactions={interactions}
          onStar={onStar}
          onHeard={onHeard}
          onHug={onHug}
          onShare={onShare}
          onFlag={onFlag}
          isNew={note.id === newNoteId}
        />
      ))}
    </div>
  )
}

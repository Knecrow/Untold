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
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <Inbox size={42} strokeWidth={1.75} className="text-[#2D2A26]/40 mb-3" />
        <h3 className="text-lg font-bold text-[#1A1A1A] mb-2">Nothing here yet</h3>
        <p className="text-sm text-gray-500 max-w-xs font-medium">
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

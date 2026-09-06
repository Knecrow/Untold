'use client'

import NoteCard from './NoteCard'
import type { LocalNote } from '@/app/board-client'

interface Props {
  notes: LocalNote[]
  interactions: Record<string, Record<string, boolean>>
  onStar: (id: string) => void
  onHeard: (id: string) => void
  onHug: (id: string) => void
  onShare: (id: string) => void
  newNoteId: string | null
}

export default function MasonryBoard({ notes, interactions, onStar, onHeard, onHug, onShare, newNoteId }: Props) {
  if (notes.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <div className="text-5xl mb-4">📭</div>
        <h3 className="text-lg font-bold text-[#1A1A1A] mb-2">Nothing here yet</h3>
        <p className="text-sm text-gray-500 max-w-xs font-medium">
          No notes match this filter. Try another category or be the first to drop one!
        </p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5 [grid-auto-flow:dense]">
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
          isNew={note.id === newNoteId}
        />
      ))}
    </div>
  )
}

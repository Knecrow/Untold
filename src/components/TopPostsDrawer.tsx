'use client'

import { useState } from 'react'
import { resonanceScore, filterByRange } from '@/utils'
import { CATEGORY_MAP } from '@/constants'
import { Trophy, X } from 'lucide-react'
import { relativeTime } from '@/utils'
import type { LocalNote } from '@/app/board-client'

const RANGES = [
  { id: 'today', label: 'Today' },
  { id: 'week',  label: 'This Week' },
  { id: 'all',   label: 'All-Time' },
]

interface Props {
  notes: LocalNote[]
  onClose: () => void
}

export default function TopPostsDrawer({ notes, onClose }: Props) {
  const [range, setRange] = useState<'today' | 'week' | 'all'>('all')

  const filtered = filterByRange(notes, range)
  const sorted = [...filtered].sort((a, b) => resonanceScore(b) - resonanceScore(a))
  const top5 = sorted.slice(0, 5)

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 modal-backdrop bg-black/30"
      onClick={e => e.target === e.currentTarget && onClose()}
      role="dialog"
      aria-modal="true"
      aria-label="Top Posts"
    >
      <div className="w-full max-w-lg bg-[#FFFDF5] border-2 border-black rounded-2xl shadow-neo-lg overflow-hidden max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b-2 border-black bg-white shrink-0">
          <div className="flex items-center gap-2">
            <Trophy size={18} strokeWidth={2.5} className="text-[#FFD13B]" />
            <h2 className="font-bold text-lg">Top Posts</h2>
          </div>
          <button
            onClick={onClose}
            className="btn-press p-1.5 rounded-full border-2 border-black bg-white shadow-neo-sm cursor-pointer"
            aria-label="Close"
          >
            <X size={16} strokeWidth={2.5} />
          </button>
        </div>

        {/* Range toggle */}
        <div className="flex gap-2 p-4 border-b-2 border-black shrink-0">
          {RANGES.map(r => (
            <button
              key={r.id}
              onClick={() => setRange(r.id as 'today' | 'week' | 'all')}
              className="btn-press flex-1 py-1.5 text-sm font-bold border-2 border-black rounded-full cursor-pointer transition-all"
              style={{
                backgroundColor: range === r.id ? '#FFD13B' : 'white',
                boxShadow: range === r.id ? '2px 2px 0px 0px #000' : 'none',
              }}
            >
              {r.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="overflow-y-auto flex-1 p-4 space-y-3">
          {top5.length === 0 && (
            <p className="text-center text-sm text-gray-400 py-8 font-semibold">
              No posts for this time range yet.
            </p>
          )}

          {top5.map((note, i) => {
            const cat = CATEGORY_MAP[note.category] || CATEGORY_MAP['quiet-hope']
            const score = resonanceScore(note)
            const isTop = i === 0

            return (
              <div
                key={note.id}
                className={`p-4 border-2 border-black rounded-2xl bg-white ${isTop ? 'shadow-neo ring-2 ring-[#FFD13B]/50' : 'shadow-neo-sm'}`}
              >
                {isTop && (
                  <div className="flex items-center gap-1.5 mb-2">
                    <span className="inline-flex items-center gap-1 bg-white border-2 border-black rounded-full px-2.5 py-0.5 text-xs font-bold shadow-neo-sm">
                      ⭐ Most Resonated
                    </span>
                  </div>
                )}

                <div className="flex items-start gap-3">
                  {/* Rank */}
                  <div className="flex-shrink-0 w-7 h-7 flex items-center justify-center border-2 border-black rounded-full bg-white text-xs font-black shadow-neo-sm">
                    #{i + 1}
                  </div>

                  <div className="flex-1 min-w-0">
                    {/* Category + time */}
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className="text-xs font-bold">{cat.emoji} {cat.label}</span>
                      <span className="text-xs text-gray-500">{relativeTime(note.createdAt)}</span>
                    </div>
                    {/* Text */}
                    <p className="text-sm font-semibold leading-relaxed text-[#1A1A1A] line-clamp-3">
                      {note.text}
                    </p>
                    {/* Score */}
                    <div className="flex items-center gap-3 mt-2 text-xs font-bold text-gray-600">
                      <span>⭐ {note.stars}</span>
                      <span>🤍 {note.heard}</span>
                      <span>🫂 {note.hug}</span>
                      <span className="ml-auto bg-black text-white rounded-full px-2 py-0.5">
                        {score} pts
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

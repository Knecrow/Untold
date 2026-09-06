'use client'

import { Pin, Trophy } from 'lucide-react'

interface Props {
  onDropNote: () => void
  onTopPosts: () => void
  noteCount: number
}

export default function Header({ onDropNote, onTopPosts, noteCount }: Props) {
  return (
    <header className="sticky top-0 z-40 bg-[#FFFDF5]/90 backdrop-blur-sm border-b-2 border-black">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16 gap-4">

          {/* Logo / Brand */}
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 bg-[#FFD13B] border-2 border-black rounded-xl flex items-center justify-center shadow-neo-sm flex-shrink-0">
              <span className="text-base">📌</span>
            </div>
            <div className="min-w-0">
              <h1 className="text-xl font-black tracking-tight leading-none" style={{ fontFamily: 'Instrument Serif, serif' }}>Untold</h1>
              <p className="text-xs text-gray-500 font-medium hidden sm:block">
                {noteCount} {noteCount === 1 ? 'note' : 'notes'} on the board
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              id="top-posts-btn"
              onClick={onTopPosts}
              className="btn-press hidden sm:inline-flex items-center gap-1.5 border-2 border-black rounded-full px-4 py-1.5 text-sm font-bold bg-white shadow-neo-sm cursor-pointer hover:bg-gray-50 transition-colors"
            >
              <Trophy size={14} />
              <span>Top Posts</span>
            </button>

            {/* Mobile trophy */}
            <button
              id="top-posts-mobile-btn"
              onClick={onTopPosts}
              className="btn-press sm:hidden p-2 border-2 border-black rounded-full bg-white shadow-neo-sm cursor-pointer"
              aria-label="Top Posts"
            >
              <Trophy size={16} />
            </button>

            <button
              id="drop-note-btn"
              onClick={onDropNote}
              className="btn-press inline-flex items-center gap-1.5 bg-[#1A1A1A] text-white border-2 border-black rounded-full px-4 py-1.5 text-sm font-bold shadow-neo cursor-pointer hover:bg-[#333] transition-colors"
            >
              <Pin size={14} />
              <span className="hidden sm:inline">Drop a Note</span>
              <span className="sm:hidden">+</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  )
}

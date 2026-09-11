'use client'

import { Pin, Info } from 'lucide-react'

interface Props {
  onDropNote: () => void
  onAbout: () => void
  noteCount: number
}

export default function Header({ onDropNote, onAbout, noteCount }: Props) {
  return (
    <header className="sticky top-0 z-40 bg-[#F7F4EE]/90 backdrop-blur-sm border-b-2 border-black">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16 gap-4">

          {/* Logo / Brand */}
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 bg-[#FFD43B] border-2 border-black rounded-xl flex items-center justify-center shadow-neo-sm flex-shrink-0">
              <Pin size={17} strokeWidth={2.5} className="text-[#1C1A18]" />
            </div>
            <div className="min-w-0">
              <h1 className="text-xl font-black tracking-tight leading-none text-[#1C1A18]" style={{ fontFamily: 'Instrument Serif, serif' }}>Taleless</h1>
              <p className="text-xs text-[#2D2A26]/70 font-semibold hidden sm:flex items-center gap-1.5 mt-0.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block animate-pulse" />
                <span>{noteCount} {noteCount === 1 ? 'thought' : 'thoughts'} on the board</span>
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2.5 shrink-0">
            <button
              id="about-btn"
              onClick={onAbout}
              className="btn-press inline-flex items-center gap-1.5 border-2 border-black rounded-full px-3.5 py-1.5 text-xs sm:text-sm font-bold bg-white text-[#1C1A18] shadow-neo-sm cursor-pointer hover:bg-neutral-50 hover:shadow-[2px_2px_0px_#38BDF8] transition-all"
            >
              <Info size={15} />
              <span>About</span>
            </button>

            <button
              id="drop-note-btn"
              onClick={onDropNote}
              className="btn-press inline-flex items-center gap-1.5 bg-[#1C1A18] text-white border-2 border-black rounded-full px-4 py-1.5 text-xs sm:text-sm font-extrabold shadow-[3px_3px_0px_#F43F5E] cursor-pointer hover:bg-neutral-900 transition-all"
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

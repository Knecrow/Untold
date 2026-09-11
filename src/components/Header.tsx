'use client'

import { Pin, Info, Sun, Moon } from 'lucide-react'

interface Props {
  onDropNote: () => void
  onAbout: () => void
  noteCount: number
  theme: 'light' | 'dark'
  onToggleTheme: () => void
}

export default function Header({ onDropNote, onAbout, noteCount, theme, onToggleTheme }: Props) {
  return (
    <header className="sticky top-0 z-40 bg-[#F7F4EE]/90 dark:bg-[#181622]/90 backdrop-blur-sm border-b-2 border-black dark:border-white/20 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16 gap-4">

          {/* Logo / Brand */}
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 border-2 border-black dark:border-white/30 rounded-xl overflow-hidden flex items-center justify-center shadow-neo-sm flex-shrink-0 bg-white">
              <img
                src="/logo.jpg"
                alt="Taleless Logo"
                className="w-full h-full object-cover scale-105"
              />
            </div>
            <div className="min-w-0">
              <h1 className="text-xl font-black tracking-tight leading-none text-[#1C1A18] dark:text-white" style={{ fontFamily: 'Instrument Serif, serif' }}>Taleless</h1>
              <p className="text-xs text-[#2D2A26]/70 dark:text-neutral-400 font-semibold hidden sm:flex items-center gap-1.5 mt-0.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block animate-pulse" />
                <span>{noteCount} {noteCount === 1 ? 'thought' : 'thoughts'} on the board</span>
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
            {/* Dark / Light Mode Toggle */}
            <button
              id="theme-toggle-btn"
              onClick={onToggleTheme}
              title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
              className="btn-press p-2 rounded-full border-2 border-black dark:border-white/30 bg-white dark:bg-[#27272A] text-[#1C1A18] dark:text-white shadow-neo-sm cursor-pointer hover:bg-neutral-50 dark:hover:bg-neutral-700 transition-all"
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? (
                <Sun size={15} className="text-[#FACC15] fill-[#FACC15]" />
              ) : (
                <Moon size={15} />
              )}
            </button>

            <button
              id="about-btn"
              onClick={onAbout}
              className="btn-press inline-flex items-center gap-1.5 border-2 border-black dark:border-white/30 rounded-full px-3.5 py-1.5 text-xs sm:text-sm font-bold bg-white dark:bg-[#27272A] text-[#1C1A18] dark:text-white shadow-neo-sm cursor-pointer hover:bg-neutral-50 dark:hover:bg-neutral-700 transition-all"
            >
              <Info size={15} />
              <span>About</span>
            </button>

            <button
              id="drop-note-btn"
              onClick={onDropNote}
              className="btn-press inline-flex items-center gap-1.5 bg-[#1C1A18] dark:bg-white text-white dark:text-[#1C1A18] border-2 border-black dark:border-white rounded-full px-4 py-1.5 text-xs sm:text-sm font-extrabold shadow-[3px_3px_0px_#F43F5E] dark:shadow-[3px_3px_0px_#38BDF8] cursor-pointer hover:opacity-90 transition-all"
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

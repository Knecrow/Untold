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
    <header className="sticky top-0 z-40 glass-header transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16 gap-4">

          {/* Logo / Brand */}
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 rounded-xl overflow-hidden flex items-center justify-center flex-shrink-0 bg-white/80 dark:bg-white/10 backdrop-blur-sm border-2 border-black/75 dark:border-white/20 shadow-neo-sm p-1">
              <img
                src="/logo.png"
                alt="Taleless Logo"
                className="w-full h-full object-contain"
              />
            </div>
            <div className="min-w-0">
              <h1 className="text-xl font-black tracking-tight leading-none text-[#1A1714] dark:text-white" style={{ fontFamily: 'Instrument Serif, serif' }}>Taleless</h1>
              <p className="text-xs text-[#1A1714]/60 dark:text-white/50 font-semibold hidden sm:flex items-center gap-1.5 mt-0.5">
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
              className="btn-press glass-btn p-2 rounded-full cursor-pointer"
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? (
                <Sun size={15} className="text-[#FACC15] fill-[#FACC15]" />
              ) : (
                <Moon size={15} className="text-[#1A1714]" />
              )}
            </button>

            <button
              id="about-btn"
              onClick={onAbout}
              className="btn-press glass-btn inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs sm:text-sm font-bold text-[#1A1714] dark:text-white/90 cursor-pointer"
            >
              <Info size={15} />
              <span>About</span>
            </button>

            <button
              id="drop-note-btn"
              onClick={onDropNote}
              className="btn-press inline-flex items-center gap-1.5 bg-[#1A1714] dark:bg-white/90 text-white dark:text-[#1A1714] border-2 border-black/80 dark:border-white/80 rounded-full px-4 py-1.5 text-xs sm:text-sm font-extrabold shadow-[3px_3px_0px_#F43F5E] dark:shadow-[3px_3px_0px_#818CF8] cursor-pointer hover:opacity-90 transition-all backdrop-blur-sm"
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

'use client'

import { useState } from 'react'
import { X, Sparkles, Shield, Trash2, Heart, ExternalLink, Dices, Pin, Sun, Moon } from 'lucide-react'

interface Props {
  onClose: () => void
  onClearInteractions?: () => void
  theme?: 'light' | 'dark'
  onToggleTheme?: () => void
}

export default function AboutSettingsModal({
  onClose,
  onClearInteractions,
  theme = 'light',
  onToggleTheme,
}: Props) {
  const [cleared, setCleared] = useState(false)

  function handleClear() {
    if (confirm('Reset your locally saved stars and reactions on this browser?')) {
      if (onClearInteractions) onClearInteractions()
      setCleared(true)
      setTimeout(() => setCleared(false), 2500)
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 modal-backdrop bg-black/40 dark:bg-black/70 backdrop-blur-xs"
      onClick={e => e.target === e.currentTarget && onClose()}
      role="dialog"
      aria-modal="true"
      aria-label="About Taleless & Settings"
    >
      <div className="w-full max-w-lg glass-modal text-[#1A1714] dark:text-[#F0EFF4] border-2 border-black/80 dark:border-white/12 rounded-2xl shadow-neo-lg dark:shadow-[5px_5px_0px_rgba(255,255,255,0.08)] overflow-hidden max-h-[90vh] flex flex-col transition-colors">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-black/15 dark:border-white/10 bg-white/30 dark:bg-white/5 backdrop-blur-sm shrink-0 transition-colors">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg overflow-hidden flex items-center justify-center shadow-neo-sm shrink-0 bg-white/80 dark:bg-white/10 backdrop-blur-sm border-2 border-black/75 dark:border-white/20 p-0.5">
              <img src="/logo.png" alt="Taleless" className="w-full h-full object-contain" />
            </div>
            <h2 className="font-bold text-lg font-serif text-[#1A1714] dark:text-white">About Taleless</h2>
          </div>
          <button
            onClick={onClose}
            className="btn-press glass-btn p-1.5 rounded-full cursor-pointer text-[#1A1714] dark:text-white"
            aria-label="Close"
          >
            <X size={16} strokeWidth={2.5} />
          </button>
        </div>

        {/* Body Content */}
        <div className="overflow-y-auto p-6 space-y-6">

          {/* Philosophy / Mission */}
          <div className="glass-panel rounded-2xl p-5 shadow-neo-sm transition-colors">
            <div className="flex items-center gap-2 mb-2.5">
              <Sparkles size={16} className="text-amber-500" />
              <h3 className="font-bold text-sm text-[#1A1714] dark:text-white uppercase tracking-wide">The Philosophy</h3>
            </div>
            <p className="text-sm text-[#1A1714]/80 dark:text-white/80 leading-relaxed mb-3">
              <strong>Taleless</strong> is an anonymous digital corkboard where people share raw, unfiltered thoughts, quiet hopes, micro-confessions, and small wins.
            </p>
            <div className="bg-amber-50/80 dark:bg-amber-950/40 backdrop-blur-sm border border-amber-200 dark:border-amber-800/60 rounded-xl p-3 flex items-start gap-2.5">
              <Dices size={18} className="text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
              <p className="text-xs text-[#1A1714]/75 dark:text-white/75 leading-relaxed">
                <strong>Zero Algorithms. Pure Luck:</strong> No post is treated specially. Every time you refresh or visit, all notes are completely randomized so every voice has an equal chance of being heard.
              </p>
            </div>
          </div>

          {/* Privacy & Zero-tracking Pledge */}
          <div className="glass-panel rounded-2xl p-5 shadow-neo-sm transition-colors">
            <div className="flex items-center gap-2 mb-2.5">
              <Shield size={16} className="text-emerald-600 dark:text-emerald-400" />
              <h3 className="font-bold text-sm text-[#1C1A18] dark:text-white uppercase tracking-wide">100% Anonymous & Private</h3>
            </div>
            <ul className="text-xs text-[#2D2A26]/80 dark:text-neutral-300 space-y-1.5 list-disc list-inside">
              <li>No user accounts, profiles, or tracking cookies.</li>
              <li>No logs of who posts or reacts.</li>
              <li>Your reactions are saved strictly in your own browser’s local storage.</li>
            </ul>
          </div>

          {/* Creator Credit */}
          <div className="glass-panel rounded-2xl p-5 shadow-neo-sm transition-colors">
            <div className="flex items-center gap-2 mb-3">
              <Heart size={16} className="text-rose-500 fill-rose-500" />
              <h3 className="font-bold text-sm text-[#1A1714] dark:text-white uppercase tracking-wide">Creator & Open Source</h3>
            </div>
            <p className="text-sm text-[#1A1714]/80 dark:text-white/80 leading-relaxed mb-4">
              Designed & developed with care by <strong>Syed Nahian</strong> (<span className="font-mono text-xs font-bold text-neutral-600 dark:text-neutral-400">@Knecrow</span>).
            </p>
            <div className="flex flex-wrap gap-2.5">
              <a
                href="https://github.com/Knecrow"
                target="_blank"
                rel="noopener noreferrer"
                className="btn-press inline-flex items-center gap-1.5 bg-[#1A1714] dark:bg-white/90 text-white dark:text-[#1A1714] border-2 border-black/80 dark:border-white/80 rounded-full px-3.5 py-1.5 text-xs font-bold shadow-neo-sm hover:opacity-90 transition-all"
              >
                <span>GitHub Profile</span>
                <ExternalLink size={12} />
              </a>
              <a
                href="https://github.com/Knecrow/Untold"
                target="_blank"
                rel="noopener noreferrer"
                className="btn-press glass-btn inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-bold text-[#1A1714] dark:text-white/90 hover:opacity-90 transition-all"
              >
                <span>★ Star on GitHub</span>
                <ExternalLink size={12} />
              </a>
            </div>
          </div>

          {/* Preferences & Settings */}
          <div className="glass-panel rounded-2xl p-5 shadow-neo-sm transition-colors">
            <h3 className="font-bold text-sm text-[#1A1714] dark:text-white uppercase tracking-wide mb-3">Settings & Controls</h3>
            <div className="space-y-4">
              {/* Theme toggle row */}
              {onToggleTheme && (
                <div className="flex items-center justify-between gap-3 pb-3 border-b border-black/10 dark:border-white/10">
                  <div>
                    <p className="text-xs font-bold text-[#1A1714] dark:text-white">Appearance</p>
                    <p className="text-[0.7rem] text-[#1A1714]/50 dark:text-white/40">
                      Currently using {theme === 'dark' ? 'Dark mode (Midnight Board)' : 'Light mode (Warm Paper)'}
                    </p>
                  </div>
                  <button
                    onClick={onToggleTheme}
                    className="btn-press glass-btn inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold text-[#1A1714] dark:text-white/90 cursor-pointer"
                  >
                    {theme === 'dark' ? (
                      <>
                        <Sun size={13} className="text-[#FACC15] fill-[#FACC15]" />
                        <span>Light Mode</span>
                      </>
                    ) : (
                      <>
                        <Moon size={13} />
                        <span>Dark Mode</span>
                      </>
                    )}
                  </button>
                </div>
              )}

              {/* Reset interactions row */}
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs font-bold text-[#1A1714] dark:text-white">Reset My Interactions</p>
                  <p className="text-[0.7rem] text-[#1A1714]/50 dark:text-white/40">Clears your saved reaction hearts & stars from this browser</p>
                </div>
                <button
                  onClick={handleClear}
                  className="btn-press inline-flex items-center gap-1.5 border-2 border-rose-400/60 dark:border-rose-600/40 rounded-full px-3 py-1 text-xs font-bold bg-rose-50/80 dark:bg-rose-950/40 backdrop-blur-sm text-rose-700 dark:text-rose-300 shadow-neo-sm cursor-pointer hover:bg-rose-100/80 dark:hover:bg-rose-900/40 transition-colors"
                >
                  <Trash2 size={12} />
                  <span>{cleared ? '✓ Reset!' : 'Reset'}</span>
                </button>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}

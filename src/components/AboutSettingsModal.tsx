'use client'

import { useState } from 'react'
import { X, Sparkles, Shield, RefreshCw, Trash2, Heart, ExternalLink, Dices, Pin } from 'lucide-react'

interface Props {
  onClose: () => void
  onClearInteractions?: () => void
}

export default function AboutSettingsModal({ onClose, onClearInteractions }: Props) {
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
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 modal-backdrop bg-black/30 backdrop-blur-xs"
      onClick={e => e.target === e.currentTarget && onClose()}
      role="dialog"
      aria-modal="true"
      aria-label="About Taleless & Settings"
    >
      <div className="w-full max-w-lg bg-[#F7F4EE] border-2 border-black rounded-2xl shadow-neo-lg overflow-hidden max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b-2 border-black bg-white shrink-0">
          <div className="flex items-center gap-2">
            <Pin size={18} strokeWidth={2.4} className="text-[#1C1A18]" />
            <h2 className="font-bold text-lg font-serif">About Taleless</h2>
          </div>
          <button
            onClick={onClose}
            className="btn-press p-1.5 rounded-full border-2 border-black bg-white shadow-neo-sm cursor-pointer hover:bg-gray-50"
            aria-label="Close"
          >
            <X size={16} strokeWidth={2.5} />
          </button>
        </div>

        {/* Body Content */}
        <div className="overflow-y-auto p-6 space-y-6">

          {/* Philosophy / Mission */}
          <div className="bg-white border-2 border-black rounded-2xl p-5 shadow-neo-sm">
            <div className="flex items-center gap-2 mb-2.5">
              <Sparkles size={16} className="text-amber-500" />
              <h3 className="font-bold text-sm text-[#1C1A18] uppercase tracking-wide">The Philosophy</h3>
            </div>
            <p className="text-sm text-[#2D2A26] leading-relaxed mb-3">
              <strong>Taleless</strong> is an anonymous digital corkboard where people share raw, unfiltered thoughts, quiet hopes, micro-confessions, and small wins.
            </p>
            <div className="bg-[#FFFBEB] border border-amber-200 rounded-xl p-3 flex items-start gap-2.5">
              <Dices size={18} className="text-amber-600 shrink-0 mt-0.5" />
              <p className="text-xs text-[#2D2A26] leading-relaxed">
                <strong>Zero Algorithms. Pure Luck:</strong> No post is treated specially. Every time you refresh or visit, all notes are completely randomized so every voice has an equal chance of being heard.
              </p>
            </div>
          </div>

          {/* Privacy & Zero-tracking Pledge */}
          <div className="bg-white border-2 border-black rounded-2xl p-5 shadow-neo-sm">
            <div className="flex items-center gap-2 mb-2.5">
              <Shield size={16} className="text-emerald-600" />
              <h3 className="font-bold text-sm text-[#1C1A18] uppercase tracking-wide">100% Anonymous & Private</h3>
            </div>
            <ul className="text-xs text-[#2D2A26]/80 space-y-1.5 list-disc list-inside">
              <li>No user accounts, profiles, or tracking cookies.</li>
              <li>No logs of who posts or reacts.</li>
              <li>Your reactions are saved strictly in your own browser’s local storage.</li>
            </ul>
          </div>

          {/* Creator Credit */}
          <div className="bg-white border-2 border-black rounded-2xl p-5 shadow-neo-sm">
            <div className="flex items-center gap-2 mb-3">
              <Heart size={16} className="text-rose-500 fill-rose-500" />
              <h3 className="font-bold text-sm text-[#1C1A18] uppercase tracking-wide">Creator & Open Source</h3>
            </div>
            <p className="text-sm text-[#2D2A26] leading-relaxed mb-4">
              Designed & developed with care by <strong>Syed Nahian</strong> (<span className="font-mono text-xs font-bold text-neutral-600">@Knecrow</span>).
            </p>
            <div className="flex flex-wrap gap-2.5">
              <a
                href="https://github.com/Knecrow"
                target="_blank"
                rel="noopener noreferrer"
                className="btn-press inline-flex items-center gap-1.5 bg-[#1C1A18] text-white border-2 border-black rounded-full px-3.5 py-1.5 text-xs font-bold shadow-neo-sm hover:bg-neutral-800 transition-colors"
              >
                <span>GitHub Profile</span>
                <ExternalLink size={12} />
              </a>
              <a
                href="https://github.com/Knecrow/Untold"
                target="_blank"
                rel="noopener noreferrer"
                className="btn-press inline-flex items-center gap-1.5 bg-white border-2 border-black rounded-full px-3.5 py-1.5 text-xs font-bold shadow-neo-sm hover:bg-neutral-50 transition-colors"
              >
                <span>★ Star on GitHub</span>
                <ExternalLink size={12} />
              </a>
            </div>
          </div>

          {/* Preferences & Settings */}
          <div className="bg-white border-2 border-black rounded-2xl p-5 shadow-neo-sm">
            <h3 className="font-bold text-sm text-[#1C1A18] uppercase tracking-wide mb-3">Settings & Controls</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs font-bold text-[#1C1A18]">Reset My Interactions</p>
                  <p className="text-[0.7rem] text-neutral-500">Clears your saved reaction hearts & stars from this browser</p>
                </div>
                <button
                  onClick={handleClear}
                  className="btn-press inline-flex items-center gap-1.5 border-2 border-black rounded-full px-3 py-1 text-xs font-bold bg-rose-50 text-rose-700 shadow-neo-sm cursor-pointer hover:bg-rose-100"
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

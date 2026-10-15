'use client'

import { useState, useRef, useEffect } from 'react'
import { CATEGORIES, CATEGORY_MAP } from '@/constants'
import { apiCreatePost, apiPostToLocal } from '@/lib/api'
import { X, Pin } from 'lucide-react'
import type { LocalNote } from '@/app/board-client'

const MIN_WORDS = 50
const MAX_WORDS = 150

interface Props {
  onClose: () => void
  onSubmit: (note: LocalNote) => void
}

export default function DropNoteModal({ onClose, onSubmit }: Props) {
  const [category, setCategory] = useState(CATEGORIES[0].id)
  const [text, setText] = useState('')
  const [honeypot, setHoneypot] = useState('')  // anti-spam
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const cat = CATEGORY_MAP[category]
  const words = text.trim() ? text.trim().split(/\s+/).filter(Boolean) : []
  const wordCount = words.length

  useEffect(() => {
    textareaRef.current?.focus()
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [onClose])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (honeypot) return // bot detected

    if (wordCount < MIN_WORDS) {
      setError(`Please write at least ${MIN_WORDS} words to capture the story (${MIN_WORDS - wordCount} more words needed) ✍️`)
      return
    }
    if (wordCount > MAX_WORDS) {
      setError(`Please keep your story under ${MAX_WORDS} words (${wordCount - MAX_WORDS} words over)`)
      return
    }

    setSubmitting(true)
    setError('')

    try {
      // Call the real API — creates post in Turso DB
      const apiPost = await apiCreatePost(text.trim(), category)
      const note = apiPostToLocal(apiPost)
      onSubmit(note)
      onClose()
    } catch (err) {
      // Fallback: create an optimistic local-only note if DB is not configured
      const isDbError = err instanceof Error &&
        (err.message.includes('TURSO') || err.message.includes('500'))

      if (isDbError) {
        // Graceful degradation: add note locally
        const localNote: LocalNote = {
          id: `local-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
          category,
          text: text.trim(),
          stars: 0,
          heard: 0,
          hug: 0,
          createdAt: Date.now(),
        }
        onSubmit(localNote)
        onClose()
      } else {
        setError(err instanceof Error ? err.message : 'Failed to post. Try again.')
      }
    } finally {
      setSubmitting(false)
    }
  }

  const counterClass = wordCount > MAX_WORDS
    ? 'text-red-600 dark:text-red-400 font-extrabold'
    : wordCount < MIN_WORDS
      ? 'text-[#8C6D3B] dark:text-amber-400 font-semibold'
      : 'text-emerald-700 dark:text-emerald-400 font-bold'

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 modal-backdrop bg-black/40 dark:bg-black/70 backdrop-blur-xs"
      onClick={(e) => e.target === e.currentTarget && onClose()}
      role="dialog"
      aria-modal="true"
      aria-label="Drop a note"
    >
      <div
        className="w-full max-w-lg glass-modal text-[#1A1714] dark:text-[#F0EFF4] border-2 border-black/80 dark:border-white/12 rounded-2xl shadow-neo-lg dark:shadow-[5px_5px_0px_rgba(255,255,255,0.08)] overflow-hidden transition-colors"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 pt-5 pb-3 border-b border-black/15 dark:border-white/10 bg-white/30 dark:bg-white/5 backdrop-blur-sm transition-colors">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg overflow-hidden flex items-center justify-center shadow-neo-sm shrink-0 bg-white/80 dark:bg-white/10 backdrop-blur-sm border-2 border-black/75 dark:border-white/20 p-0.5">
              <img src="/logo.png" alt="Taleless" className="w-full h-full object-contain" />
            </div>
            <h2 className="font-bold text-lg font-serif text-[#1A1714] dark:text-white">Drop a Story on Taleless</h2>
          </div>
          <button
            onClick={onClose}
            className="btn-press glass-btn p-1.5 rounded-full cursor-pointer text-[#1A1714] dark:text-white"
            aria-label="Close modal"
          >
            <X size={16} strokeWidth={2.5} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4" noValidate>

          {/* Category picker */}
          <div>
            <label className="block text-xs font-bold mb-2 uppercase tracking-wide text-[#1A1A1A] dark:text-neutral-300">
              Category
            </label>
            <div className="flex flex-wrap gap-2">
              {CATEGORIES.map(c => {
                const isSelected = category === c.id
                return (
                  <button
                    type="button"
                    key={c.id}
                    onClick={() => setCategory(c.id)}
                    className="btn-press glass-btn inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold cursor-pointer transition-all"
                    style={{
                      background: isSelected ? `${c.color}E8` : undefined,
                      boxShadow: isSelected
                        ? `2px 2px 0px 0px rgba(0,0,0,0.72), 4px 4px 0px 0px ${c.accentColor || '#000'}`
                        : undefined,
                      transform: isSelected ? 'translate(-1px, -1px)' : undefined,
                    }}
                  >
                    <span className="font-extrabold" style={{ color: c.accentColor || '#1A1714' }}>
                      {c.emoji}
                    </span>
                    <span className="text-[#1A1714] dark:text-white/85">{c.label}</span>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Text area */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-xs font-bold uppercase tracking-wide text-[#1A1A1A] dark:text-neutral-300" htmlFor="note-text">
                Your Story or Occurrence
              </label>
              <span className="text-[11px] font-bold text-gray-500 dark:text-neutral-400 bg-gray-100 dark:bg-neutral-800 border border-black/20 dark:border-white/20 rounded-full px-2 py-0.5">
                50 – 150 words
              </span>
            </div>

            <div className="relative">
              <textarea
                id="note-text"
                ref={textareaRef}
                value={text}
                onChange={e => { setText(e.target.value); setError('') }}
                placeholder="Tell us about a small moment, an encounter, or an occurrence from your life that you've never shared before... (at least 50 words)"
                rows={7}
                className="w-full bg-white/60 dark:bg-white/5 backdrop-blur-sm text-[#1A1714] dark:text-white border-2 border-black/75 dark:border-white/15 rounded-xl p-3 text-sm font-semibold resize-none placeholder:text-[#1A1714]/40 dark:placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-black/25 dark:focus:ring-white/20 focus:bg-white/75 dark:focus:bg-white/8 transition-all"
                style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}
              />
            </div>

            {/* Word count progress row */}
            <div className="flex items-center justify-between mt-2 text-xs">
              {wordCount < MIN_WORDS ? (
                <span className="text-[#8C6D3B] dark:text-amber-400 font-semibold flex items-center gap-1">
                  <span className="text-[13px] leading-none">✎</span>
                  <span>{MIN_WORDS - wordCount} more words needed</span>
                </span>
              ) : wordCount <= MAX_WORDS ? (
                <span className="text-emerald-700 dark:text-emerald-400 font-bold flex items-center gap-1">
                  <span className="text-[13px] leading-none">✦</span>
                  <span>Ready to pin to board</span>
                </span>
              ) : (
                <span className="text-red-600 dark:text-red-400 font-extrabold flex items-center gap-1">
                  <span className="text-[11px] leading-none">▲</span>
                  <span>{wordCount - MAX_WORDS} words over limit</span>
                </span>
              )}

              <span className={`tabular-nums ${counterClass}`}>
                {wordCount} / {MAX_WORDS} words
              </span>
            </div>

            {error && (
              <p className="mt-1.5 text-xs font-semibold text-red-600 dark:text-red-400">{error}</p>
            )}
          </div>

          {/* Honeypot (hidden from real users) */}
          <div className="absolute -left-[9999px]" aria-hidden="true">
            <label htmlFor="url">Website URL</label>
            <input
              id="url"
              type="text"
              name="url"
              value={honeypot}
              onChange={e => setHoneypot(e.target.value)}
              tabIndex={-1}
              autoComplete="off"
            />
          </div>

          {/* Preview label */}
          <div className="text-xs font-semibold opacity-80 flex items-center gap-2">
            <span>Preview:</span>
            <span className="glass-pill inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-bold">
              <span className="text-xs font-black" style={{ color: cat.accentColor || '#1A1714' }}>
                {cat.emoji}
              </span>
              <span className="font-extrabold text-[11px] uppercase tracking-wider text-[#1A1714] dark:text-white/85">
                {cat.label}
              </span>
            </span>
          </div>

          {/* Submit */}
          <button
            id="pin-to-board-btn"
            type="submit"
            disabled={submitting || wordCount < MIN_WORDS || wordCount > MAX_WORDS}
            className="btn-press w-full flex items-center justify-center gap-2 bg-[#1A1714] dark:bg-white/90 text-white dark:text-[#1A1714] border-2 border-black/80 dark:border-white/80 rounded-full py-3 font-extrabold text-sm shadow-[3px_3px_0px_#F43F5E] dark:shadow-[3px_3px_0px_#818CF8] cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-none hover:opacity-90 transition-all"
          >
            <Pin size={16} />
            {submitting
              ? 'Pinning Story…'
              : wordCount < MIN_WORDS
                ? `${MIN_WORDS - wordCount} words to go…`
                : 'Pin Story to Board'}
          </button>
        </form>
      </div>
    </div>
  )
}

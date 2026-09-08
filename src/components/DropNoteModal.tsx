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
    ? 'text-red-600 font-extrabold'
    : wordCount < MIN_WORDS
      ? 'text-[#8C6D3B] font-semibold'
      : 'text-emerald-700 font-bold'

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 modal-backdrop bg-black/30"
      onClick={(e) => e.target === e.currentTarget && onClose()}
      role="dialog"
      aria-modal="true"
      aria-label="Drop a note"
    >
      <div
        className="w-full max-w-lg bg-white border-2 border-black rounded-2xl shadow-neo-lg overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 pt-5 pb-3 border-b-2 border-black bg-white">
          <div className="flex items-center gap-2">
            <Pin size={18} strokeWidth={2.5} />
            <h2 className="font-bold text-lg font-serif">Drop an Untold Story</h2>
          </div>
          <button
            onClick={onClose}
            className="btn-press p-1.5 rounded-full border-2 border-black bg-white shadow-neo-sm cursor-pointer hover:bg-gray-50"
            aria-label="Close modal"
          >
            <X size={16} strokeWidth={2.5} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4" noValidate>

          {/* Category picker */}
          <div>
            <label className="block text-xs font-bold mb-2 uppercase tracking-wide text-[#1A1A1A]">
              Category
            </label>
            <div className="flex flex-wrap gap-2">
              {CATEGORIES.map(c => (
                <button
                  type="button"
                  key={c.id}
                  onClick={() => setCategory(c.id)}
                  className="btn-press inline-flex items-center gap-1 border-2 border-black rounded-full px-3 py-1 text-xs font-bold cursor-pointer transition-all"
                  style={{
                    backgroundColor: category === c.id ? c.color : 'white',
                    boxShadow: category === c.id ? '2px 2px 0px 0px #000' : 'none',
                  }}
                >
                  <span>{c.emoji}</span>
                  <span>{c.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Text area */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-xs font-bold uppercase tracking-wide text-[#1A1A1A]" htmlFor="note-text">
                Your Story or Occurrence
              </label>
              <span className="text-[11px] font-bold text-gray-500 bg-gray-100 border border-black/20 rounded-full px-2 py-0.5">
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
                className="w-full bg-white border-2 border-black rounded-xl p-3 text-sm font-semibold resize-none placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-black/30"
                style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}
              />
            </div>

            {/* Word count progress row */}
            <div className="flex items-center justify-between mt-2 text-xs">
              {wordCount < MIN_WORDS ? (
                <span className="text-[#8C6D3B] font-semibold flex items-center gap-1">
                  <span className="text-[13px] leading-none">✎</span>
                  <span>{MIN_WORDS - wordCount} more words needed</span>
                </span>
              ) : wordCount <= MAX_WORDS ? (
                <span className="text-emerald-700 font-bold flex items-center gap-1">
                  <span className="text-[13px] leading-none">✦</span>
                  <span>Ready to pin to board</span>
                </span>
              ) : (
                <span className="text-red-600 font-extrabold flex items-center gap-1">
                  <span className="text-[11px] leading-none">▲</span>
                  <span>{wordCount - MAX_WORDS} words over limit</span>
                </span>
              )}

              <span className={`tabular-nums ${counterClass}`}>
                {wordCount} / {MAX_WORDS} words
              </span>
            </div>

            {error && (
              <p className="mt-1.5 text-xs font-semibold text-red-600">{error}</p>
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
          <div className="text-xs font-semibold opacity-60 flex items-center gap-1.5">
            <span>Preview:</span>
            <span className="inline-flex items-center gap-1 bg-white border-2 border-black rounded-full px-2 py-0.5 text-xs font-bold shadow-neo-sm">
              <span className="text-xs font-bold text-[#2D2A26]/70">{cat.emoji}</span>
              <span>{cat.label}</span>
            </span>
          </div>

          {/* Submit */}
          <button
            id="pin-to-board-btn"
            type="submit"
            disabled={submitting || wordCount < MIN_WORDS || wordCount > MAX_WORDS}
            className="btn-press w-full flex items-center justify-center gap-2 bg-[#1A1A1A] text-white border-2 border-black rounded-full py-3 font-bold text-sm shadow-neo cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#333] transition-colors"
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

'use client'

import { useState, useRef, useEffect } from 'react'
import { CATEGORIES, CATEGORY_MAP } from '@/constants'
import { apiCreatePost, apiPostToLocal } from '@/lib/api'
import { X, Pin } from 'lucide-react'
import type { LocalNote } from '@/app/board-client'

const MAX_CHARS = 500

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
  const remaining = MAX_CHARS - text.length

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

    if (text.trim().length < 5) {
      setError('Please write at least a few words ✍️')
      return
    }
    if (text.length > MAX_CHARS) {
      setError(`Keep it under ${MAX_CHARS} characters`)
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

  const counterClass = remaining < 0
    ? 'counter-danger'
    : remaining < 80
      ? 'counter-warn'
      : 'text-gray-400'

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
        style={{ backgroundColor: cat.color }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 pt-5 pb-3 border-b-2 border-black bg-white">
          <div className="flex items-center gap-2">
            <Pin size={18} strokeWidth={2.5} />
            <h2 className="font-bold text-lg font-serif">Drop a Note</h2>
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
            <label className="block text-xs font-bold mb-2 uppercase tracking-wide text-[#1A1A1A]" htmlFor="note-text">
              Your thought
            </label>
            <div className="relative">
              <textarea
                id="note-text"
                ref={textareaRef}
                value={text}
                onChange={e => { setText(e.target.value); setError('') }}
                placeholder="What's been on your mind lately? No names, no judgment — just words."
                rows={5}
                maxLength={MAX_CHARS + 10}
                className="w-full bg-white border-2 border-black rounded-xl p-3 text-sm font-semibold resize-none placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-black/30"
                style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}
              />
              <span className={`absolute bottom-3 right-3 text-xs font-bold tabular-nums ${counterClass}`}>
                {text.length} / {MAX_CHARS}
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
              {cat.emoji} {cat.label}
            </span>
          </div>

          {/* Submit */}
          <button
            id="pin-to-board-btn"
            type="submit"
            disabled={submitting || text.trim().length < 1 || remaining < 0}
            className="btn-press w-full flex items-center justify-center gap-2 bg-[#1A1A1A] text-white border-2 border-black rounded-full py-3 font-bold text-sm shadow-neo cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#333] transition-colors"
          >
            <Pin size={16} />
            {submitting ? 'Pinning…' : 'Pin to Board'}
          </button>
        </form>
      </div>
    </div>
  )
}

'use client'

import { CATEGORY_MAP } from '@/constants'
import { relativeTime, tiltClass } from '@/utils'
import { Star, Share2 } from 'lucide-react'
import { useState, useRef } from 'react'
import type { LocalNote } from '@/app/board-client'

interface Props {
  note: LocalNote
  index: number
  interactions: Record<string, Record<string, boolean>>
  onStar: (id: string) => void
  onHeard: (id: string) => void
  onHug: (id: string) => void
  onShare: (id: string) => void
  isNew: boolean
}

export default function NoteCard({ note, index, interactions, onStar, onHeard, onHug, onShare, isNew }: Props) {
  const cat = CATEGORY_MAP[note.category] || CATEGORY_MAP['quiet-hope']
  const tilt = tiltClass(index)
  const myInteract = interactions[note.id] || {}

  const [showTooltip, setShowTooltip] = useState(false)
  const tooltipTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  function handleShare() {
    onShare(note.id)
    setShowTooltip(true)
    if (tooltipTimer.current) clearTimeout(tooltipTimer.current)
    tooltipTimer.current = setTimeout(() => setShowTooltip(false), 2000)
  }

  return (
    <div className={`masonry-item ${isNew ? 'pin-drop' : ''}`}>
      <div
        className={`note-card ${tilt} border-2 border-black rounded-2xl p-6 shadow-neo select-none`}
        style={{
          backgroundColor: cat.color || '#FFFDF5',
        }}
      >

        {/* Top bar — quiet & clean */}
        <div className="flex items-center justify-between mb-4 text-xs select-none">
          <div className="inline-flex items-center gap-1.5">
            <span className="text-sm">{cat.emoji}</span>
            <span className="font-semibold text-[#2D2A26]/80">{cat.label}</span>
          </div>
          <span className="text-[0.75rem] font-medium text-[#2D2A26]/50">
            {relativeTime(note.createdAt)}
          </span>
        </div>

        {/* Body text — the hero of the card */}
        <p className="text-[1.08rem] sm:text-[1.125rem] font-medium leading-[1.65] text-[#1C1A18] mb-5 break-words tracking-[-0.01em]">
          {note.text}
        </p>

        {/* Action bar — low-profile, clean counters */}
        <div className="flex items-center gap-2 flex-wrap pt-3 border-t border-black/10">

          {/* Star */}
          <ActionButton
            active={myInteract.starred}
            color="#FFD13B"
            onClick={() => onStar(note.id)}
            title="Star this note"
          >
            <Star size={13} className={myInteract.starred ? 'fill-current' : ''} />
            <span>{note.stars}</span>
          </ActionButton>

          {/* Heard */}
          <ActionButton
            active={myInteract.heard}
            color="#70C7FA"
            onClick={() => onHeard(note.id)}
            title="I heard this"
          >
            <span>🤍</span>
            <span>{note.heard}</span>
          </ActionButton>

          {/* Hug */}
          <ActionButton
            active={myInteract.hugged}
            color="#FFAEC0"
            onClick={() => onHug(note.id)}
            title="Send a hug"
          >
            <span>🫂</span>
            <span>{note.hug}</span>
          </ActionButton>

          {/* Share */}
          <div className="relative ml-auto">
            <button
              onClick={handleShare}
              title="Copy link"
              className="btn-press inline-flex items-center gap-1 border border-black/15 rounded-full px-2.5 py-1 text-xs font-semibold text-[#2D2A26]/70 cursor-pointer hover:text-black hover:border-black/30 hover:bg-black/5 transition-all"
              style={{ backgroundColor: 'rgba(255, 255, 255, 0.65)' }}
            >
              <Share2 size={11} />
              <span>Share</span>
            </button>
            {showTooltip && (
              <div
                className="tooltip-animate absolute bottom-full right-0 mb-2 bg-[#1A1A1A] text-white text-xs font-semibold px-2.5 py-1 rounded-full whitespace-nowrap pointer-events-none"
              >
                ✓ Copied!
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

interface ActionButtonProps {
  active: boolean
  color: string
  onClick: () => void
  title: string
  children: React.ReactNode
}

function ActionButton({ active, color, onClick, title, children }: ActionButtonProps) {
  const [popped, setPopped] = useState(false)

  function handleClick() {
    onClick()
    setPopped(true)
    setTimeout(() => setPopped(false), 300)
  }

  return (
    <button
      onClick={handleClick}
      title={title}
      className="btn-press inline-flex items-center gap-1.5 border border-black/15 rounded-full px-2.5 py-1 text-xs font-semibold text-[#2D2A26] cursor-pointer transition-all hover:border-black/30 hover:bg-black/5"
      style={{
        backgroundColor: active ? color : 'rgba(255, 255, 255, 0.65)',
        borderColor: active ? '#000000' : undefined,
        boxShadow: active ? '1px 1px 0px 0px #000' : 'none',
      }}
    >
      <span className={popped ? 'sparkle' : ''}>{children}</span>
    </button>
  )
}

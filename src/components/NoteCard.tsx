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
      <div className={`note-card ${tilt} bg-white border-2 border-black rounded-2xl p-5 shadow-neo select-none`}>

        {/* Top bar */}
        <div className="flex items-center justify-between mb-3 gap-2">
          <span className="inline-flex items-center gap-1.5 bg-neutral-50 border-2 border-black rounded-full px-3 py-0.5 text-xs font-bold text-neutral-900 shadow-neo-sm whitespace-nowrap">
            <span>{cat.emoji}</span>
            <span>{cat.label}</span>
          </span>
          <span className="text-xs font-semibold text-neutral-400 whitespace-nowrap shrink-0">
            {relativeTime(note.createdAt)}
          </span>
        </div>

        {/* Body */}
        <p className="text-[0.95rem] font-medium leading-relaxed text-neutral-900 mb-4 break-words">
          {note.text}
        </p>

        {/* Action bar */}
        <div className="flex items-center gap-2 flex-wrap pt-2 border-t border-neutral-100">

          {/* Star */}
          <ActionButton
            active={myInteract.starred}
            color="#FFD13B"
            onClick={() => onStar(note.id)}
            title="Star this note"
          >
            <Star size={14} className={myInteract.starred ? 'fill-current' : ''} />
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
              className="btn-press inline-flex items-center gap-1.5 bg-white border-2 border-black rounded-full px-3 py-1 text-xs font-bold shadow-neo-sm cursor-pointer hover:bg-[#FFFDF5] transition-colors"
            >
              <Share2 size={12} />
              <span>Share</span>
            </button>
            {showTooltip && (
              <div className="tooltip-animate absolute bottom-full left-1/2 mb-2 bg-[#1A1A1A] text-white text-xs font-semibold px-2.5 py-1 rounded-full whitespace-nowrap pointer-events-none"
                style={{ transform: 'translateX(-50%)' }}>
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
      className="btn-press inline-flex items-center gap-1.5 border-2 border-black rounded-full px-3 py-1 text-xs font-bold shadow-neo-sm cursor-pointer transition-colors"
      style={{
        backgroundColor: active ? color : 'white',
      }}
    >
      <span className={popped ? 'sparkle' : ''}>{children}</span>
    </button>
  )
}

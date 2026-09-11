'use client'

import { CATEGORY_MAP } from '@/constants'
import { Share2, Flag, Camera } from 'lucide-react'
import { useState, useRef } from 'react'
import { exportCardAsImage } from '@/lib/exportCard'
import type { LocalNote } from '@/app/board-client'

interface Props {
  note: LocalNote
  index: number
  interactions: Record<string, Record<string, boolean>>
  onStar: (id: string) => void
  onHeard: (id: string) => void
  onHug: (id: string) => void
  onShare: (id: string) => void
  onFlag?: (id: string) => void
  isNew: boolean
}

export default function NoteCard({
  note,
  index,
  interactions,
  onStar,
  onHeard,
  onHug,
  onShare,
  onFlag,
  isNew,
}: Props) {
  const cat = CATEGORY_MAP[note.category] || CATEGORY_MAP['quiet-hope']
  const myInteract = interactions[note.id] || {}

  const [showTooltip, setShowTooltip] = useState(false)
  const [exporting, setExporting] = useState(false)
  const tooltipTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  function handleShare() {
    onShare(note.id)
    setShowTooltip(true)
    if (tooltipTimer.current) clearTimeout(tooltipTimer.current)
    tooltipTimer.current = setTimeout(() => setShowTooltip(false), 2000)
  }

  function handleFlag() {
    if (confirm('Flag this thought as inappropriate? It will be hidden immediately.')) {
      if (onFlag) onFlag(note.id)
    }
  }

  async function handleExport() {
    setExporting(true)
    try {
      await exportCardAsImage(
        {
          text: note.text,
          category: {
            label: cat.label,
            emoji: cat.emoji,
            color: cat.color,
            textColor: cat.textColor,
          },
        },
        note.id,
      )
    } finally {
      setExporting(false)
    }
  }

  // Calculate word count for 3 distinct card height tiers
  const wordCount = (note.text || '').trim().split(/\s+/).filter(Boolean).length
  const tierClass =
    wordCount <= 75
      ? 'card-tier-short'
      : wordCount <= 115
        ? 'card-tier-medium'
        : 'card-tier-tall'

  return (
    <div className={`masonry-item ${isNew ? 'pin-drop' : ''}`}>
      <div
        className={`note-card ${tierClass} w-full flex flex-col justify-between border-2 border-black rounded-2xl p-6 select-none transition-all duration-200`}
        style={
          {
            backgroundColor: cat.color || '#FFFDF5',
            '--shadow-accent': cat.accentColor || '#000',
          } as React.CSSProperties
        }
      >
        <div>
          {/* Top bar — sticker category badge & discreet flag */}
          <div className="flex items-center justify-between mb-4 text-xs select-none">
            <div className="inline-flex items-center gap-1.5 bg-white border-2 border-black rounded-full px-2.5 py-0.5 shadow-neo-sm">
              <span className="text-xs font-black" style={{ color: cat.accentColor || '#1C1A18' }}>
                {cat.emoji}
              </span>
              <span className="font-extrabold text-[11px] uppercase tracking-wider text-[#1C1A18]">
                {cat.label}
              </span>
            </div>
            {/* Discreet Flag / Report button */}
            <button
              onClick={handleFlag}
              title="Flag as inappropriate"
              className="p-1 text-[#2D2A26]/40 hover:text-rose-600 transition-colors cursor-pointer rounded-full hover:bg-black/5"
              aria-label="Flag note"
            >
              <Flag size={12} />
            </button>
          </div>

          {/* Body text — the hero of the card */}
          <p className="font-medium leading-[1.65] text-[#1C1A18] mb-6 break-words tracking-[-0.01em] text-[1.05rem] sm:text-[1.1rem]">
            {note.text}
          </p>
        </div>

        {/* Action bar — high-contrast neo-brutalist reaction buttons */}
        <div className="flex items-center gap-2 flex-wrap pt-3.5 border-t-2 border-black/15 mt-auto">
          {/* Star with floating star */}
          <ActionButton
            active={myInteract.starred}
            color="#FACC15"
            emoji="★"
            onClick={() => onStar(note.id)}
            title="Star this note"
          >
            <span className="text-[13px] leading-none font-black text-[#D97706]">★</span>
            <span className="font-extrabold">{note.stars}</span>
          </ActionButton>

          {/* Heard with floating heart */}
          <ActionButton
            active={myInteract.heard}
            color="#FB7185"
            emoji="♥"
            onClick={() => onHeard(note.id)}
            title="I heard this"
          >
            <span className="text-[13px] leading-none font-black text-[#E11D48]">♥</span>
            <span className="font-extrabold">{note.heard}</span>
          </ActionButton>

          {/* Hug with floating comfort spark */}
          <ActionButton
            active={myInteract.hugged}
            color="#38BDF8"
            emoji="✦"
            onClick={() => onHug(note.id)}
            title="Send comfort"
          >
            <span className="text-[13px] leading-none font-black text-[#0284C7]">✦</span>
            <span className="font-extrabold">{note.hug}</span>
          </ActionButton>

          {/* Export as Image Card & Share */}
          <div className="relative ml-auto flex items-center gap-1.5">
            <button
              onClick={handleExport}
              disabled={exporting}
              title="Save as Image (Share to Instagram/Twitter)"
              className="btn-press inline-flex items-center gap-1 bg-white border-2 border-black rounded-full px-2.5 py-1 text-xs font-bold text-[#1C1A18] cursor-pointer hover:bg-neutral-50 transition-all shadow-[2px_2px_0px_#000]"
            >
              <Camera size={11} />
              <span>{exporting ? 'Saving…' : 'Card'}</span>
            </button>

            <button
              onClick={handleShare}
              title="Copy link"
              className="btn-press inline-flex items-center gap-1 bg-white border-2 border-black rounded-full px-2.5 py-1 text-xs font-bold text-[#1C1A18] cursor-pointer hover:bg-neutral-50 transition-all shadow-[2px_2px_0px_#000]"
            >
              <Share2 size={11} />
              <span>Share</span>
            </button>
            {showTooltip && (
              <div className="tooltip-animate absolute bottom-full right-0 mb-2 bg-[#1A1A1A] text-white text-xs font-semibold px-2.5 py-1 rounded-full whitespace-nowrap pointer-events-none shadow-neo-sm">
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
  emoji?: string
  onClick: () => void
  title: string
  children: React.ReactNode
}

function ActionButton({ active, color, emoji, onClick, title, children }: ActionButtonProps) {
  const [popped, setPopped] = useState(false)
  const [flourish, setFlourish] = useState<number[]>([])

  function handleClick() {
    onClick()
    setPopped(true)
    setTimeout(() => setPopped(false), 300)

    if (!active && emoji) {
      const now = Date.now()
      setFlourish(prev => [...prev, now])
      setTimeout(() => {
        setFlourish(prev => prev.filter(t => t !== now))
      }, 750)
    }
  }

  return (
    <div className="relative inline-block">
      {flourish.map(id => (
        <span
          key={id}
          className="reaction-flourish text-xs"
          style={
            {
              '--drift-x': `${(Math.random() - 0.5) * 32}px`,
              '--rot': `${(Math.random() - 0.5) * 24}deg`,
            } as React.CSSProperties
          }
        >
          {emoji}
        </span>
      ))}
      <button
        onClick={handleClick}
        title={title}
        className="btn-press inline-flex items-center gap-1.5 border-2 border-black rounded-full px-2.5 py-1 text-xs font-bold text-[#1C1A18] cursor-pointer transition-all hover:bg-neutral-50"
        style={{
          backgroundColor: active ? color : '#FFFFFF',
          boxShadow: '2px 2px 0px 0px #000',
        }}
      >
        <span className={popped ? 'sparkle' : ''}>{children}</span>
      </button>
    </div>
  )
}

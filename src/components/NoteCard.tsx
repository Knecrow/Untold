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

  const textLength = note.text?.length ?? 0
  const isBentoWide = textLength > 120 || (index % 5 === 1 && textLength > 75)

  return (
    <div className={`bento-item ${isBentoWide ? 'sm:col-span-2' : 'col-span-1'} ${isNew ? 'pin-drop' : ''}`}>
      <div
        className="note-card h-full flex flex-col justify-between border-2 border-black rounded-2xl p-6 shadow-neo select-none"
        style={{
          backgroundColor: cat.color || '#FFFDF5',
        }}
      >
        <div>
          {/* Top bar — quiet, clean & timeless (no dates or timestamps) */}
          <div className="flex items-center justify-between mb-4 text-xs select-none">
            <div className="inline-flex items-center gap-1.5">
              <span className="text-xs font-bold text-[#2D2A26]/70">{cat.emoji}</span>
              <span className="font-semibold text-[#2D2A26]/80">{cat.label}</span>
            </div>
            {/* Discreet Flag / Report button */}
            <button
              onClick={handleFlag}
              title="Flag as inappropriate"
              className="p-1 text-[#2D2A26]/30 hover:text-rose-600 transition-colors cursor-pointer rounded-full"
              aria-label="Flag note"
            >
              <Flag size={12} />
            </button>
          </div>

          {/* Body text — the hero of the card */}
          <p
            className={`font-medium leading-[1.65] text-[#1C1A18] mb-6 break-words tracking-[-0.01em] ${
              isBentoWide ? 'text-[1.125rem] sm:text-[1.2rem]' : 'text-[1.05rem] sm:text-[1.1rem]'
            }`}
          >
            {note.text}
          </p>
        </div>

        {/* Action bar — low-profile, clean counters */}
        <div className="flex items-center gap-2 flex-wrap pt-3 border-t border-black/10 mt-auto">
          {/* Star with floating star */}
          <ActionButton
            active={myInteract.starred}
            color="#FFD13B"
            emoji="★"
            onClick={() => onStar(note.id)}
            title="Star this note"
          >
            <span className="text-[13px] leading-none">★</span>
            <span>{note.stars}</span>
          </ActionButton>

          {/* Heard with floating heart */}
          <ActionButton
            active={myInteract.heard}
            color="#70C7FA"
            emoji="♥"
            onClick={() => onHeard(note.id)}
            title="I heard this"
          >
            <span className="text-[13px] leading-none">♥</span>
            <span>{note.heard}</span>
          </ActionButton>

          {/* Hug with floating comfort spark */}
          <ActionButton
            active={myInteract.hugged}
            color="#FFAEC0"
            emoji="✦"
            onClick={() => onHug(note.id)}
            title="Send comfort"
          >
            <span className="text-[13px] leading-none">✦</span>
            <span>{note.hug}</span>
          </ActionButton>

          {/* Export as Image Card & Share */}
          <div className="relative ml-auto flex items-center gap-1.5">
            <button
              onClick={handleExport}
              disabled={exporting}
              title="Save as Image (Share to Instagram/Twitter)"
              className="btn-press inline-flex items-center gap-1 border border-black/15 rounded-full px-2.5 py-1 text-xs font-semibold text-[#2D2A26]/70 cursor-pointer hover:text-black hover:border-black/30 hover:bg-black/5 transition-all"
              style={{ backgroundColor: 'rgba(255, 255, 255, 0.65)' }}
            >
              <Camera size={11} />
              <span>{exporting ? 'Saving…' : 'Card'}</span>
            </button>

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
              <div className="tooltip-animate absolute bottom-full right-0 mb-2 bg-[#1A1A1A] text-white text-xs font-semibold px-2.5 py-1 rounded-full whitespace-nowrap pointer-events-none">
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
        className="btn-press inline-flex items-center gap-1.5 border border-black/15 rounded-full px-2.5 py-1 text-xs font-semibold text-[#2D2A26] cursor-pointer transition-all hover:border-black/30 hover:bg-black/5"
        style={{
          backgroundColor: active ? color : 'rgba(255, 255, 255, 0.65)',
          borderColor: active ? '#000000' : undefined,
          boxShadow: active ? '1px 1px 0px 0px #000' : 'none',
        }}
      >
        <span className={popped ? 'sparkle' : ''}>{children}</span>
      </button>
    </div>
  )
}

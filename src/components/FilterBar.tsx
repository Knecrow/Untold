'use client'

import { CATEGORIES } from '@/constants'

const ALL_BTN = { id: 'all', label: 'All', emoji: '✦', color: '#18181B', accentColor: '#FFD43B' }

interface Props {
  active: string
  onChange: (id: string) => void
}

export default function FilterBar({ active, onChange }: Props) {
  const buttons = [ALL_BTN, ...CATEGORIES]

  return (
    <div className="filter-scroll overflow-x-auto py-2">
      <div className="flex gap-2.5 min-w-max px-1">
        {buttons.map(cat => {
          const isAll = cat.id === 'all'
          const isActive = active === cat.id

          // All button styling
          if (isAll) {
            return (
              <button
                key={cat.id}
                id={`filter-${cat.id}`}
                onClick={() => onChange(cat.id)}
                className="btn-press inline-flex items-center gap-1.5 border-2 border-black rounded-full px-4 py-1.5 text-xs sm:text-sm font-extrabold whitespace-nowrap cursor-pointer transition-all"
                style={{
                  backgroundColor: isActive ? '#18181B' : '#FFFFFF',
                  color: isActive ? '#FFFFFF' : '#18181B',
                  boxShadow: isActive ? '3px 3px 0px 0px #F59E0B' : '2px 2px 0px 0px #000',
                  transform: isActive ? 'translate(-1px, -1px)' : 'none',
                }}
              >
                <span style={{ color: isActive ? '#FFD43B' : '#F59E0B' }}>✦</span>
                <span>All</span>
              </button>
            )
          }

          // Category pills: always colorful with tactile neo-brutalist shadows
          return (
            <button
              key={cat.id}
              id={`filter-${cat.id}`}
              onClick={() => onChange(cat.id)}
              className="btn-press inline-flex items-center gap-1.5 border-2 border-black rounded-full px-3.5 py-1.5 text-xs sm:text-sm font-bold whitespace-nowrap cursor-pointer transition-all hover:-translate-y-0.5"
              style={{
                backgroundColor: cat.color,
                color: '#1C1A18',
                boxShadow: isActive
                  ? `3px 3px 0px 0px #000, 5px 5px 0px 0px ${cat.accentColor || '#000'}`
                  : '2px 2px 0px 0px #000',
                transform: isActive ? 'translate(-1px, -1px)' : 'none',
              }}
            >
              <span className="font-extrabold" style={{ color: cat.accentColor || '#1C1A18' }}>
                {cat.emoji}
              </span>
              <span>{cat.label}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}

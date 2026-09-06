'use client'

import { CATEGORIES } from '@/constants'

const ALL_BTN = { id: 'all', label: 'All', emoji: '✨', color: '#1A1A1A' }

interface Props {
  active: string
  onChange: (id: string) => void
}

export default function FilterBar({ active, onChange }: Props) {
  const buttons = [ALL_BTN, ...CATEGORIES]

  return (
    <div className="filter-scroll overflow-x-auto py-2">
      <div className="flex gap-2 min-w-max px-1">
        {buttons.map(cat => {
          const isActive = active === cat.id
          return (
            <button
              key={cat.id}
              id={`filter-${cat.id}`}
              onClick={() => onChange(cat.id)}
              className="btn-press inline-flex items-center gap-1.5 border-2 border-black rounded-full px-4 py-1.5 text-sm font-bold whitespace-nowrap cursor-pointer transition-all"
              style={{
                backgroundColor: isActive
                  ? (cat.id === 'all' ? '#1A1A1A' : cat.color)
                  : 'white',
                color: isActive && cat.id === 'all' ? 'white' : '#1A1A1A',
                boxShadow: isActive ? '2px 2px 0px 0px #000' : 'none',
              }}
            >
              {cat.emoji && <span>{cat.emoji}</span>}
              <span>{cat.label}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}

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

          // All button
          if (isAll) {
            return (
              <button
                key={cat.id}
                id={`filter-${cat.id}`}
                onClick={() => onChange(cat.id)}
                className={`btn-press inline-flex items-center gap-1.5 rounded-full px-4 py-1.5 text-xs sm:text-sm font-extrabold whitespace-nowrap cursor-pointer transition-all ${
                  isActive
                    ? 'bg-[#1A1714] dark:bg-white/90 text-white dark:text-[#1A1714] border-2 border-black/80 dark:border-white/80 shadow-[3px_3px_0px_0px_#F59E0B] -translate-x-[1px] -translate-y-[1px]'
                    : 'glass-btn text-[#1A1714] dark:text-white/90'
                }`}
              >
                <span className={isActive ? 'text-[#FFD43B]' : 'text-[#F59E0B]'}>✦</span>
                <span>All</span>
              </button>
            )
          }

          // Category pills
          return (
            <button
              key={cat.id}
              id={`filter-${cat.id}`}
              onClick={() => onChange(cat.id)}
              className="btn-press glass-btn inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs sm:text-sm font-bold whitespace-nowrap cursor-pointer transition-all"
              style={{
                background: isActive
                  ? `${cat.color}E8`
                  : undefined,
                boxShadow: isActive
                  ? `3px 3px 0px 0px rgba(0,0,0,0.72), 5px 5px 0px 0px ${cat.accentColor || '#000'}`
                  : undefined,
                transform: isActive ? 'translate(-1px, -1px)' : undefined,
              }}
            >
              <span className="font-extrabold" style={{ color: cat.accentColor || '#1A1714' }}>
                {cat.emoji}
              </span>
              <span className="text-[#1A1714] dark:text-white/85">{cat.label}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}

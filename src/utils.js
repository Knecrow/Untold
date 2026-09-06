// ─── Relative time ───────────────────────────────────────────────────────────
export function relativeTime(ts) {
  const diff = Date.now() - ts
  const s = Math.floor(diff / 1000)
  const m = Math.floor(s / 60)
  const h = Math.floor(m / 60)
  const d = Math.floor(h / 24)

  if (s < 60) return 'just now'
  if (m < 60) return `${m}m ago`
  if (h < 24) return `${h}h ago`
  if (d === 1) return 'yesterday'
  return `${d}d ago`
}

// ─── Resonance score ─────────────────────────────────────────────────────────
export function resonanceScore(note) {
  return (note.stars ?? 0) * 2 + (note.heard ?? 0) + (note.hug ?? 0)
}

// ─── Filter notes by time range ──────────────────────────────────────────────
export function filterByRange(notes, range) {
  const now = Date.now()
  const DAY = 1000 * 60 * 60 * 24
  if (range === 'today')  return notes.filter(n => now - n.createdAt < DAY)
  if (range === 'week')   return notes.filter(n => now - n.createdAt < DAY * 7)
  return notes // all-time
}

// ─── Generate unique ID ──────────────────────────────────────────────────────
export function uid() {
  return `note-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`
}

// ─── Tilt class by index ─────────────────────────────────────────────────────
import { TILT_CLASSES } from '@/constants'
export function tiltClass(index) {
  return TILT_CLASSES[index % TILT_CLASSES.length]
}

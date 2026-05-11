// ============================================================
// ENGINE: MEMORY — Decay, Engraving, Persistence
// "Ký ức không biến mất. Chỉ phân rã mềm."
// ============================================================

import type { Engraving, MemoryTrail, Poem } from '@/types/poem'
import { computeDecayedStrength, accumulateUserField } from '@/engine/gravity'

const TRAIL_KEY = 'hl_memory_trail'
const ENGRAVINGS_KEY = 'hl_engravings'
const SESSION_KEY = 'hl_session_id'

function getSessionId(): string {
  if (typeof window === 'undefined') return 'ssr'
  let id = sessionStorage.getItem(SESSION_KEY)
  if (!id) {
    id = `s_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`
    sessionStorage.setItem(SESSION_KEY, id)
  }
  return id
}

/**
 * Load memory trail from localStorage
 */
export function loadMemoryTrail(): MemoryTrail {
  if (typeof window === 'undefined') return emptyTrail()
  try {
    const raw = localStorage.getItem(TRAIL_KEY)
    if (!raw) return emptyTrail()
    return JSON.parse(raw) as MemoryTrail
  } catch {
    return emptyTrail()
  }
}

function emptyTrail(): MemoryTrail {
  return {
    sessionId: getSessionId(),
    visitedPoems: [],
    engravings: {},
    dominantMotif: null,
    lastVisitAt: Date.now(),
  }
}

/**
 * Record a poem visit — updates trail & detects dominant motif
 */
export function recordVisit(trail: MemoryTrail, poem: Poem, allPoems: Poem[]): MemoryTrail {
  const visited = [...trail.visitedPoems]
  if (!visited.includes(poem.id)) visited.push(poem.id)
  // Keep last 30
  const trimmed = visited.slice(-30)

  const visitedPoems = trimmed
    .map(id => allPoems.find(p => p.id === id))
    .filter(Boolean) as Poem[]

  const userField = accumulateUserField(visitedPoems)

  // Detect dominant motif from accumulated field
  const keys = Object.entries(userField) as [keyof typeof userField, number][]
  keys.sort((a, b) => b[1] - a[1])
  const topKey = keys[0][0]

  const motifMap: Record<string, MemoryTrail['dominantMotif']> = {
    longing: 'longing', entropy: 'entropy', eros: 'eros',
    warmth: 'ecstasy', ambiguity: 'distance',
    transcendence: 'memory', isolation: 'longing', memoryPressure: 'memory'
  }

  const updated: MemoryTrail = {
    ...trail,
    visitedPoems: trimmed,
    dominantMotif: motifMap[topKey] ?? null,
    lastVisitAt: Date.now(),
  }

  if (typeof window !== 'undefined') {
    localStorage.setItem(TRAIL_KEY, JSON.stringify(updated))
  }

  return updated
}

/**
 * Load all engravings, with decay applied
 */
export function loadEngravings(): Record<string, Engraving> {
  if (typeof window === 'undefined') return {}
  try {
    const raw = localStorage.getItem(ENGRAVINGS_KEY)
    if (!raw) return {}
    const stored = JSON.parse(raw) as Record<string, Engraving>

    // Apply decay at read time
    const result: Record<string, Engraving> = {}
    for (const [poemId, eng] of Object.entries(stored)) {
      const decayed = computeDecayedStrength(eng.strength, eng.timestamp)
      result[poemId] = { ...eng, decayedStrength: decayed }
    }
    return result
  } catch {
    return {}
  }
}

/**
 * Add an engraving — the ritual interaction
 * strength accumulates (capped), but decays over time
 */
export function addEngraving(poemId: string, amount: number = 0.1): void {
  if (typeof window === 'undefined') return
  const stored = loadEngravings()
  const existing = stored[poemId]

  const newStrength = Math.min(1.0, (existing?.strength ?? 0) + amount)
  const engraving: Engraving = {
    poemId,
    strength: newStrength,
    timestamp: Date.now(),
    decayedStrength: newStrength,
  }

  stored[poemId] = engraving
  localStorage.setItem(ENGRAVINGS_KEY, JSON.stringify(stored))
}

/**
 * Get decayed strength for a single poem — used by the field renderer
 */
export function getEngravingStrength(poemId: string): number {
  const engravings = loadEngravings()
  return engravings[poemId]?.decayedStrength ?? 0
}

/**
 * Determine visual state from engraving density + global resonance
 */
export function computeResonanceState(
  localStrength: number,
  globalMemoryDensity: number
): 'dormant' | 'warm' | 'burning' | 'supernova' | 'ghost' {
  const combined = localStrength * 0.3 + (globalMemoryDensity / 1000) * 0.7

  if (combined <= 0.02) return 'dormant'
  if (combined <= 0.15) return 'warm'
  if (combined <= 0.45) return 'burning'
  if (combined <= 0.8)  return 'supernova'
  return 'ghost' // maximum saturation — past-supernova, transcendent state
}

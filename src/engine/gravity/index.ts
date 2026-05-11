// ============================================================
// ENGINE: GRAVITY — Emotional Field Physics
// Phase A: Field topology. Build this BEFORE any visuals.
// ============================================================

import type { Poem, EmotionalField, DominantField } from '@/types/poem'

// Color temperature map — each dominant field has a color signature
export const FIELD_COLORS: Record<DominantField, { hex: string; glow: string }> = {
  longing:      { hex: '#1a3a5c', glow: '#4fc3f7' }, // deep blue
  ecstasy:      { hex: '#6b0f1a', glow: '#e53935' }, // crimson
  memory:       { hex: '#5c4a00', glow: '#ffd54f' }, // faded gold
  distance:     { hex: '#2d1b4e', glow: '#ce93d8' }, // pale violet
  eros:         { hex: '#6d3000', glow: '#ffb300' }, // warm amber
  entropy:      { hex: '#1c1c1c', glow: '#b0bec5' }, // silver ash
}

/**
 * Compute the dominant emotional field from an EmotionalField vector.
 * Maps the highest-magnitude dimension to a DominantField type.
 */
export function computeDominantField(ef: EmotionalField): DominantField {
  const mapping: Array<[keyof EmotionalField, DominantField]> = [
    ['longing',       'longing'],
    ['entropy',       'entropy'],
    ['eros',          'eros'],
    ['warmth',        'ecstasy'],
    ['ambiguity',     'distance'],
    ['transcendence', 'memory'],
    ['isolation',     'longing'],
    ['memoryPressure','memory'],
  ]

  let max = -Infinity
  let dominant: DominantField = 'memory'

  for (const [key, field] of mapping) {
    if (ef[key] > max) {
      max = ef[key]
      dominant = field
    }
  }

  return dominant
}

/**
 * Compute gravity mass from emotional field.
 * High-intensity fields have more gravitational pull.
 */
export function computeGravityMass(ef: EmotionalField): number {
  const intensity = Math.max(
    ef.longing,
    ef.eros,
    ef.entropy,
    ef.warmth,
    ef.transcendence
  )
  // Range: 0.6 (dormant) to 2.8 (supernova mass)
  return 0.6 + intensity * 2.2
}

/**
 * Compute visual radius of a poem node from its gravity mass + resonance density.
 */
export function computeNodeRadius(poem: Poem): number {
  const base = 4 + poem.gravityMass * 4
  const resonanceBoost = Math.min(poem.memoryDensity / 200, 1.5)
  return base + resonanceBoost
}

/**
 * Compute attraction force between two poems.
 * Shared emotional dimensions create gravitational coupling.
 */
export function computeFieldCoupling(a: EmotionalField, b: EmotionalField): number {
  // Dot product of the two emotional vectors
  const keys: (keyof EmotionalField)[] = [
    'longing', 'entropy', 'eros', 'warmth',
    'ambiguity', 'transcendence', 'isolation', 'memoryPressure'
  ]

  let dot = 0
  let magA = 0
  let magB = 0

  for (const k of keys) {
    dot  += a[k] * b[k]
    magA += a[k] ** 2
    magB += b[k] ** 2
  }

  if (magA === 0 || magB === 0) return 0
  return dot / (Math.sqrt(magA) * Math.sqrt(magB)) // cosine similarity [0, 1]
}

/**
 * Engraving decay — logarithmic, like real memory.
 * Decays fast initially, then lingers for a very long time.
 *
 * f(t) = initialStrength / (1 + k * ln(1 + t/halflife))
 *
 * where t = time elapsed in hours
 */
export function computeDecayedStrength(
  initialStrength: number,
  timestampMs: number,
  decayRate: number = 0.05
): number {
  const now = Date.now()
  const hoursElapsed = (now - timestampMs) / (1000 * 60 * 60)
  const halflife = 72 // hours — 3 days

  if (hoursElapsed <= 0) return initialStrength

  const decayed = initialStrength / (1 + decayRate * Math.log(1 + hoursElapsed / halflife))
  return Math.max(0, decayed)
}

/**
 * Perturbation: Emotional Slingshot.
 * If a user has been drifting in a single field too long,
 * return a score for "nearby contradiction" poems.
 *
 * NOT a recommendation engine. A trajectory bender.
 */
export function computePerturbationScore(
  userField: EmotionalField,
  candidateField: EmotionalField
): number {
  // We want OPPOSITION, not similarity
  // High score = candidate is emotionally orthogonal to user's current state
  const coupling = computeFieldCoupling(userField, candidateField)
  const opposition = 1 - coupling

  // Boost if candidate has high transcendence (pulls user out of gravity well)
  const transcendenceBoost = candidateField.transcendence * 0.3

  return opposition + transcendenceBoost
}

/**
 * Accumulate emotional field from a memory trail.
 * As user visits poems, their "current field" is a weighted average.
 */
export function accumulateUserField(visitedPoems: Poem[]): EmotionalField {
  if (visitedPoems.length === 0) {
    return {
      longing: 0, entropy: 0, eros: 0, warmth: 0,
      ambiguity: 0, transcendence: 0, isolation: 0, memoryPressure: 0
    }
  }

  const keys: (keyof EmotionalField)[] = [
    'longing', 'entropy', 'eros', 'warmth',
    'ambiguity', 'transcendence', 'isolation', 'memoryPressure'
  ]

  const accumulated: EmotionalField = {
    longing: 0, entropy: 0, eros: 0, warmth: 0,
    ambiguity: 0, transcendence: 0, isolation: 0, memoryPressure: 0
  }

  // Recency-weighted: more recent visits weigh more
  const n = visitedPoems.length
  let totalWeight = 0

  for (let i = 0; i < n; i++) {
    const weight = Math.exp(i - n + 1) // exponential recency weighting
    totalWeight += weight
    for (const k of keys) {
      accumulated[k] += visitedPoems[i].emotionalField[k] * weight
    }
  }

  for (const k of keys) {
    accumulated[k] /= totalWeight
  }

  return accumulated
}

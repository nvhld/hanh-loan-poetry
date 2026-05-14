// ============================================================
// PR 3 PHYSICS CONSTANTS
// Keep emotional-field behavior explicit and auditable.
// ============================================================

import type { DominantField } from '@/types/poem'

export const PHYSICS_FIELDS: DominantField[] = [
  'longing',
  'ecstasy',
  'memory',
  'distance',
  'eros',
  'entropy',
]

export const FIELD_PHYSICS = {
  initialSpread: 0.6,
  linkMinStrength: 0.25,
  linkStrengthScale: 0.15,
  linkDistanceMin: 60,
  linkDistanceRange: 140,
  chargeBase: 80,
  chargeEngravingScale: 120,
  centerStrength: 0.04,
  collisionPadding: 20,
  collisionStrength: 0.7,
  clusterStrength: 0.06,
  clusterRadiusX: 0.32,
  clusterRadiusY: 0.28,
  clusterMemoryAlpha: 0.82,
  clusterMaxVelocity: 1.6,
  alphaDecay: 0.015,
  velocityDecay: 0.35,
  restartAlpha: 0.3,
  engravingAlpha: 0.1,
  perturbAlpha: 0.15,
  resizeAlpha: 0.18,
  minViewportWidth: 320,
  minViewportHeight: 320,
} as const

export const DREAM_DEBUG_PHYSICS = {
  centerMarkerRadius: 4,
  attractionRadius: 86,
  vectorScale: 0.18,
  maxVectors: 48,
  panelX: 12,
  panelY: 18,
} as const

export const DREAM_RENDER_PHYSICS = {
  afterimageDecay: 0.94,
  canvasPersistenceAlpha: 0.82,
  hoverRevealPadding: 8,
  hoverAfterimageAlpha: 0.7,
  perturbImpulse: 8,
} as const

export const STATIC_TOPOLOGY_PHYSICS = {
  springStiffness: 120,
  springDamping: 12,
  silenceOnsetMs: 8000,
  silenceRiseS: 6,
  breathSpeed: 0.4,
  defaultJitter: 8,
  layoutPadding: 50,
  resizeMemoryAlpha: 0.86,
  debugAttractionRadius: 90,
} as const

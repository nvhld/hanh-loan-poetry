/**
 * Scheduler Shadow Mode log schema only.
 *
 * Shadow records are ephemeral black-box observations. This file defines
 * diagnostic shapes only; it contains no runtime logging, persistence,
 * suppression, queueing, telemetry, or orchestration logic.
 */

import type { AtmosphereEventType, AtmosphereSource } from './atmosphere'

export type ShadowDecision =
  | 'WOULD_ALLOW'
  | 'WOULD_DELAY'
  | 'WOULD_SUPPRESS'
  | 'WOULD_YIELD'

export type CollisionClass =
  | 'benign'
  | 'dangerous'
  | 'silent-suppression'

export type RouteSurface =
  | 'poem'
  | 'archive'
  | 'lab'
  | 'threshold'
  | 'unknown'

export type ShadowCollision = {
  class: CollisionClass
  with: AtmosphereSource
}

export type ShadowEventRecord = {
  source: AtmosphereSource
  eventType: AtmosphereEventType
  attemptedAt: number
  decision: ShadowDecision
  activeOwner: AtmosphereSource | null
  silenceWindowActive: boolean
  collision?: ShadowCollision
  routeSurface?: RouteSurface
}

export type ShadowRingBufferPolicy = {
  defaultCap: 80
  debugCap: 200
  persistence: 'memory-only'
  consoleDump: 'explicit-debug-only'
}

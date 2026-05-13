/**
 * Atmospheric scheduler API contract only.
 *
 * This file defines the minimal shared language for foreground ownership.
 * It intentionally contains no runtime logic, timers, queues, rendering,
 * analytics, poem interpretation, or topology physics imports.
 */

export type AtmosphereSource =
  | 'whisper'
  | 'instrument'
  | 'pending-modal'
  | 'transit-ghost'
  | 'inheritance'
  | 'threshold'
  | 'archive'
  | 'lens'
  | 'cosmic-ray'
  | 'system-cleanup'

export type AtmosphereEventType =
  | 'modal'
  | 'residue'
  | 'route-fade'
  | 'threshold'
  | 'transit'
  | 'inheritance-pressure'
  | 'micro-atmospheric'
  | 'cleanup'

export type AtmospherePriority =
  | 'reader-action'
  | 'safety-cleanup'
  | 'modal-lifecycle'
  | 'route-transition'
  | 'residue'
  | 'transit'
  | 'inheritance'
  | 'cosmetic'

export type ForegroundReleaseMode = 'fade' | 'dismiss' | 'route' | 'timeout'

export type ForegroundIntent = {
  source: AtmosphereSource
  type: AtmosphereEventType
  priority: AtmospherePriority
  estimatedDurationMs: number
  requestedAt: number
}

export type ForegroundOwnerSnapshot = {
  owner: AtmosphereSource
  startedAt: number
  expectedReleaseAt: number
  releaseMode: ForegroundReleaseMode
} | null

export type SilenceWindowQuery = {
  source: AtmosphereSource
  now: number
}

export type SurfaceDecision =
  | { status: 'allow' }
  | { status: 'delay'; delayMs: number }
  | { status: 'suppress' }

export type AtmosphericEventRegistration = {
  source: AtmosphereSource
  type: AtmosphereEventType
  occurredAt: number
}

export type FailOpenDecision = {
  status: 'silence'
}

export type AtmosphereSchedulerContract = {
  requestForeground(intent: ForegroundIntent): SurfaceDecision
  getForegroundOwner(): ForegroundOwnerSnapshot
  canSurface(query: SilenceWindowQuery): SurfaceDecision
  registerAtmosphericEvent(event: AtmosphericEventRegistration): void
  failOpen(): FailOpenDecision
}

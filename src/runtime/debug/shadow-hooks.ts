/**
 * Shadow hook shapes only.
 *
 * These types describe possible observation insertion points. This file does
 * not emit logs, hold a ring buffer, inspect runtime state, arbitrate events,
 * or make scheduling decisions.
 */

import type { AtmosphereSource } from '../contracts/atmosphere'
import type { RouteSurface, ShadowEventRecord } from '../contracts/shadow-events'

export type ShadowHookEventName =
  | 'dissolve-start'
  | 'direct-open'
  | 'reveal-earned'
  | 'modal-open-attempt'
  | 'residue-start'
  | 'scan-start'
  | 'reading-start'
  | 'dismiss-start'
  | 'eligibility-check'
  | 'pressure-start'
  | 'title-start'
  | 'transit-fade'
  | 'fullscreen-fade-start'
  | 'route-fade'
  | 'cluster-hover'
  | 'resonance-ready'
  | 'pressure-read'

export type ShadowHookPoint = {
  source: AtmosphereSource
  eventName: ShadowHookEventName
  routeSurface: RouteSurface
}

export type ShadowDebugGate = {
  queryParam: 'debug=shadow'
  windowFlag: '__HL_DEBUG_SHADOW'
}

export type ShadowRingBufferLifecycle = {
  init: 'explicit-debug-only'
  append: 'poor-record-only'
  overflow: 'drop-oldest-silently'
  clear: 'threshold-or-route-boundary'
  dump: 'console-explicit-debug-only'
}

export type EmitShadowEvent = (event: ShadowHookPoint) => ShadowEventRecord | null

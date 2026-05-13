/**
 * Instrument Shadow Mode shapes only.
 *
 * This file scopes the first observation-only Shadow Mode pass to Instrument
 * Modal phase boundaries. It contains no logging, ring buffer, scheduler,
 * ownership, suppression, delay, storage, or runtime hooks.
 */

import type { AtmosphereSource } from '../contracts/atmosphere'
import type {
  CollisionClass,
  RouteSurface,
  ShadowDecision,
} from '../contracts/shadow-events'

export type InstrumentShadowPhase =
  | 'modal-open-attempt'
  | 'residue-start'
  | 'scan-start'
  | 'reading-start'
  | 'dismiss-start'

export type InstrumentShadowObservation = {
  source: 'instrument'
  phase: InstrumentShadowPhase
  attemptedAt: number
  activeOwner: AtmosphereSource | null
  decision: ShadowDecision
  silenceWindowActive: boolean
  collisionClass?: CollisionClass
  routeSurface?: RouteSurface
}

export type InstrumentShadowDensityExpectation = {
  normalReading: '0-5 events/min'
  instrumentLinger: '5-12 events/min'
  repeatedAnchorExploration: '12-25 events/min'
  spamClicking: 'capped-and-dropped'
}

export type InstrumentShadowForbiddenPayload =
  | 'whisper-text'
  | 'mri-output'
  | 'motif-names'
  | 'poem-text'
  | 'entropy-values'
  | 'emotional-field-values'
  | 'familiarity-depth'
  | 'local-memory-contents'
  | 'false-recognition-seed'
  | 'scan-phrase-contents'
  | 'section-text'
  | 'score'

export type EmitInstrumentShadow = (
  observation: InstrumentShadowObservation,
) => InstrumentShadowObservation | null

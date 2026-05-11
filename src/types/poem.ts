// ============================================================
// ROMANTIC COSMOLOGY — Core Type Definitions
// "Không ai yêu mà không làm cong ánh sáng quanh người khác."
// ============================================================

/**
 * Emotional Field — the gravity vectors of a poem.
 * Human-readable. Curatable. Poetic.
 * A senior engineer must be able to *read* what they're building.
 */
export interface EmotionalField {
  longing: number       // 0–1 — khao khát, nhớ nhung, khoảng cách
  entropy: number       // 0–1 — thời gian, mất mát, phai tàn
  eros: number          // 0–1 — sinh lực, dục tính được thăng hoa
  warmth: number        // 0–1 — sự gần gũi, hơi ấm, chạm
  ambiguity: number     // 0–1 — mơ hồ, hai chiều, bất định
  transcendence: number // 0–1 — siêu việt, vũ trụ hóa, vĩnh hằng
  isolation: number     // 0–1 — cô đơn, tách biệt, im lặng
  memoryPressure: number // 0–1 — áp suất ký ức, hoài niệm dày đặc
}

/**
 * Dominant emotional field type — drives color temperature & clustering
 */
export type DominantField =
  | 'longing'      // deep blue   — khao khát, khoảng cách
  | 'ecstasy'      // crimson     — cực điểm cảm xúc, đắm say
  | 'memory'       // faded gold  — ký ức, chiêm bao
  | 'distance'     // pale violet — không gian, địa lý, phi trường
  | 'eros'         // warm amber  — sinh lực, nhục cảm được thăng hoa
  | 'entropy'      // silver ash  — thời gian, hủy diệt, phai tàn

/**
 * Resonance state — replaces "Like count".
 * Represents the living intensity of a poem in collective consciousness.
 */
export type ResonanceState =
  | 'dormant'   // Ngủ yên — ít người chạm tới
  | 'warm'      // Ấm — có sự cộng hưởng nhẹ
  | 'burning'   // Rực cháy — cường độ cao
  | 'supernova' // Siêu tân tinh — đỉnh điểm cộng hưởng tập thể
  | 'ghost'     // Sao ma — phai nhưng dư ảnh cực mạnh

/**
 * Critic quote — orbiting satellites around the Monolith
 */
export interface CriticEcho {
  id: string
  criticName: string    // "Nguyễn Quang Thiều"
  role: string          // "Chủ tịch Hội Nhà văn Việt Nam"
  quote: string         // ≤ 2 câu
  orbitalRadius: number // distance from center (px)
  orbitalSpeed: number  // rad/s
  orbitalPhase: number  // initial angle offset (rad)
}

/**
 * Core Poem entity
 */
export interface Poem {
  id: string         // "2022-35-the-gioi-8-ty-nguoi"
  slug: string       // "the-gioi-8-ty-nguoi"
  title: string      // "Thế giới 8 tỷ người"
  year: number       // 2022
  date: string       // "2022-04-30" (ISO)
  sequence: number   // 35

  // Visual assets
  webpFile: string   // path to /poems/webp/*.webp
  pdfFile: string    // original filename

  // Text content
  excerpt: string    // 2–3 opening lines for hover preview
  textContent: string // full poem text (for SEO + search)

  // Emotional system
  emotionalField: EmotionalField
  dominantField: DominantField
  gravityMass: number     // 0.5–3.0 — affects visual size & gravitational pull

  // Visual temperature (derived from dominantField at runtime)
  colorHex: string        // e.g. "#1a3a5c"
  glowHex: string         // bloom/glow color

  // Resonance system (persisted in Redis)
  resonanceState: ResonanceState
  memoryDensity: number   // 0–1000 — accumulated engravings
  decayRate: number       // 0.01–0.1 — how fast it cools

  // Spatial layout (pre-computed, updated by perturbation)
  position: { x: number; y: number }

  // Critics
  critics: CriticEcho[]

  // Tags (for filtering UI)
  tags: {
    space: string[]   // 'ha_tinh' | 'phi_truong' | 'michigan' | 'boston' | ...
    season: string[]  // 'mua_xuan' | 'mua_thu' | ...
    motif: string[]   // 'thien_van' | 'khoang_cach' | 'ky_uc' | ...
  }
}

/**
 * Gravitational edge between two poems
 */
export interface GravityEdge {
  source: string      // poem id
  target: string      // poem id
  strength: number    // 0.1–1.0 (Jaccard similarity of tags)
  sharedTags: string[]
  glowColor: string
}

/**
 * User's memory trail — the path through the field
 */
export interface MemoryTrail {
  sessionId: string
  visitedPoems: string[]       // poem ids in order
  engravings: Record<string, number> // poemId → engraving strength
  dominantMotif: DominantField | null // detected from trail
  lastVisitAt: number          // timestamp
}

/**
 * Engraving record — a user's mark on a poem (persisted in Redis)
 */
export interface Engraving {
  poemId: string
  strength: number     // 0–1, decays logarithmically over time
  timestamp: number    // when engraved
  decayedStrength: number // computed at read time
}

# ⚡ LIVE STATE: ARCHITECTURE FREEZE

> **LUẬT CHO AGENT:** Luôn đọc file này đầu tiên. Cập nhật trước khi kết thúc. Giữ dưới 80 dòng.
**🎯 Mục tiêu hiện tại:** PR 4 locked with runtime lineage + snapshot guards; PR 3 smoke validation still pending before physics lock.

---

## 🚀 KẾ HOẠCH 4 PR (MICRO-BATCHING) — FINAL ORDER

> **Lý do thứ tự:** Topology physics phải được tune trên dữ liệu ổn định. Không calibrate cluster forces trên data bị lỗi.

**✅ PR 1: FREEZE PHENOMENOLOGY & GUARDRAILS (LOCKED)**
- [x] `PHENOMENOLOGY_BASELINE.md` — timing, drift, sequences, Motion Ceilings.
- [x] `scripts/validate_hygiene.py` — JSON parse, `--strict` mode, orphan refs, duplicate slugs, schema mismatch, asset check, report writer.
- [x] `.github/workflows/validation.yml` — CI runs `--strict`, artifact upload on failure.
- [x] `docs/baselines/video/` — thư mục chứa video baselines.
- *DO NOT REOPEN.*

**✅ PR 2: CANONICAL TEXT INTEGRITY (LOCKED)**
- [x] Sửa bug source text: bỏ `\N`/`<br />` hỏng trong Markdown gốc.
- [x] Freeze canonical schema + docs: `docs/CANONICAL_SCHEMA.md`.
- [x] Freeze canonical IDs/slugs + hashes: `docs/CANONICAL_IDS.md`.
- [x] Freeze retired poems + legacy ID redirects: `docs/RETIRED_POEMS.md`, `data/generated/retired-poems.json`.
- [x] Freeze hash spec (`SHA-256`, normalized UTF-8 `body` only) and canonical lock date.
- [x] Add `validate_hygiene.py --preserve-runtime` guardrails and wire to CI.
- [x] Tạo single build pipeline: `scripts/build_canonical.py`.
- [x] Rebuild artifacts vào `data/generated/`: `poems-raw`, `poems-final`, `poems-inferred`, `poems-curated`, `poem-hashes`.
- [x] Xóa runtime patch kiểu `.replace('\\N', 'N')` khỏi pipeline active.
- [x] `validate_hygiene.py --strict` pass.
- [x] `thoHanhLoan_Cleaned.md` sorted by date and renumbered sequentially after manual removals.
- [x] Canonical artifact count now follows source count dynamically (`99` poems current state), not hardcoded `102`.
**▶️ PR 3: TOPOLOGY PHYSICS FREEZE (Awaiting Lock)**
- [x] Sửa `fieldClusterForce` & lifecycle `computeClusterCenters()` trong `src/engine/field/index.ts`.
- [x] Đảm bảo 6 cluster regions ổn định, resize không sập.
- [x] Thêm debug mode `?debug=physics` / `window.__HL_DEBUG_PHYSICS = true`.
- [x] Freeze debug overlay output format for smoke parsing (`Cluster Integrity`, `Velocity Ceiling`, `NaN State`, `Center Drift`, `Particle Pressure`, `Active Region`).
- [x] Extract physics constants: `src/config/physics.ts`.
- [x] Runtime mirror parity guard migrated into `public/literary/topology.html`.
- [x] Force validation report: `docs/TOPOLOGY_PHYSICS_REPORT.md`.
- [x] Smoke validation protocol scaffolded: `docs/physics_smoke_test.md`, `docs/PHYSICS_PERFORMANCE_SNAPSHOT.md`, `docs/physics-known-limitations.md`.
- [x] Probe output schema frozen: `docs/physics_probe_schema.md` (`pr3-physics-probe-v1`).
- [x] Probe hardened for center trajectory snapshots, center velocity variance, device context, particle floor, and recovery curve.
- [x] Desktop CDP smoke run recorded under `docs/baselines/physics/PR3-SMOKE-2026-05-13-A/`: visible idle 30m, resize/recovery, background-tab resume.
- [ ] PR 3 lock blockers remain: clean hidden/minimized idle, real mobile thermal sanity, 24h cooling, quick rerun, `PR3_LOCK_REPORT.md`, tag.
- *DO NOT LOCK until smoke notes are filled.*
- *Cooling rule: do not edit `src/engine/*`, `public/literary/topology*`, `DreamField*`, or `src/config/physics.ts`.*
**▶️ PARALLEL LITERARY LAYER: INSTRUMENT MODAL v0**
- [x] Branch `literary/instrument-modal-v0` created for literary-only work during PR3 cooling.
- [x] Instrument Modal guardrails: anchor-only MRI signal check, inline parity validation, generator no longer overwrites translator.
- [x] `docs/SYSTEM_BOUNDARIES.md` added to freeze project zones and forbidden crossings.
- [x] Instrument Modal three-state reveal + humility filter + serialized click state added.
- [x] Instrument Modal v0.5 Temporal Residue + `docs/instrument_state_machine.md`: deterministic degradation, incomplete readings, whisper cadence coupling, scan fatigue.
- [x] Quiet Persistence + `docs/residual_memory_protocol.md`: local residual familiarity, 14-day decay, rare false recognition.
- [x] Linguistic Compression Pass + `docs/translator_vocabulary_guard.md`: section word limits, cold fragments, banned cadence.
- [x] Silence Budget + Inheritance/Scheduler protocol docs: active atmosphere density mapped; no tuning yet.
- [x] Scheduler contracts + Shadow insertion design: type-only contracts, no orchestration.
- [x] Instrument-only Shadow implementation: debug-gated memory ring, observe-only.
- [x] Anchor Experience Lock pass started: minimal-mode nested scroll removed; lock notes recorded.
- [x] Partial manual evidence captured for the 3 risky anchors: text-first + scroll pass holds; warm minimal shell styling added after beta users found it too word-online.
- [x] `python3 scripts/validate_hygiene.py --strict --preserve-runtime` pass.
**✅ PR 4: ARCHITECTURE CLEANUP + NEXT BRIDGE (LOCKED)**
- [x] Single runtime source moved to `/public/literary/`; duplicate root/public runtime removed.
- [x] Thin Next shells added: `/archive`, `/lab`, `/poem/[slug]`.
- [x] Legacy HTML entrypoints bridged via redirects: `/archive.html`, `/topology.html`, `/reader.html?id=...`, `/curator.html`.
- [x] Per-poem SEO metadata now resolves from canonical data (`title`, description, canonical, OG/Twitter).
- [x] Runtime loader added: `src/runtime/literary-loader.ts` with manifest-backed injection and no iframe / no React takeover.
- [x] Progressive enhancement flags added for reduced atmospherics on low-end / in-app browsers.
- [x] Runtime manifest added and validated: `public/literary/runtime-manifest.json`.
- [x] Runtime lineage frozen: `runtimeVersion = 2026.05.13-atmospheric-freeze`.
- [x] Phenomenology snapshot frozen + validator compare: `docs/baselines/phenomenology.snapshot.json`.
- [x] Manual override added: `?runtime=minimal`.
- [x] No-takeover guard comments added to runtime bridge layer.
- [x] Missing poem route now redirects softly to `/archive?missing=...`.
- [x] `python3 scripts/build_canonical.py` pass.
- [x] `python3 scripts/validate_hygiene.py --strict --preserve-runtime` pass.
- [x] `npm run build` pass.
- *Phenomenology preserved by architecture-only scope; no physics tuning in PR 4.*

**⏭️ NEXT ACTION:** Stable headless first-paint check confirms Batch 1 direction for `/archive` and key anchors; next step is commit/push/deploy or targeted visual refinement if requested.

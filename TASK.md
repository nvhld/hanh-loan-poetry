# ⚡ LIVE STATE

> **LUẬT CHO AGENT:** Luôn đọc file này đầu tiên. Cập nhật trước khi kết thúc. Giữ dưới 80 dòng.

**🎯 Mục tiêu hiện tại:**
**INSTRUMENT MODAL v0** — MRI extraction + Instrument Layer hoàn thành.

**✅ Vừa hoàn thành (2026-05-11) — MRI FREEZE + INSTRUMENT MODAL v0:**
- `anchor_mri.json` — MRI v1 frozen (12 poems). Schema: `temporalBehavior`, `fieldDynamics`, `motifPhysics`, `structuralWeather`, `silenceProfile`, `driftSignature`, `pressureNotes`, `absenceProfile`, `confidence`, `sourceRefs`.
- `instrument_translator.js` — Template-based MRI→text translator. 6 token maps. No free prose. Outputs `{ drift[], pressure[], absence[] }`.
- `anchor_mri_inline.js` — Pre-compiled inline JS version cho file:// mode.
- `reader.html` — Injected: CSS `#im-overlay` + `#im-box`, `InstrumentModal` IIFE, whisper-note click handler (anchor gated), `<script>` tags.

**Flow đã hoạt động:**
```
Lens → Whisper (earned) → click Whisper → Instrument Modal (900ms fade)
```

**Lab Mode rules được tuân thủ:**
- Chỉ anchor poems trigger modal. Non-anchor: cursor không thay đổi, onclick = null.
- MRI fetch 1 lần (cache). file:// mode dùng `window.ANCHOR_MRI_DATA` từ inline JS.
- No charts, no metrics, no interpretation — 3 sections: `drift`, `pressure`, `absence`.

---

**✅ Hoàn thành trước đó:**
- Phases 1–6: Whisper Gate, Cluster Transit, Archive/Reader Cosmos Engine, Motif Weather.
- 12 Anchor Poems: Critical Lens notes, Curator Overrides, Motif Clusters.

---

**⚠️ BLOCKER / CẦN KIỂM TRA:**
- `structuralDeceleration` / `semanticDeceleration` split phụ thuộc vào các tokens đã được map trong `instrument_translator.js`. Cần chạy thực tế để xác nhận các token trong MRI có match đủ với các map không.
- `confidence` block hiện chưa được dùng trong Modal UI — dành cho Instrument Layer v1 (dim/blur unstable findings).

**⏭️ NEXT:**
- Kiểm tra Modal trên browser (file:// hoặc localhost). Mở 1 anchor poem, bật Lens, đợi Whisper, click.
- Nếu cần: bổ sung token vào MOTION_MAP / DENSITY_MAP cho các giá trị chưa được map.
- Phase 7: MVP Lockdown (archive/topology chỉ 12 bài), Onboarding, Payload Optimization.

# ⚡ LIVE STATE: ARCHITECTURE FREEZE

> **LUẬT CHO AGENT:** Luôn đọc file này đầu tiên. Cập nhật trước khi kết thúc. Giữ dưới 80 dòng.

**🎯 Mục tiêu hiện tại:** Dừng mọi tính năng mới. Triển khai cấu trúc 4-PR siêu nhỏ để giảm nợ kỹ thuật (Tech Debt), đồng nhất kiến trúc Next.js và Freeze Baseline.

---

## 🚀 KẾ HOẠCH 4 PR (MICRO-BATCHING)

**▶️ PR 1: FREEZE PHENOMENOLOGY & GUARDRAILS (Đang làm)**
- [x] Tạo `PHENOMENOLOGY_BASELINE.md` (Ghi nhận fading, drift, sequences).
- [ ] Script validation (`scripts/validate_hygiene.py`): JSON parse, duplicate file detection, missing assets, schema verification.
- [ ] Thêm GitHub Actions (Install, Build, Lint non-blocking, Validation).
- *Strict Rule:* Không sửa logic physics, không move file, không migrate Next.js.

**⏳ PR 2: TOPOLOGY PHYSICS FREEZE**
- [ ] Sửa `fieldClusterForce` & lifecycle `computeClusterCenters()` trong Next.
- [ ] Đảm bảo 6 cluster regions ổn định, resize không sập.
- [ ] Thêm debug mode `?debug=physics` (visualize centers, attraction vectors).

**⏳ PR 3: CANONICAL TEXT INTEGRITY**
- [ ] Sửa triệt để bug escape `\N` tại nguồn (`parse_poems.py`).
- [ ] Freeze canonical schema, IDs, slugs.
- [ ] Xóa các code workaround (như `.replace('\\N')`). Rebuild toàn bộ JSON.

**⏳ PR 4: STATIC RUNTIME CLEANUP + NEXT BRIDGE**
- [ ] Dời HTML tĩnh sang `/public/literary/`. Xóa rác ở root.
- [ ] Tạo Next Bridge Skeleton (`/app/poem/[slug]/page.tsx`).
- [ ] Setup Metadata per poem, sitemap/robots.

---
**⏭️ NEXT ACTION (PR 1 Only):**
Mở terminal, khởi tạo script `scripts/validate_hygiene.py` để check JSON (lỗi escape `\N`, validate schema cơ bản), check mồ côi (ảnh/audio), và setup file `.github/workflows/validation.yml`.

# CLAUDE.md — Hạnh Loan Poetry Constellation
# Workspace: /Users/nguyenvietcuong/Desktop/PrintHL/
# Inherits: GLOBAL-CLAUDE.md (token discipline, session protocol, memory format)

---

## § SESSION START

On loading this file, do exactly this — nothing more:
1. Run state check (bash mount: `/sessions/*/mnt/PrintHL/`):
   ```bash
   python3 -c "
   import json, os, glob
   base = glob.glob('/sessions/*/mnt/PrintHL/hanh-loan-poetry/poems-inferred.json')
   if base:
       d = json.load(open(base[0]))
       print(f'{len(d)} poems | stubs:{sum(1 for x in d if x.get(\"isStub\"))} | curated:{sum(1 for x in d if x.get(\"curated\"))}')
   else: print('poems-inferred.json MISSING — re-run pipeline')
   "
   ```
2. Read MEMOs section at bottom of this file.
3. Output exactly: `⚡ Hạnh Loan [N poems | pipeline: ok/issue]. Next: [from MEMOs or first unchecked task]`

No summaries. No "I'm ready." Go.

---

## § PROJECT IN ONE PARAGRAPH

Emotional topology of Vietnamese poet Nguyễn Thị Hạnh Loan's 102 poems. AI infers emotional vectors; human curator negotiates them. Two tools: `curator.html` (curation UI) and `topology.html` (MRI visualization). Not a poetry reader. A system where ambiguity is fuel, not a bug.

---

## § PIPELINE MAP

```
thoHanhLoan_Cleaned.md          ← source of truth for poem text
  ↓ outputs/parse_cleaned.py
poems-final.json                [102: 97 text + 5 stubs]
  ↓ outputs/infer_emotions.py
poems-inferred.json             [102 × aiSuggestion + corpusDeviation]
  ↓ inline embed
curator_data_inline.js          [~284KB, loaded by both HTML tools]
  ↓ curator.html export (manual)
poems-curated.json              [human-approved — NOT YET GENERATED]
```

**Re-run full pipeline after source changes:**
```bash
BASE=$(ls -d /sessions/*/mnt/PrintHL 2>/dev/null | head -1)
cd $BASE/../outputs
python3 parse_cleaned.py && python3 infer_emotions.py
python3 -c "import json; open('$BASE/hanh-loan-poetry/curator_data_inline.js','w').write('const POEMS_DATA = ' + json.dumps(json.load(open('$BASE/hanh-loan-poetry/poems-inferred.json')), ensure_ascii=False, indent=2) + ';\n')"
```

---

## § DESIGN DOCTRINE (frozen — require `[THINK]` to reopen)

1. **AI suggests, human decides.** `aiSuggestion` is read-only. Curator writes to `curatorOverride`. Never auto-finalize.
2. **Z-score over raw values.** Dominant field = highest corpus deviation, not highest absolute score. Prevents longing collapse (71/102 problem).
3. **English data / Vietnamese UI.** JSON keys stay English. All visible labels Vietnamese. `Eros` stays untranslated everywhere.
4. **Ritual cooling, not physical.** Poems sleep when unread; warmth via hover (session-based). Server persistence = Phase 3.
5. **Habitable, not beautiful.** "Comfortable enough to inhabit, not admire from afar." No glassmorphism. Terminal energy + habitable warmth.
6. **Radar = oscilloscope.** Dots + faint thread + brightness-weighted axes. No polygon fill. Ever.

---

## § SCHEMA (compressed)

```typescript
EmotionalField: { longing, entropy, eros, warmth, ambiguity,
                  transcendence, isolation, memoryPressure }  // all 0–1
DominantField:  'longing'|'eros'|'entropy'|'memory'|'distance'|'ecstasy'
```

Vietnamese UI labels:
`longing→Nỗi nhớ  entropy→Tan rã  eros→Eros  warmth→Ấm áp`
`ambiguity→Lưỡng lự  transcendence→Siêu thoát  isolation→Cô lập  memoryPressure→Ký ức đè`
`distance→Xa cách  ecstasy→Xuất thần`

---

## § TASKS

- [x] Parse Cleaned.md → 102 poems (parse_cleaned.py)
- [x] Emotional inference, z-score normalized (infer_emotions.py)
- [x] curator.html — Vietnamese UI, oscilloscope radar, whisper z-score, body text fix, keyboard shortcuts shown
- [x] topology.html — session attention cooling, Vietnamese labels, thermal rendering
- [ ] **Human curation of 102 poems** — open curator.html, sort by confidence, start with 4 low-conf poems
- [ ] PDF → WebP pipeline (after curation, before public build)
- [ ] Phase 2: field distortion / hover ripple in topology.html
- [ ] Phase 3: persistent cosmological entropy (server-backed cooling)

---

## § WORKING RULES

**After any HTML edit — verify JS balance:**
```bash
python3 -c "
import re, glob
for path in glob.glob('/sessions/*/mnt/PrintHL/hanh-loan-poetry/*.html'):
    src=open(path).read()
    js=' '.join(re.findall(r'<script[^>]*>(.*?)</script>',src,re.DOTALL))
    delta=js.count(chr(123))-js.count(chr(125))
    print(f'{path.split(\"/\")[-1]}: brace delta={delta} {\"OK\" if abs(delta)<=1 else \"ERROR\"}')
"
```

**Domain facts — don't re-derive these:**
- `nhớ/xa/thương` appear in almost all poems → longing is NOT distinctive raw; z-score tells truth
- Stubs: pdfSeq 76, 104, 106, 107, 108 — no body text, skip auto-curate
- Expected dominant distribution: entropy~27, memory~25, distance~15, eros~14, longing~11, ecstasy~10
- False positives in source MD (already filtered): `HLU 9/11/2019.` and `TIN-YÊU-CHỜ-MONG-...`

**Never:** re-read all source files to "understand the project." Read this file + check pipeline state. Then work.

---

## § MEMOS
<!-- Paste [CLOSE] summaries here. Most recent at top. Max 5 sessions retained. -->

SESSION CLOSE — 2026-05-08

Decisions:
- Radar → oscilloscope (dots + faint thread + brightness-weighted axes, no polygon fill)
- Topology → session attention cooling Mode B (ritual, not physical)
  warmth = min(1, hoverSeconds/15), thermalR + alphaHex per node
  thermal states: ngủ / thức dần / ấm / sáng
- Vietnamese UI finalized: both HTML tools, all visible labels, Eros untranslated
- Z-score section: "Lệch quỹ đạo" + "rare within this constellation" + whisper text
- curator.html body fix: p.body (full cleaned text) instead of p.bodyPreview
- CLAUDE.md created: ~573 tokens, 8 sections, auto-loads next session

Completed:
- poems-inferred.json: 102 poems from thoHanhLoan_Cleaned.md (97 text + 5 stubs)
- curator_data_inline.js regenerated: 284KB
- curator.html: 776 lines, brace delta=0
- topology.html: 575 lines, brace delta=0

Open threads:
- Human curation of 102 poems not started
- Last question unanswered: "phản biện hay thực thi?" → execute (no pushback warranted)

Next session — execute in order:
1. topology.html: field silence (idle 8s → universe breathes down, not freezes)
2. topology.html: replace gravity edges with density haze + pressure ripple
3. topology.html: logarithmic warmth decay ("sáng" lingers longer than "thức dần")
4. curator.html: comfort pass — smoother scroll, text selection, subtle focus states

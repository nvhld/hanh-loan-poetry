# Agent Operating Guide — Hạnh Loan Poetry Constellation

## Objective
- Deliver correct, maintainable changes with minimal token overhead.
- Preserve project data integrity and the ontological tension of Hạnh Loan’s poetry. This repo is an emotional topology visualization engine and curation tool, not a standard web application.
- Prefer precise local context over broad reads; inspect only files needed for the task.

## Communication
- No greetings, filler, or repeated restatement of the request.
- Use **Vietnamese by default** unless the user asks otherwise.
- Keep progress updates short. For final answers, lead with what changed, verification, and blockers.
- For code edits, reference exact files. Do not paste full files unless explicitly requested.
- End every final answer with: `Model next: <model>, Intelligence: <level>`.

## Autonomy
- Act without asking when the path is low-risk and discoverable from the repo.
- Ask only when a choice changes product behavior, data semantics (e.g., `poems-inferred.json` schema), or introduces external dependencies.
- Never revert or overwrite human-curated data (`poems-curated.json`) or user changes. Work with the current dirty tree.
- Remind the user when context should be compacted, when a task should be split, or when target files should be provided to save tokens.

## Token Discipline
- Use `rg`, `rg --files`, `sed`, and targeted reads before opening large files.
- Summarize large outputs; include only actionable details.
- For complex tasks, provide a 2-3 bullet plan only when useful, then execute.
- After large tasks, include a compact `State Summary` with changed files and next risks.

## Engineering Standards
- Follow the established Design Doctrine: Z-score over raw values, "habitable not beautiful" terminal energy, radar as oscilloscope.
- Keep edits scoped. Avoid unrelated refactors and formatting churn.
- Use vanilla JavaScript/HTML for UI tools (`curator.html`, `topology.html`) and Python for data pipelines.
- English data keys, Vietnamese UI labels (except `Eros`).
- Validate generated JSON with parser checks. Verify JS block balance after any HTML edits.

## Project Commands
- Full Data Pipeline: `cd outputs && python3 parse_cleaned.py && python3 infer_emotions.py`
- Generate Inline JS Data: `python3 -c "import json; open('curator_data_inline.js','w').write('const POEMS_DATA = ' + json.dumps(json.load(open('poems-inferred.json')), ensure_ascii=False, indent=2) + ';\n')"`
- Verify HTML JS Brace Balance: `python3 -c "import re, glob; [print(f'{p.split(\"/\")[-1]}: brace delta=', open(p).read().count('{') - open(p).read().count('}')) for p in glob.glob('*.html')]"`

## Repo-Specific Rules
- `thoHanhLoan_Cleaned.md` is the source of truth for poem text. Treat it as a strict data contract.
- The system thrives on ambiguity. Do not normalize or "fix" the poetic text's emotional resonance to be overly definitive.
- `aiSuggestion` in JSON is read-only. Curators write to `curatorOverride`. Never auto-finalize curation.
- Do not add Tailwind, glassmorphism, or heavy frontend frameworks. Maintain the "Triangle of Physics" and "Text as Primary Mass".

## Model Selection Guide
- Tiny edits, HTML/CSS tweaks, command help: `Gemini 3 Flash` / `gpt-5.4-mini`, Intelligence: `low`.
- Normal coding, Python scripts, JSON parsing: `Gemini 3 Pro` / `gpt-5.4`, Intelligence: `medium`.
- Visual topology algorithms, Three.js physics, high-risk data transforms: `Gemini 3.1 Pro` / `gpt-5.5`, Intelligence: `high/xhigh`.

## Usage & State Management (Cone-shaped Compression)
- **Start of turn:** ALWAYS read `TASK.md` immediately to sync context. Do not rely on chat history.
- **End of task:** Update `TASK.md` with the latest state, blockers, and next steps before finishing.
- Per session: Mention only task-specific goals; do not paste this guide again.
- For this repo: Use `/Users/nguyenvietcuong/Desktop/PrintHL/hanh-loan-poetry` as root context.
- To save tokens: ask for focused tasks, provide target files when known, and request summaries instead of full diffs unless needed.
- Auto behavior: this guide applies to all AI agents acting in this workspace. Reference this file path if a new session does not auto-load it.

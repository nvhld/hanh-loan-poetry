#!/usr/bin/env python3

"""Build Instrument Modal data mirrors without rewriting the translator.

`instrument_translator.js` is a hand-maintained, template-only interpreter.
This script only regenerates `anchor_mri_inline.js` from `anchor_mri.json` so
the reader can work without a network fetch.
"""

import json
from pathlib import Path

BASE = Path(__file__).resolve().parent / "public" / "literary"
MRI_PATH = BASE / "anchor_mri.json"
INLINE_PATH = BASE / "anchor_mri_inline.js"
TRANSLATOR_PATH = BASE / "instrument_translator.js"


def main() -> None:
    mri_data = json.loads(MRI_PATH.read_text(encoding="utf-8"))
    if not isinstance(mri_data, dict):
        raise SystemExit("anchor_mri.json must be an object keyed by poem id")
    if len(mri_data) != 12:
        raise SystemExit(f"Instrument Modal expects 12 anchor MRI entries, got {len(mri_data)}")

    translator = TRANSLATOR_PATH.read_text(encoding="utf-8")
    if "window.InstrumentTranslator = { translateMRI };" not in translator:
        raise SystemExit("instrument_translator.js is missing the template translator export")

    INLINE_PATH.write_text(
        "const ANCHOR_MRI_DATA = "
        + json.dumps(mri_data, ensure_ascii=False, indent=2)
        + ";\n",
        encoding="utf-8",
    )
    print(f"Wrote {INLINE_PATH.relative_to(BASE.parent.parent)}")


if __name__ == "__main__":
    main()

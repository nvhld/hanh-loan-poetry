#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
parse_poems.py
Parse thoHanhLoan.md → structured poems JSON.

Strategy:
- Poem headers are lines matching:
    a) Numbered:  "8\. CHIÊM NGHIỆM" or "9 CHUNG KẾT"
    b) Un-numbered ALL-CAPS standalone: "HẾT YÊU", "EM, THÁNG 9 VÀ NỖI NHỚ"
- Intro/critic block (lines 1-67ish) is skipped.
- Everything between two headers is the poem body.
- Dates are extracted from body (dd/mm/yyyy, mm/yyyy, year patterns).
"""

import re
import json
import unicodedata

SRC = '/sessions/gifted-practical-brown/mnt/PrintHL/thoHanhLoan.md'
DST = '/sessions/gifted-practical-brown/mnt/PrintHL/hanh-loan-poetry/poems-raw.json'

# ── helpers ────────────────────────────────────────────────────────────────

def is_uppercase_vn(ch):
    """True if ch is an uppercase Vietnamese/Latin letter."""
    if ch.isupper():
        return True
    cat = unicodedata.category(ch)
    return cat == 'Lu'

def looks_like_title(line: str) -> bool:
    """
    Heuristic: a title is mostly uppercase letters, spaces, commas, digits,
    apostrophes, hyphens. At least 2 real letters. No lowercase run.
    """
    stripped = line.strip()
    if not stripped:
        return False
    if len(stripped) < 2 or len(stripped) > 90:
        return False
    letters = [c for c in stripped if c.isalpha()]
    if not letters:
        return False
    # All letters uppercase?
    lower_letters = [c for c in letters if c.islower()]
    if len(lower_letters) > 0:
        return False
    return True

# Regex for numbered poem header: "52\. TITLE" or "52. TITLE" or "52 TITLE"
RE_NUMBERED = re.compile(
    r'^(\d{1,3})[\\]?\.?\s+([A-ZĐÀÁÂĂÈÉÊÌÍÒÓÔÕÙÚÝẮẶẲẴẸẺẼẾỀỂỆỈỊỌỎỐỒỔỖỘỚỜỞỠỢỤỦỨỪỰỬỮ].*)',
    re.UNICODE
)

# Date patterns (appear at END of poem body)
RE_DATE_FULL   = re.compile(r'(\d{1,2})[./](\d{1,2})[./](\d{4})')
RE_DATE_MY     = re.compile(r'(\d{1,2})[./](\d{4})')
RE_DATE_YEAR   = re.compile(r'\b(201[6-9]|202[0-9])\b[\\]?\.')
RE_DATE_NAMED  = re.compile(r'(Tháng|tháng)\s+(\d{1,2})/(\d{4})')

def extract_date(text: str):
    """Return (date_str, year) from poem body. Best guess."""
    # Full date first
    for m in RE_DATE_FULL.finditer(text):
        d, mo, y = m.group(1), m.group(2), m.group(3)
        return f"{y}-{mo.zfill(2)}-{d.zfill(2)}", int(y)
    for m in RE_DATE_MY.finditer(text):
        mo, y = m.group(1), m.group(2)
        return f"{y}-{mo.zfill(2)}", int(y)
    for m in RE_DATE_NAMED.finditer(text):
        mo, y = m.group(2), m.group(3)
        return f"{y}-{mo.zfill(2)}", int(y)
    for m in RE_DATE_YEAR.finditer(text):
        y = m.group(1)
        return y, int(y)
    return None, None

def slugify(text: str) -> str:
    """Vietnamese title → ascii slug via NFD decomposition."""
    # Normalize: decompose unicode, remove diacritics
    text = unicodedata.normalize('NFD', text)
    text = ''.join(c for c in text if unicodedata.category(c) != 'Mn')
    # Handle đ/Đ separately (not decomposable)
    text = text.replace('đ', 'd').replace('Đ', 'D')
    text = re.sub(r'[^a-zA-Z0-9\s-]', '', text)
    text = re.sub(r'\s+', '-', text.strip()).lower()
    return text[:60]

# ── main parse ──────────────────────────────────────────────────────────────

def parse():
    with open(SRC, encoding='utf-8') as f:
        raw_lines = f.readlines()

    lines = [l.rstrip('\n') for l in raw_lines]

    # ── 1. find all poem header positions ─────────────────────────────
    headers = []  # list of (line_idx, sequence_or_None, title)

    # The intro block ends around line 67 (after critic section 6 + VÙI).
    # We look for poem 7 (VÙI) and everything from that point on.
    INTRO_END = 0
    for i, line in enumerate(lines):
        stripped = line.strip()
        # Find "7\.  VÙI" — first real poem header
        if re.match(r'^7\\?\.\s+V[ÙU]I\s*$', stripped, re.UNICODE):
            INTRO_END = i
            break

    # Scan from INTRO_END for all headers
    for i in range(INTRO_END, len(lines)):
        stripped = lines[i].strip()
        if not stripped:
            continue

        # Pattern A: numbered header "8\. CHIÊM NGHIỆM"
        m = RE_NUMBERED.match(stripped)
        if m:
            seq = int(m.group(1))
            title_raw = m.group(2).strip()
            # Make sure the title part looks uppercase
            title_letters = [c for c in title_raw if c.isalpha()]
            lower_count = sum(1 for c in title_letters if c.islower())
            if title_letters and lower_count / len(title_letters) < 0.3:
                headers.append((i, seq, title_raw))
                continue

        # Pattern B: all-caps standalone line (no number)
        # Handles titles with lowercase parentheticals: "TITLE (hay SUBTITLE)"
        # Strip parenthetical before checking caps
        title_check = re.sub(r'\s*\([^)]*\)\s*$', '', stripped).strip()
        if looks_like_title(title_check) and i > INTRO_END + 5:
            # Skip common false positives
            skip_prefixes = ['*', '(', '–', '-', '.', '"', ''', ''']
            if any(stripped.startswith(p) for p in skip_prefixes):
                continue
            # Skip truly empty or particle-only (EM alone OK, but not single chars)
            if len(title_check) <= 1:
                continue
            headers.append((i, None, stripped))

    # Deduplicate (keep first occurrence per line)
    seen = set()
    deduped = []
    for h in headers:
        if h[0] not in seen:
            seen.add(h[0])
            deduped.append(h)
    headers = sorted(deduped, key=lambda x: x[0])

    print(f"Found {len(headers)} potential poem headers")

    # ── 2. extract body between headers ───────────────────────────────
    poems = []
    for idx, (line_i, seq, title) in enumerate(headers):
        # Body = lines from line_i+1 up to next header (or EOF)
        end = headers[idx + 1][0] if idx + 1 < len(headers) else len(lines)
        body_lines = lines[line_i + 1 : end]

        # Clean body: strip leading/trailing empty lines, remove markdown escapes
        body = '\n'.join(body_lines)
        body = body.replace('\\-', '-').replace('\\.', '.')
        # Remove asterisk italic markers
        body = re.sub(r'\*([^*]+)\*', r'\1', body)
        # Collapse 3+ consecutive newlines → 2
        body = re.sub(r'\n{3,}', '\n\n', body)
        body = body.strip()

        date_str, year = extract_date(body)

        # Excerpt: first 3 non-empty lines of actual verse
        verse_lines = [l.strip() for l in body.split('\n') if l.strip()]
        # Skip dedication/tặng lines at start
        verse_lines = [l for l in verse_lines if not l.lower().startswith('tặng')]
        excerpt = '\n'.join(verse_lines[:3]) if verse_lines else ''

        poem = {
            'sequence': seq,
            'title': title.strip(),
            'slug': slugify(title),
            'year': year,
            'date': date_str,
            'excerpt': excerpt,
            'body': body,
            'lineIndex': line_i,
            # These will be filled by inference engine:
            'emotionalField': None,
            'dominantField': None,
            'gravityMass': None,
            'decayRate': None,
            'motifs': {},
            'tags': {'space': [], 'season': [], 'motif': []},
        }
        poems.append(poem)

    # ── 3. assign sequences to un-numbered poems ───────────────────────
    # Fill gaps: if seq is None, interpolate
    last_seq = 0
    for p in poems:
        if p['sequence'] is not None:
            last_seq = p['sequence']
        else:
            last_seq += 1
            p['sequence'] = last_seq

    # Generate id
    for p in poems:
        y = p['year'] or 0
        p['id'] = f"{y}-{p['sequence']:03d}-{p['slug']}"

    # ── 4. write output ────────────────────────────────────────────────
    with open(DST, 'w', encoding='utf-8') as f:
        json.dump(poems, f, ensure_ascii=False, indent=2)

    print(f"Wrote {len(poems)} poems to {DST}")

    # Print summary
    for p in poems[:10]:
        print(f"  [{p['sequence']:3d}] {p['title'][:40]:40s} | {p['date'] or '?'}")
    print("  ...")
    for p in poems[-5:]:
        print(f"  [{p['sequence']:3d}] {p['title'][:40]:40s} | {p['date'] or '?'}")

    return poems

if __name__ == '__main__':
    poems = parse()

#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
finalize_poems.py
Match parsed poems → PDF filenames by date, add stubs for PDF-only poems.
Output: poems-final.json (ready for emotional inference)
"""

import re
import json
import os
import unicodedata
from datetime import datetime

POEMS_RAW = '/sessions/gifted-practical-brown/mnt/PrintHL/hanh-loan-poetry/poems-raw.json'
PDF_DIR   = '/sessions/gifted-practical-brown/mnt/PrintHL'
DST       = '/sessions/gifted-practical-brown/mnt/PrintHL/hanh-loan-poetry/poems-final.json'

# ── PDF inventory ───────────────────────────────────────────────────────────

def parse_pdf_meta(fname):
    """
    Parse PDF filename: '2022.5.08.PhiTruong.36.pdf'
    → {date:'2022-05-08', year:2022, seq:36, fname:..., title_slug:'PhiTruong'}
    """
    m = re.match(r'^(\d{4})\.(\d{1,2})\.(\d{1,2})\.(.+?)\.(\d{2,3})\s*\.pdf$', fname)
    if m:
        y, mo, d, slug, seq = m.groups()
        return {
            'fname': fname,
            'year': int(y),
            'date': f"{y}-{mo.zfill(2)}-{d.zfill(2)}",
            'pdfSeq': int(seq),
            'titleSlug': slug,
        }
    # Fallback: year only  e.g. '2016.Vui.08.pdf'
    m2 = re.match(r'^(\d{4})\.(.+?)\.(\d{2,3})\s*\.pdf$', fname)
    if m2:
        y, slug, seq = m2.groups()
        return {
            'fname': fname,
            'year': int(y),
            'date': y,
            'pdfSeq': int(seq),
            'titleSlug': slug,
        }
    return None

def slugify_vn(text):
    text = unicodedata.normalize('NFD', text)
    text = ''.join(c for c in text if unicodedata.category(c) != 'Mn')
    text = text.replace('d', 'd').replace('D', 'D')
    text = re.sub(r'[^a-zA-Z0-9]', '', text).lower()
    return text

# Build PDF map
all_pdfs = sorted(os.listdir(PDF_DIR))
pdf_metas = []
for f in all_pdfs:
    if not f.endswith('.pdf'):
        continue
    m = parse_pdf_meta(f)
    if m:
        pdf_metas.append(m)

pdf_by_seq = {p['pdfSeq']: p for p in pdf_metas}
print(f"Found {len(pdf_metas)} dated PDFs, seqs {min(pdf_by_seq)}-{max(pdf_by_seq)}")

# ── Load parsed poems ────────────────────────────────────────────────────────

with open(POEMS_RAW, encoding='utf-8') as f:
    poems = json.load(f)

# ── Match poems → PDFs ──────────────────────────────────────────────────────
# Strategy: for each poem, find the PDF whose (year, titleSlug) best matches.
# Fallback: use pdfSeq directly if poem has explicit sequence.

def title_to_slug(title):
    return slugify_vn(title)

def slug_similarity(a, b):
    """Simple overlap score between two slugs."""
    if not a or not b:
        return 0
    # Check substring containment
    if a in b or b in a:
        return 0.9
    # Longest common prefix ratio
    common = 0
    for ca, cb in zip(a, b):
        if ca == cb:
            common += 1
        else:
            break
    return common / max(len(a), len(b), 1)

matched_pdf_seqs = set()

for poem in poems:
    p_year = poem.get('year')
    p_date = poem.get('date') or ''
    p_slug = title_to_slug(poem['title'])

    best_pdf = None
    best_score = -1

    for pdf in pdf_metas:
        # Year must match
        if p_year and pdf['year'] != p_year:
            continue

        # Date prefix match
        date_score = 0
        if p_date and pdf['date']:
            # Check how many date chars match
            for ci, (ca, cb) in enumerate(zip(p_date, pdf['date'])):
                if ca == cb:
                    date_score += 1
                else:
                    break
            date_score /= max(len(p_date), len(pdf['date']), 1)

        # Title slug match
        pdf_tslug = slugify_vn(pdf['titleSlug'])
        title_score = slug_similarity(p_slug[:12], pdf_tslug[:12])

        score = date_score * 0.6 + title_score * 0.4
        if score > best_score and score > 0.3:
            best_score = score
            best_pdf = pdf

    if best_pdf:
        poem['pdfFile'] = best_pdf['fname']
        poem['pdfSeq']  = best_pdf['pdfSeq']
        matched_pdf_seqs.add(best_pdf['pdfSeq'])
    else:
        poem['pdfFile'] = None
        poem['pdfSeq']  = None

# ── Add stubs for PDF-only poems ────────────────────────────────────────────
# These are poems present as PDFs but not in the markdown text

STUB_TITLES = {
    76:  'NGẪU HỨNG',
    104: 'HẠ CÁNH NƠI ANH',
    106: 'VU VƠ TRƯỚC BIỂN',
    107: 'NÀNG II',
    108: 'THƠ TÌNH THÁNG TÁM',
}

existing_ids = {p['id'] for p in poems}
stubs = []

for seq, title in STUB_TITLES.items():
    if seq in matched_pdf_seqs:
        continue
    pdf = pdf_by_seq.get(seq)
    if not pdf:
        continue
    stub_id = f"{pdf['year']}-{seq:03d}-stub"
    if stub_id in existing_ids:
        continue

    stubs.append({
        'id': stub_id,
        'sequence': seq,
        'pdfSeq': seq,
        'title': title,
        'slug': f"stub-{seq}",
        'year': pdf['year'],
        'date': pdf['date'],
        'excerpt': '',
        'body': '',  # No text — poem from PDF only
        'pdfFile': pdf['fname'],
        'lineIndex': -1,
        'isStub': True,
        'emotionalField': None,
        'dominantField': None,
        'gravityMass': None,
        'decayRate': None,
        'motifs': {},
        'tags': {'space': [], 'season': [], 'motif': []},
    })

print(f"Added {len(stubs)} stub entries for PDF-only poems")

# ── Assign final IDs ─────────────────────────────────────────────────────────
all_poems = poems + stubs

for p in all_poems:
    seq = p.get('pdfSeq') or p.get('sequence') or 0
    y   = p.get('year') or 0
    slug = p.get('slug') or 'unknown'
    p['id'] = f"{y}-{seq:03d}-{slug[:30]}"

# Sort by pdfSeq (canonical book order), fallback to sequence
all_poems.sort(key=lambda p: (p.get('pdfSeq') or p.get('sequence') or 999))

# ── Write output ────────────────────────────────────────────────────────────
with open(DST, 'w', encoding='utf-8') as f:
    json.dump(all_poems, f, ensure_ascii=False, indent=2)

print(f"\nWrote {len(all_poems)} poems to poems-final.json")
print(f"\nSample — first 15 by canonical order:")
for p in all_poems[:15]:
    stub = ' [STUB]' if p.get('isStub') else ''
    print(f"  PDF[{p.get('pdfSeq','?'):3}] MD[{p.get('sequence','?'):3}] {p['title'][:40]:40s} {p.get('date','?')}{stub}")

print(f"\nSample — last 10:")
for p in all_poems[-10:]:
    stub = ' [STUB]' if p.get('isStub') else ''
    print(f"  PDF[{p.get('pdfSeq','?'):3}] MD[{p.get('sequence','?'):3}] {p['title'][:40]:40s} {p.get('date','?')}{stub}")

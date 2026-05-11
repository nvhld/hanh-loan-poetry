#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
infer_emotions.py
────────────────────────────────────────────────────────────────
Emotional inference engine for Hạnh Loan's poetry constellation.

OUTPUT FORMAT:
  Each poem gets an `aiSuggestion` block:
  {
    "emotionalField": { longing, entropy, eros, warmth, ambiguity,
                        transcendence, isolation, memoryPressure },
    "dominantField": "longing"|"ecstasy"|"memory"|"distance"|"eros"|"entropy",
    "gravityMass":   float,      // 0.5–3.0
    "decayRate":     float,      // 0.01–0.10
    "motifs":        { motif: score },
    "tags":          { space:[], season:[], motif:[] },
    "confidence":    float,      // 0.0–1.0 (low = more curation needed)
    "notes":         string      // why AI made this call
  }

The curator will review each `aiSuggestion` and promote it to `emotionalField`
(or override it). AI NEVER writes directly to `emotionalField`.

PHILOSOPHY:
  - "hoàng hôn" is NOT always sadness. It can be: eros, release, exhaustion.
  - Ambiguity is signal, not noise. Preserve it.
  - A poem scoring 0.7 on two axes is more interesting than 1.0 on one.
  - confidence < 0.5 = needs human eye urgently.
────────────────────────────────────────────────────────────────
"""

import re
import json
import math
from typing import Dict, List, Tuple, Optional

SRC = '/sessions/gifted-practical-brown/mnt/PrintHL/hanh-loan-poetry/poems-final.json'
DST = '/sessions/gifted-practical-brown/mnt/PrintHL/hanh-loan-poetry/poems-inferred.json'

# ── Motif vocabulary ─────────────────────────────────────────────────────────
# Each motif: (keyword_patterns, emotional_loading)
# Loading = which EmotionalField dimensions this motif raises/lowers

MOTIFS: Dict[str, Tuple[List[str], Dict[str, float]]] = {
    # Space motifs
    'phi_truong': (
        ['phi trường', 'sân bay', 'airport', 'máy bay', 'boarding', 'cất cánh', 'hạ cánh', 'chuyến bay'],
        {'longing': 0.4, 'isolation': 0.3, 'entropy': 0.2, 'ambiguity': 0.15}
    ),
    'bien': (
        ['biển', 'đại dương', 'sóng', 'bờ biển', 'hải', 'thủy triều', 'ocean', 'sea'],
        {'longing': 0.3, 'transcendence': 0.3, 'eros': 0.2, 'entropy': 0.2}
    ),
    'song': (
        ['sông', 'dòng sông', 'con sông', 'bờ sông', 'nước', 'thuyền', 'mưa'],
        {'longing': 0.25, 'entropy': 0.3, 'memoryPressure': 0.2}
    ),
    'khoang_cach': (
        ['xa', 'cách', 'khoảng cách', 'nơi xa', 'tít tắp', 'vời vợi', 'nghìn trùng', 'ngàn dặm'],
        {'longing': 0.5, 'isolation': 0.35, 'entropy': 0.15}
    ),
    'bau_troi': (
        ['bầu trời', 'bầu trờ', 'trời', 'mây', 'gió', 'áng mây', 'bầu trời'],
        {'transcendence': 0.3, 'longing': 0.2, 'ambiguity': 0.1}
    ),
    'tinh_van': (
        ['tinh vân', 'vì sao', 'ngôi sao', 'thiên hà', 'vũ trụ', 'star', 'cosmos', 'bầu trời sao'],
        {'transcendence': 0.5, 'longing': 0.3, 'isolation': 0.2}
    ),
    'boston': (
        ['boston', 'michigan', 'potomac', 'caribe', 'caribbean', 'hoa kỳ', 'mỹ'],
        {'isolation': 0.3, 'longing': 0.4, 'entropy': 0.1}
    ),

    # Time motifs
    'binh_minh': (
        ['bình minh', 'ban mai', 'sáng', 'fajr', 'dawn', 'tia nắng', 'bình minh'],
        {'warmth': 0.4, 'transcendence': 0.2, 'longing': 0.15, 'eros': 0.1}
    ),
    'hoang_hon': (
        ['hoàng hôn', 'chiều tà', 'chiều', 'buổi chiều', 'tắt nắng', 'bóng tối'],
        {'entropy': 0.3, 'longing': 0.25, 'eros': 0.2, 'ambiguity': 0.2}
    ),
    'dem': (
        ['đêm', 'ban đêm', 'nửa đêm', 'đêm khuya', 'đêm nay', 'đêm dài', 'tối'],
        {'eros': 0.3, 'isolation': 0.3, 'longing': 0.2, 'ambiguity': 0.15}
    ),
    'mua_thu': (
        ['mùa thu', 'tháng mười', 'thu', 'lá rụng', 'lá vàng', 'se lạnh'],
        {'entropy': 0.35, 'longing': 0.3, 'memoryPressure': 0.2, 'ambiguity': 0.1}
    ),
    'mua_dong': (
        ['mùa đông', 'đông', 'lạnh', 'giá lạnh', 'băng giá', 'tuyết', 'rét'],
        {'isolation': 0.35, 'entropy': 0.3, 'longing': 0.25}
    ),
    'mua_xuan': (
        ['mùa xuân', 'xuân', 'hoa nở', 'tháng giêng', 'tết', 'hoa đào'],
        {'warmth': 0.35, 'eros': 0.25, 'transcendence': 0.15}
    ),
    'thang_nam': (
        ['tháng năm', 'mùa hè', 'hè', 'nắng hạ', 'tháng sáu', 'tháng bảy', 'tháng tám'],
        {'eros': 0.3, 'warmth': 0.25, 'entropy': 0.1}
    ),

    # Emotional motifs
    'noi_nho': (
        ['nỗi nhớ', 'nhớ', 'thương', 'nhớ nhung', 'nỗi nhớ', 'nhung nhớ', 'xa nhớ'],
        {'longing': 0.6, 'memoryPressure': 0.3, 'entropy': 0.1}
    ),
    'ky_uc': (
        ['ký ức', 'kỷ niệm', 'hồi ức', 'ngày xưa', 'thuở', 'ngày ấy', 'nhớ lại', 'hoài niệm'],
        {'memoryPressure': 0.55, 'entropy': 0.25, 'longing': 0.2}
    ),
    'co_don': (
        ['cô đơn', 'một mình', 'cô quạnh', 'lẻ loi', 'trống vắng', 'im lặng', 'lặng lẽ'],
        {'isolation': 0.55, 'longing': 0.3, 'entropy': 0.1}
    ),
    'tinh_yeu': (
        ['yêu', 'tình yêu', 'tình', 'yêu thương', 'nụ hôn', 'hôn', 'ôm', 'vòng tay'],
        {'eros': 0.25, 'warmth': 0.25, 'longing': 0.15}
    ),
    'mat_mat': (
        ['mất', 'chia tay', 'chia lìa', 'xa cách', 'hết yêu', 'chia xa', 'rời xa', 'mất đi'],
        {'entropy': 0.45, 'longing': 0.3, 'isolation': 0.2}
    ),
    'khao_khat': (
        ['khát', 'khao khát', 'thèm', 'muốn', 'khát vọng', 'đam mê', 'dục vọng'],
        {'eros': 0.45, 'longing': 0.25, 'entropy': 0.1}
    ),
    'siêu_viet': (
        ['linh hồn', 'vĩnh hằng', 'vô tận', 'bất tử', 'thiên đường', 'siêu việt', 'vô cùng'],
        {'transcendence': 0.6, 'ambiguity': 0.2, 'isolation': 0.1}
    ),
    'giac_mo': (
        ['giấc mơ', 'chiêm bao', 'mộng', 'mơ', 'ảo', 'hư ảo', 'ảo mộng'],
        {'ambiguity': 0.4, 'transcendence': 0.25, 'memoryPressure': 0.2}
    ),
    'hon': (
        ['hôn', 'nụ hôn', 'môi', 'nụ môi', 'kiss', 'hàm'],
        {'eros': 0.55, 'warmth': 0.25}
    ),
    'thoi_gian': (
        ['thời gian', 'năm tháng', 'ngày dài', 'tháng năm', 'bao giờ', 'đã qua', 'bao lâu'],
        {'entropy': 0.45, 'memoryPressure': 0.25, 'ambiguity': 0.15}
    ),
    'tu_do': (
        ['tự do', 'bay', 'thoát', 'giải phóng', 'ràng buộc', 'phá vỡ'],
        {'transcendence': 0.35, 'ambiguity': 0.3, 'eros': 0.15}
    ),
}

# ── Structural signals ───────────────────────────────────────────────────────

def analyze_structure(body: str) -> Dict[str, float]:
    """
    Structural signals from poem form.
    Short lines → lyric intensity (higher eros/longing)
    Long free verse → entropy/transcendence
    Repetition → memoryPressure
    Questions → ambiguity
    Ellipsis → longing/ambiguity
    """
    if not body:
        return {}

    lines = [l.strip() for l in body.split('\n') if l.strip()]
    if not lines:
        return {}

    signals = {}

    # Line length distribution
    avg_len = sum(len(l) for l in lines) / len(lines)
    if avg_len < 20:
        # Short lyric form → intensity
        signals['eros'] = 0.1
        signals['longing'] = 0.1
    elif avg_len > 50:
        # Long free verse → expansive
        signals['transcendence'] = 0.1
        signals['entropy'] = 0.05

    # Question marks → ambiguity
    q_count = body.count('?')
    if q_count > 0:
        signals['ambiguity'] = min(0.3, q_count * 0.06)

    # Ellipsis → longing / trailing-off
    ellipsis = body.count('...') + body.count('…')
    if ellipsis > 0:
        signals['longing'] = signals.get('longing', 0) + min(0.2, ellipsis * 0.04)
        signals['ambiguity'] = signals.get('ambiguity', 0) + min(0.1, ellipsis * 0.02)

    # Repetition (anaphora) → memoryPressure
    first_words = [l.split()[0] if l.split() else '' for l in lines]
    from collections import Counter
    fw_counts = Counter(first_words)
    repeated = sum(1 for w, c in fw_counts.items() if c >= 3 and len(w) > 2)
    if repeated > 0:
        signals['memoryPressure'] = min(0.25, repeated * 0.08)

    # Exclamation → intensity (warmth or eros)
    excl = body.count('!')
    if excl > 2:
        signals['warmth'] = signals.get('warmth', 0) + min(0.15, excl * 0.03)

    return signals

# ── Core inference ───────────────────────────────────────────────────────────

def infer(poem: dict) -> dict:
    """
    Run motif extraction + structural analysis on a poem.
    Returns aiSuggestion dict.
    """
    body = (poem.get('body') or '').lower()
    title = (poem.get('title') or '').lower()
    full_text = title + ' ' + body

    if not full_text.strip():
        return {
            'emotionalField': {
                'longing': 0.5, 'entropy': 0.5, 'eros': 0.3,
                'warmth': 0.3, 'ambiguity': 0.5, 'transcendence': 0.3,
                'isolation': 0.3, 'memoryPressure': 0.3
            },
            'dominantField': 'entropy',
            'gravityMass': 1.0,
            'decayRate': 0.05,
            'motifs': {},
            'tags': {'space': [], 'season': [], 'motif': []},
            'confidence': 0.1,
            'notes': 'Stub poem — no text available. Defaults applied.',
        }

    # ── 1. Motif detection ─────────────────────────────────────────────
    detected_motifs: Dict[str, float] = {}
    field_accum: Dict[str, float] = {
        'longing': 0.0, 'entropy': 0.0, 'eros': 0.0,
        'warmth': 0.0, 'ambiguity': 0.0, 'transcendence': 0.0,
        'isolation': 0.0, 'memoryPressure': 0.0
    }

    word_count = max(len(full_text.split()), 1)

    for motif_key, (keywords, loading) in MOTIFS.items():
        hit_count = 0
        for kw in keywords:
            # Count occurrences, weighted by position (title hit = 2x)
            body_hits = len(re.findall(re.escape(kw), body))
            title_hits = len(re.findall(re.escape(kw), title)) * 2
            hit_count += body_hits + title_hits

        if hit_count > 0:
            # Normalize by poem length
            density = hit_count / (word_count / 50)  # per 50 words
            score = min(1.0, 0.3 + density * 0.4)
            detected_motifs[motif_key] = round(score, 3)

            # Accumulate emotional loading
            for field, weight in loading.items():
                field_accum[field] += weight * score

    # ── 2. Structural signals ──────────────────────────────────────────
    structural = analyze_structure(poem.get('body') or '')
    for field, delta in structural.items():
        field_accum[field] = field_accum.get(field, 0) + delta

    # ── 3. Normalize emotional field to 0–1 ───────────────────────────
    # Don't just clamp — scale so that the max signal is around 0.8
    # This preserves relative structure and avoids everything clustering at 1.0
    max_val = max(field_accum.values()) if field_accum.values() else 1.0
    if max_val < 0.01:
        max_val = 1.0  # avoid division by zero for empty poems

    # Scale factor: bring max to ~0.85
    scale = 0.85 / max_val if max_val > 0.85 else 1.0

    emotional_field = {}
    for field in ['longing', 'entropy', 'eros', 'warmth',
                  'ambiguity', 'transcendence', 'isolation', 'memoryPressure']:
        raw = field_accum.get(field, 0) * scale
        emotional_field[field] = round(min(1.0, max(0.0, raw)), 3)

    # ── 4. Dominant field ─────────────────────────────────────────────
    # Map EmotionalField fields to DominantField categories
    DOMINANT_MAP = {
        'longing':       'longing',
        'entropy':       'entropy',
        'eros':          'eros',
        'warmth':        'ecstasy',    # warmth peak = collective ecstasy
        'ambiguity':     'memory',     # ambiguity peak = dreamlike memory
        'transcendence': 'entropy',    # transcendence maps to distance/entropy
        'isolation':     'distance',
        'memoryPressure':'memory',
    }

    # Find top 2 fields — dominant is the primary, secondary creates topology
    sorted_fields = sorted(emotional_field.items(), key=lambda x: -x[1])
    top_field = sorted_fields[0][0] if sorted_fields else 'entropy'
    top_val = sorted_fields[0][1] if sorted_fields else 0
    second_field = sorted_fields[1][0] if len(sorted_fields) > 1 else top_field
    second_val = sorted_fields[1][1] if len(sorted_fields) > 1 else 0

    # If second is close to first (within 0.1), mark as ambiguous
    is_ambiguous = abs(top_val - second_val) < 0.1

    dominant = DOMINANT_MAP.get(top_field, 'entropy')

    # ── 5. Gravity mass ───────────────────────────────────────────────
    # High intensity (high max_val) + dense motifs → heavier gravity
    motif_density = len(detected_motifs) / 15  # normalized
    intensity = max(emotional_field.values())
    gravity_mass = 0.8 + (motif_density * 0.8) + (intensity * 0.9)
    gravity_mass = round(min(3.0, max(0.5, gravity_mass)), 2)

    # ── 6. Decay rate ─────────────────────────────────────────────────
    # High entropy + isolation → faster decay (colder)
    # High eros + warmth → slower decay (stays warm longer)
    cold_signal = emotional_field['entropy'] * 0.4 + emotional_field['isolation'] * 0.3
    warm_signal = emotional_field['eros'] * 0.4 + emotional_field['warmth'] * 0.3
    decay_rate = 0.04 + (cold_signal - warm_signal) * 0.04
    decay_rate = round(min(0.10, max(0.01, decay_rate)), 3)

    # ── 7. Tags ───────────────────────────────────────────────────────
    SPACE_MOTIFS  = {'phi_truong', 'bien', 'boston', 'song', 'khoang_cach'}
    SEASON_MOTIFS = {'mua_thu', 'mua_dong', 'mua_xuan', 'thang_nam', 'binh_minh', 'hoang_hon'}
    CORE_MOTIFS   = {'noi_nho', 'ky_uc', 'co_don', 'khao_khat', 'mat_mat',
                     'hon', 'giac_mo', 'siêu_viet', 'tu_do', 'tinh_yeu'}

    tags = {
        'space':  [m for m in detected_motifs if m in SPACE_MOTIFS],
        'season': [m for m in detected_motifs if m in SEASON_MOTIFS],
        'motif':  [m for m in detected_motifs if m in CORE_MOTIFS],
    }

    # ── 8. Confidence ─────────────────────────────────────────────────
    # High confidence when: many motifs detected, not too ambiguous
    confidence = min(1.0, (
        len(detected_motifs) / 8 * 0.5 +          # motif richness
        (1 - (0.2 if is_ambiguous else 0)) * 0.3 + # ambiguity penalty
        (top_val / 1.0) * 0.2                       # signal strength
    ))
    confidence = round(confidence, 2)

    # ── 9. Notes (curator guidance) ───────────────────────────────────
    notes_parts = []
    if is_ambiguous:
        notes_parts.append(
            f"Ambiguous split: {top_field}({top_val:.2f}) vs "
            f"{second_field}({second_val:.2f}) — needs human read."
        )
    if not detected_motifs:
        notes_parts.append("No strong motifs detected — abstract poem or uses unusual imagery.")
    if confidence < 0.4:
        notes_parts.append("Low confidence — prioritize for manual curation.")
    top_motifs = sorted(detected_motifs.items(), key=lambda x: -x[1])[:3]
    if top_motifs:
        notes_parts.append(f"Dominant motifs: {', '.join(f'{k}({v})' for k,v in top_motifs)}")

    notes = ' | '.join(notes_parts) if notes_parts else 'Inference stable.'

    return {
        'emotionalField': emotional_field,
        'dominantField': dominant,
        'gravityMass': gravity_mass,
        'decayRate': decay_rate,
        'motifs': {k: round(v, 3) for k, v in sorted(detected_motifs.items(), key=lambda x: -x[1])},
        'tags': tags,
        'confidence': confidence,
        'notes': notes,
    }

# ── Two-pass IDF normalization ────────────────────────────────────────────────

def recompute_dominant_by_deviation(poems_with_suggestions: list) -> None:
    """
    Pass 2: Compute corpus mean/std per field.
    Rewrite dominantField based on what's ABOVE corpus average (z-score),
    not just absolute max. This creates topology separation instead of one cluster.
    """
    fields = ['longing', 'entropy', 'eros', 'warmth',
              'ambiguity', 'transcendence', 'isolation', 'memoryPressure']

    # Compute corpus stats
    corpus_vals = {f: [] for f in fields}
    for p in poems_with_suggestions:
        ef = p['aiSuggestion']['emotionalField']
        for f in fields:
            corpus_vals[f].append(ef.get(f, 0))

    corpus_mean = {f: sum(v)/len(v) for f, v in corpus_vals.items()}
    corpus_std  = {
        f: math.sqrt(sum((x - corpus_mean[f])**2 for x in v) / len(v))
        for f, v in corpus_vals.items()
    }

    DOMINANT_MAP = {
        'longing':       'longing',
        'entropy':       'entropy',
        'eros':          'eros',
        'warmth':        'ecstasy',
        'ambiguity':     'memory',
        'transcendence': 'entropy',
        'isolation':     'distance',
        'memoryPressure':'memory',
    }

    for p in poems_with_suggestions:
        ef = p['aiSuggestion']['emotionalField']

        # Compute z-score per field (how distinctive above corpus)
        z_scores = {}
        for f in fields:
            std = corpus_std[f] if corpus_std[f] > 0.01 else 0.01
            z_scores[f] = (ef.get(f, 0) - corpus_mean[f]) / std

        # Store z-scores for curator inspection
        p['aiSuggestion']['corpusDeviation'] = {
            f: round(z_scores[f], 3) for f in fields
        }
        p['aiSuggestion']['corpusMean'] = {f: round(corpus_mean[f], 3) for f in fields}

        # Dominant = field with highest z-score (what's most unusual about this poem)
        top_by_deviation = sorted(z_scores.items(), key=lambda x: -x[1])
        top_dev_field    = top_by_deviation[0][0]
        top_dev_z        = top_by_deviation[0][1]

        # Fallback: if no field is above 0.3 z-score, use absolute max
        if top_dev_z < 0.3:
            abs_sorted = sorted(ef.items(), key=lambda x: -x[1])
            top_dev_field = abs_sorted[0][0]

        new_dominant = DOMINANT_MAP.get(top_dev_field, 'entropy')
        old_dominant = p['aiSuggestion']['dominantField']

        if new_dominant != old_dominant:
            p['aiSuggestion']['dominantField'] = new_dominant
            p['aiSuggestion']['notes'] = (
                p['aiSuggestion'].get('notes', '') +
                f" | Dominant revised by z-score: {top_dev_field} "
                f"(z={top_dev_z:.2f}, was {old_dominant})"
            )


# ── Main ─────────────────────────────────────────────────────────────────────

def main():
    with open(SRC, encoding='utf-8') as f:
        poems = json.load(f)

    print(f"Running emotional inference on {len(poems)} poems...")
    print()

    low_confidence = []

    # Pass 1: raw inference
    for poem in poems:
        suggestion = infer(poem)
        poem['aiSuggestion'] = suggestion

        if suggestion['confidence'] < 0.4:
            low_confidence.append((poem['title'], suggestion['confidence']))

    # Pass 2: IDF-style dominant field correction
    print("Pass 2: computing corpus deviation and correcting dominantField...")
    recompute_dominant_by_deviation(poems)

    with open(DST, 'w', encoding='utf-8') as f:
        json.dump(poems, f, ensure_ascii=False, indent=2)

    print(f"Written to poems-inferred.json")
    print()

    # Print summary
    print("── SAMPLE OUTPUT ──────────────────────────────────────────────")
    sample_seqs = [7, 36, 53, 80, 86, 90, 102]
    seq_map = {p.get('pdfSeq') or p.get('sequence'): p for p in poems}
    for seq in sample_seqs:
        p = seq_map.get(seq)
        if not p:
            continue
        s = p['aiSuggestion']
        ef = s['emotionalField']
        print(f"\n[{seq:3d}] {p['title']}")
        print(f"     dominant={s['dominantField']:12s} mass={s['gravityMass']} decay={s['decayRate']} conf={s['confidence']}")
        print(f"     longing={ef['longing']:.2f} entropy={ef['entropy']:.2f} "
              f"eros={ef['eros']:.2f} warmth={ef['warmth']:.2f} "
              f"isolation={ef['isolation']:.2f}")
        print(f"     motifs: {list(s['motifs'].keys())[:5]}")
        if s['notes'] != 'Inference stable.':
            print(f"     NOTE: {s['notes'][:100]}")

    print()
    print(f"── NEEDS CURATOR ATTENTION ({len(low_confidence)} poems, confidence < 0.4) ──")
    for title, conf in sorted(low_confidence, key=lambda x: x[1]):
        print(f"  [{conf:.2f}] {title}")

    # Print field distribution stats
    print()
    print("── FIELD DISTRIBUTION ACROSS ALL POEMS ─────────────────────")
    fields = ['longing', 'entropy', 'eros', 'warmth', 'ambiguity',
              'transcendence', 'isolation', 'memoryPressure']
    for field in fields:
        vals = [p['aiSuggestion']['emotionalField'][field] for p in poems]
        avg = sum(vals)/len(vals)
        mx = max(vals)
        mn = min(vals)
        bar = '█' * int(avg * 20) + '░' * (20 - int(avg * 20))
        print(f"  {field:15s} avg={avg:.2f} [{bar}] min={mn:.2f} max={mx:.2f}")

    # Dominant field distribution
    print()
    from collections import Counter
    doms = Counter(p['aiSuggestion']['dominantField'] for p in poems)
    print("── DOMINANT FIELD CLUSTERS ──────────────────────────────────")
    for dom, count in doms.most_common():
        bar = '█' * count
        print(f"  {dom:12s} {count:3d} {bar}")

if __name__ == '__main__':
    main()

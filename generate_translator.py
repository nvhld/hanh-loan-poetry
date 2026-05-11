import json

with open('anchor_mri.json', 'r') as f:
    mri_data = json.load(f)

mri_json_str = json.dumps(mri_data, ensure_ascii=False)

js_content = f"""/**
 * instrument_translator.js — Instrument Modal v0
 * MRI -> readable atmospheric language.
 * Template-based mapping. Lab mode only (12 anchors).
 */
(function() {{
  'use strict';

  const ANCHOR_12_IDS = new Set([
    '2016-008-vui',
    '2023-078-thoi-gian-va-tinh-yeu',
    '2022-038-binh-minh-em-va-hoang-hon-anh',
    '2020-020-boi-vi-em-yeu-anh',
    '2023-083-bon-mua-co-con-nhau',
    '2023-074-nang-i',
    '2022-040-hai-mien-thang-5',
    '2022-067-ben-nay-ben-kia',
    '2022-032-tra-anh-ve-phia-binh-minh',
    '2023-102-thang-12-cho-em',
    '2022-047-bay-gio-thang-tam-roi-anh',
    '2023-082-mua-he-o-boston'
  ]);

  const MOTION_MAP = {{
    "continuous deceleration": "forward motion gradually reduces.",
    "inward collapse": "imagery contracts inward.",
    "downward compression": "vertical pressure increases.",
    "sustained drag": "forward drag is sustained.",
    "staggered drop": "cadence drops unevenly.",
    "erratic pacing": "momentum fluctuates without pattern.",
    "sudden elongation": "spacing stretches unexpectedly.",
    "circular sweep": "movement arcs across the field.",
    "sustained orbital motion": "elements circle a hidden center.",
    "binary oscillation": "rhythm shifts between two states.",
    "rapid reset": "motion restarts abruptly.",
    "sequential progression": "progression remains linear.",
    "linear decay": "momentum fades linearly.",
    "stagnant hovering": "imagery hovers without forward drift.",
    "internal churning": "density churns internally.",
    "erratic disturbance": "field is erratically disturbed.",
    "binary split": "narrative line splits in two.",
    "spatial widening": "the field widens structurally.",
    "delayed bridging": "connection is noticeably delayed.",
    "downward release": "weight releases downward.",
    "fading trajectory": "trajectory slowly fades.",
    "vertical descent": "movement drops vertically.",
    "abrupt truncation": "cadence is abruptly truncated.",
    "circular questioning": "returns to the point of origin.",
    "static anticipation": "field holds in static anticipation.",
    "lateral drift across memory": "drifts laterally across the plane.",
    "heavy grounding": "imagery anchors heavily.",
    "loss of mass": "structural mass dissipates.",
    "floating suspension": "elements suspend without gravity.",
    "repetition drag": "repetition drags the primary cadence.",
    "terminal abstraction shift": "motion shifts into terminal abstraction.",
    "steady state drag": "drag reaches a steady state.",
    "high density repetition": "repetition creates high density entry."
  }};

  const WEATHER_MAP = {{
    "heavy layering": "density increases through heavy layering.",
    "rapid thermal reduction": "thermal state reduces rapidly.",
    "terminal reduction zone": "field enters a terminal reduction zone.",
    "gradual thermal reduction": "temperature reduces gradually.",
    "unstable thermal retention": "thermal retention remains unstable.",
    "compressed thermal field": "thermal field remains compressed.",
    "suspension of silence": "silence is suspended mid-field.",
    "structural deceleration": "structure decelerates visibly.",
    "semantic deceleration": "meaning slows down through repetition.",
    "locational density anchoring": "density anchors to specific locations.",
    "cyclical unresolved return": "returns cyclically without resolution.",
    "static temporal hold": "time holds statically in the field.",
    "suspended terminal cadence": "terminal cadence remains suspended."
  }};

  function translate(array, map, defaultPhrase) {{
    if (!array || array.length === 0) return "";
    let result = [];
    for (const item of array) {{
      let matched = false;
      for (const [key, val] of Object.entries(map)) {{
        if (item.toLowerCase().includes(key.toLowerCase())) {{
          result.push(val);
          matched = true;
          break;
        }}
      }}
      if (!matched && defaultPhrase) result.push(defaultPhrase);
    }}
    return [...new Set(result)].join("\\n\\n");
  }}

  function generateInstrumentText(mri) {{
    // 1. drift
    let driftItems = [];
    if (mri.temporalBehavior) {{
      if (mri.temporalBehavior.entryState) driftItems.push(mri.temporalBehavior.entryState);
      if (mri.temporalBehavior.midfieldShift) driftItems.push(mri.temporalBehavior.midfieldShift);
      if (mri.temporalBehavior.terminalBehavior) driftItems.push(mri.temporalBehavior.terminalBehavior);
    }}
    if (mri.fieldDynamics) {{
      if (mri.fieldDynamics.motionTrend) driftItems.push(...mri.fieldDynamics.motionTrend);
      if (mri.fieldDynamics.gravityBehavior) driftItems.push(...mri.fieldDynamics.gravityBehavior);
      if (mri.fieldDynamics.cadenceShift) driftItems.push(...mri.fieldDynamics.cadenceShift);
    }}
    let driftText = translate(driftItems, MOTION_MAP, "motion maintains current state.") || "motion maintains current state.";

    // 2. pressure
    let pressureItems = [];
    if (mri.structuralWeather) {{
      if (mri.structuralWeather.densityBehavior) pressureItems.push(mri.structuralWeather.densityBehavior);
      if (mri.structuralWeather.thermalState) pressureItems.push(mri.structuralWeather.thermalState);
      if (mri.structuralWeather.silenceType) pressureItems.push(mri.structuralWeather.silenceType);
    }}
    if (mri.silenceProfile) {{
      if (mri.silenceProfile.structuralDeceleration) pressureItems.push(...mri.silenceProfile.structuralDeceleration);
      if (mri.silenceProfile.semanticDeceleration) pressureItems.push(...mri.silenceProfile.semanticDeceleration);
    }}
    let pressureText = translate(pressureItems, WEATHER_MAP, "pressure holds steady.") || "pressure holds steady.";

    // 3. absence
    let absenceText = "";
    if (mri.absenceProfile) {{
      let suppressed = mri.absenceProfile.suppressedObjects || [];
      let missing = mri.absenceProfile.missingReturns || [];
      let dropped = mri.absenceProfile.droppedContinuities || [];
      
      let lines = [];
      if (suppressed.length > 0) {{
        lines.push(`initial imagery of [${{suppressed.join(", ")}}] is suppressed.`);
      }}
      if (missing.length > 0) {{
        lines.push(`[${{missing.join(", ")}}] does not return.`);
      }}
      if (dropped.length > 0) {{
        lines.push(`continuity breaks around [${{dropped.join(", ")}}].`);
      }}
      
      if (lines.length > 0) {{
        absenceText = lines.join("\\n\\n");
      }} else {{
        absenceText = "no structural absences detected.";
      }}
    }} else {{
      absenceText = "no structural absences detected.";
    }}

    return {{ drift: driftText, pressure: pressureText, absence: absenceText }};
  }}

  function injectStyles() {{
    if (document.getElementById('im-style')) return;
    const s = document.createElement('style');
    s.id = 'im-style';
    s.textContent = `
      #im-overlay {{
        position: fixed;
        inset: 0;
        z-index: 9999;
        display: flex;
        align-items: flex-start;
        justify-content: center;
        padding-top: 14vh;
        background: rgba(0, 0, 0, 0.22);
        backdrop-filter: blur(2px);
        -webkit-backdrop-filter: blur(2px);
        opacity: 0;
        pointer-events: none;
        transition: opacity 900ms ease;
      }}
      #im-overlay.im-visible {{
        opacity: 1;
        pointer-events: auto;
      }}
      .im-modal {{
        width: 100%;
        max-width: 480px;
        background: rgba(7, 7, 10, 0.82);
        backdrop-filter: blur(14px);
        -webkit-backdrop-filter: blur(14px);
        border: 1px solid rgba(255, 255, 255, 0.06);
        padding: 40px;
        color: #fff;
        cursor: default;
      }}
      .im-label {{
        font-family: 'Outfit', sans-serif;
        font-size: 10px;
        letter-spacing: 0.22em;
        text-transform: lowercase;
        opacity: 0.34;
        margin-bottom: 12px;
      }}
      .im-body {{
        font-family: 'Playfair Display', serif;
        font-size: 14px;
        line-height: 1.9;
        opacity: 0.78;
        white-space: pre-wrap;
      }}
      #whisper-note {{
        cursor: pointer;
        pointer-events: auto;
      }}
      #whisper-note:hover {{
        opacity: 1 !important;
      }}
    `;
    document.head.appendChild(s);
  }}

  // Inline MRI Data
  const _mriData = {mri_json_str};
  let _el = null;

  function showModal(poemId) {{
    if (!_mriData || !_mriData[poemId]) return;
    
    injectStyles();
    if (_el) dismissModal(true);
    
    const textData = generateInstrumentText(_mriData[poemId]);

    const overlay = document.createElement('div');
    overlay.id = 'im-overlay';
    
    // Uneven rhythm
    overlay.innerHTML = `
      <div class="im-modal">
        <div class="im-section" style="margin-bottom: 24px;">
          <div class="im-label">drift</div>
          <div class="im-body">${{textData.drift}}</div>
        </div>
        <div class="im-section" style="margin-bottom: 38px;">
          <div class="im-label">pressure</div>
          <div class="im-body">${{textData.pressure}}</div>
        </div>
        <div class="im-section" style="margin-bottom: 31px;">
          <div class="im-label">absence</div>
          <div class="im-body">${{textData.absence}}</div>
        </div>
      </div>
    `;

    document.body.appendChild(overlay);
    _el = overlay;

    requestAnimationFrame(() => requestAnimationFrame(() => {{
      overlay.classList.add('im-visible');
    }}));

    const closeHandler = (e) => {{
      if (!e.target.closest('.im-modal')) {{
        dismissModal();
      }}
    }};
    overlay.addEventListener('click', closeHandler);

    const escHandler = (e) => {{
      if (e.key === 'Escape') {{
        dismissModal();
        document.removeEventListener('keydown', escHandler);
      }}
    }};
    document.addEventListener('keydown', escHandler);
  }}

  function dismissModal(instant = false) {{
    if (!_el) return;
    const el = _el;
    _el = null;
    
    el.classList.remove('im-visible');
    setTimeout(() => {{
      if (el.parentNode) el.parentNode.removeChild(el);
    }}, instant ? 0 : 900);
  }}

  function setupWhisperBinding() {{
    const whisperEl = document.getElementById('whisper-note');
    if (whisperEl) {{
      whisperEl.style.cursor = 'pointer';
      whisperEl.style.pointerEvents = 'auto';
      whisperEl.addEventListener('click', (e) => {{
        e.stopPropagation();
        if (window.selPoem && window.selPoem.id && ANCHOR_12_IDS.has(window.selPoem.id)) {{
          showModal(window.selPoem.id);
        }}
      }});
    }}
  }}

  // In reader.html, poem might open later. So we should re-bind or just delegate from document.
  // Actually, whisperEl is always in DOM, it just gets populated. We can bind once.
  if (document.readyState === 'loading') {{
    document.addEventListener('DOMContentLoaded', setupWhisperBinding);
  }} else {{
    setupWhisperBinding();
  }}

}})();
"""

with open('instrument_translator.js', 'w') as f:
    f.write(js_content)


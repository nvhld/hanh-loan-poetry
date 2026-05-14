/**
 * instrument_translator.js — MRI → Instrument Modal text
 *
 * Architecture: anchor_mri.json data → translateMRI() → 3 text blocks
 * Rules:
 *   - Template-based mappings only. No generative prose.
 *   - No interpretation. No sentiment. No literary claim.
 *   - Output: compressed observational fragments.
 *   - Lab mode: 12 anchor poems only.
 */

(function () {
  'use strict';

  // ── TRANSLATION MAPS ──────────────────────────────────────────────────────

  const MOTION_MAP = {
    'continuous deceleration':       'forward motion reduces',
    'inward collapse':               'image field contracts',
    'erratic pacing':                'interval instability detected',
    'sudden elongation':             'line duration extends',
    'circular sweep':                'closed-path motion detected',
    'sustained orbital motion':      'bounded loop persists',
    'binary oscillation':            'two-state oscillation detected',
    'rapid reset':                   'motion resets without accumulation',
    'sequential progression':        'stepwise progression holds',
    'linear decay':                  'linear decay detected',
    'stagnant hovering':             'motion hold detected',
    'internal churning':             'subsurface motion detected',
    'erratic disturbance':           'motion interruption detected',
    'binary split':                  'field vector splits',
    'spatial widening':              'field width increases',
    'delayed bridging':              'connection delay detected',
    'downward release':              'downward release detected',
    'fading trajectory':             'trajectory fades',
    'vertical descent':              'vertical descent detected',
    'abrupt truncation':             'motion truncates',
    'circular questioning':          'cadence loop persists',
    'static anticipation':           'pre-event hold detected',
    'lateral drift across memory':   'lateral memory drift',
    'locational density anchoring':  'place-node drag',
    'heavy grounding':               'grounding drag persists',
  };

  const GRAVITY_MAP = {
    'downward compression':          'lower-zone weight increases',
    'sustained drag':                'field resistance persists',
    'mid-stanza density drop':       'midpoint density drops',
    'horizontal drift':              'lateral mass distribution',
    'shallow drop':                  'low-intensity gravity',
    'heavy localized compression':   'fixed-point compression',
    'lateral tension':               'lateral tension detected',
    'low gravity, distance scaling': 'distance weakens gravity',
    'structural reduction':          'mass loss progresses',
    'loss of mass':                  'mass loss progresses',
    'descending drop':               'one-way descent',
    'heavy top, sparse bottom':      'entry density elevated',
    'static temporal hold':          'temporal mass holds',
    'anchored wait':                 'temporal mass holds',
    'steady downward shift':         'downward shift persists',
    'high gravity anchoring at locational nouns': 'place-name gravity elevated',
  };

  const DENSITY_MAP = {
    'heavy layering':        'field density stacked',
    'uneven compression':    'zone compression uneven',
    'even distribution':     'density evenly distributed',
    'sparse arrangement':    'density remains low',
    'structured fading':     'density fades by steps',
    'high internal density': 'internal density elevated',
    'fragmented':            'density fragments',
    'low density spread':    'low-density spread',
    'emptying state':        'density drains',
    'funneling down':        'terminal density convergence',
    'moderate density':      'mid-density hold',
    'dense narrative blocks':'long-block density elevated',
  };

  const THERMAL_MAP = {
    'gradual thermal reduction':    'slow thermal reduction',
    'rapid thermal reduction':      'rapid thermal drop',
    'sustained thermal state':      'thermal level holds',
    'sustained warmth':             'thermal level holds',
    'neutral thermal fluctuation':  'thermal drift neutral',
    'compressed thermal field':     'thermal range compressed',
    'high thermal volatility':      'thermal volatility elevated',
    'low thermal persistence':      'thermal persistence low',
    'unstable thermal retention':   'thermal retention unstable',
    'cooling nostalgia':            'slow thermal reduction',
    'deep freeze':                  'rapid thermal drop',
    'suppressed heat':              'thermal range compressed',
    'chilled stabilization':        'thermal level holds',
  };

  const STRUCTURAL_DEC_MAP = {
    'ellipsis terminal marker':       'terminal ellipsis active',
    'parenthetical isolation':        'parenthetical isolation detected',
    'parenthetical containment':      'sub-field contained',
    'vertical line breaks':           'vertical spacing elevated',
    'spacing drag':                   'spacing drag detected',
    'parenthetical opening':          'opening parenthetical isolates field',
    'ellipsis elongation':            'pause duration extends',
    'irregular line breaking':        'line-break interval irregular',
  };

  const SEMANTIC_DEC_MAP = {
    'image accumulation':                                'image density increases',
    'repeated address':                                  'address recurrence detected',
    "repeated address 'Nàng'":                           'address recurrence elevated',
    "repeated address 'Xin tháng 5'":                   'month-address recurrence',
    "repeated address 'tháng Tám'":                     'month-address recurrence',
    'unresolved object return':                          'object return incomplete',
    'delayed semantic closure':                          'semantic closure delayed',
    "delayed semantic closure via 'vùi' repetition":    'verb repetition drag',
    'long-line reading friction':                        'line friction elevated',
    "interrogative pause":                               'interrogative suspension',
  };

  const UNRESOLVED_CADENCE_MAP = {
    "delayed return at 'xa xăm'": 'terminal aperture open',
    'hanging interrogative state': 'interrogative hold',
    'circular unresolved loop at end': 'terminal loop unresolved',
    'conditional loop closure': 'conditional closure pending',
    'final imperative introduces sudden halt': 'terminal halt abrupt',
    'hanging query': 'query suspension',
    'spatial division at end': 'terminal split detected',
    'open spatial wait': 'spatial wait open',
    "conditional 'Nếu' ending creates unresolved state": 'conditional marker suspended',
    'isolated syllables hanging in void': 'terminal syllables detached',
    'suspended terminal cadence': 'terminal cadence suspended',
    'cyclical unresolved return': 'cyclic return unresolved',
  };

  const ABSENCE_MAP_SUPPRESSED  = 'late absence detected';
  const ABSENCE_MAP_MISSING     = 'return incomplete';
  const ABSENCE_MAP_CONTINUITY  = 'sequence break';
  const SECTION_LIMITS = {
    drift: 11,
    pressure: 14,
    absence: 12,
  };
  const BANNED_CADENCE = [
    /\bwhile\b/i,
    /\bas if\b/i,
    /\bmaintaining\b/i,
    /\bdrifting toward\b/i,
    /\bcontinues\b/i,
    /\bremembers\b/i,
  ];
  const HUMILITY_BLOCKLIST = [
    /\bsymboli[sz]es?\b/i,
    /\brepresents?\b/i,
    /\bmeans?\b/i,
    /\bthe poem\b/i,
    /\bthe speaker feels\b/i,
    /\bemotional collapse\b/i,
    /\bproves?\b/i,
  ];

  // ── HELPERS ───────────────────────────────────────────────────────────────

  function mapToken(token, map) {
    return map[token] || null;
  }

  function renderList(tokens, map) {
    return tokens.map(t => mapToken(t, map)).filter(Boolean);
  }

  function sentence(s) {
    if (!s) return '';
    s = s.charAt(0).toLowerCase() + s.slice(1);
    if (!s.endsWith('.')) s += '.';
    return s;
  }

  function passesHumilityFilter(line) {
    return !!line
      && !HUMILITY_BLOCKLIST.some(pattern => pattern.test(line))
      && !BANNED_CADENCE.some(pattern => pattern.test(line));
  }

  function countWords(line) {
    return String(line).trim().split(/\s+/).filter(Boolean).length;
  }

  function enforceWordLimit(line, maxWords) {
    const words = String(line).trim().split(/\s+/).filter(Boolean);
    if (words.length <= maxWords) return line;
    return words.slice(0, maxWords).join(' ').replace(/[,.]*$/, '') + '.';
  }

  function filterHumility(lines, lineLimit = 4, wordLimit = 14) {
    return lines
      .map(line => line.trim())
      .filter(passesHumilityFilter)
      .map(line => enforceWordLimit(line, wordLimit))
      .filter(line => countWords(line) <= wordLimit)
      .slice(0, lineLimit);
  }

  function hashPoemId(poemId) {
    let hash = 2166136261;
    String(poemId || '').split('').forEach(ch => {
      hash ^= ch.charCodeAt(0);
      hash = Math.imul(hash, 16777619);
    });
    return hash >>> 0;
  }

  function deriveCadence(context) {
    const whisper = String(context.whisperText || '');
    const whisperWords = whisper.trim().split(/\s+/).filter(Boolean);
    const compactWhisper = whisperWords.length > 0 && whisperWords.length <= 9;
    const slowWhisper = /đứng yên|im lặng|lâu|chậm|nín|đợi/i.test(whisper);
    const slow = compactWhisper || slowWhisper;
    return {
      maxLines: slow ? 2 : 4,
      scanDelayMs: slow ? 520 : 0,
      sectionStaggerMs: slow ? 420 : 280,
      sectionFadeMs: slow ? 1400 : 1100,
    };
  }

  function deriveInstability(poemId) {
    const score = hashPoemId(poemId) % 100;
    return {
      score,
      driftFragment: score < 14,
      message: score % 2 === 0
        ? 'signal continuity partially lost...'
        : 'structural residue degraded before scan completion.',
    };
  }

  function isSilenceHeavy(mri) {
    const sw = mri.structuralWeather || {};
    const sp = mri.silenceProfile || {};
    return !!sw.silenceType || (sp.structuralDeceleration || []).length > 0 || (sp.unresolvedCadence || []).length > 0;
  }

  // ── SECTION BUILDERS ──────────────────────────────────────────────────────

  /** SECTION A — drift: field motion + temporal arc */
  function buildDrift(mri, cadence) {
    const lines = [];
    const fd = mri.fieldDynamics || {};
    const tb = mri.temporalBehavior || {};

    const motions = renderList(fd.motionTrend || [], MOTION_MAP);
    if (motions[0]) lines.push(sentence(motions[0]));
    if (motions[1]) lines.push(sentence(motions[1]));

    const gravities = renderList(fd.gravityBehavior || [], GRAVITY_MAP);
    if (gravities.length) lines.push(sentence(gravities[0]));

    if (tb.entryState)       lines.push(sentence('entry: ' + tb.entryState));
    if (tb.terminalBehavior) lines.push(sentence('terminal: ' + tb.terminalBehavior));

    return filterHumility(lines, cadence.maxLines, SECTION_LIMITS.drift);
  }

  /** SECTION B — pressure: structural weather + silence */
  function buildPressure(mri, cadence) {
    const lines = [];
    const sw = mri.structuralWeather || {};
    const sp = mri.silenceProfile || {};

    const thermal = mapToken(sw.thermalState, THERMAL_MAP);
    if (thermal) lines.push(sentence(thermal));

    const density = mapToken(sw.densityBehavior, DENSITY_MAP);
    if (density) lines.push(sentence(density));

    const strDec = (sp.structuralDeceleration || []).map(t => mapToken(t, STRUCTURAL_DEC_MAP)).filter(Boolean);
    if (strDec.length) lines.push(sentence(strDec[0]));

    const semDec = (sp.semanticDeceleration || []).map(t => mapToken(t, SEMANTIC_DEC_MAP)).filter(Boolean);
    if (semDec.length) lines.push(sentence(semDec[0]));

    const uc = sp.unresolvedCadence || [];
    const translatedUc = renderList(uc, UNRESOLVED_CADENCE_MAP);
    if (translatedUc.length) lines.push(sentence(translatedUc[0]));

    return filterHumility(lines, cadence.maxLines, SECTION_LIMITS.pressure);
  }

  /** SECTION C — absence: voids and dropped continuities */
  function buildAbsence(mri, cadence, instability, silenceHeavy, familiar) {
    const lines = [];
    const ab = mri.absenceProfile || {};

    (ab.suppressedObjects || []).forEach(obj => {
      lines.push(sentence(`'${obj}' ${ABSENCE_MAP_SUPPRESSED}`));
    });
    (ab.missingReturns || []).forEach(ret => {
      lines.push(sentence(`'${ret}' ${ABSENCE_MAP_MISSING}`));
    });
    (ab.droppedContinuities || []).forEach(cont => {
      lines.push(sentence(`${cont} ${ABSENCE_MAP_CONTINUITY}`));
    });

    if (instability.driftFragment && !familiar) {
      return [instability.message];
    }

    const filtered = filterHumility(lines, cadence.maxLines, SECTION_LIMITS.absence);
    return silenceHeavy ? filtered.slice(0, 1) : filtered;
  }

  // ── PUBLIC API ────────────────────────────────────────────────────────────

  /**
   * translateMRI(mriData)
   * @param {Object} mriData — one poem entry from anchor_mri.json
   * @returns {{ drift: string[], pressure: string[], absence: string[] }}
   */
  function translateMRI(mriData, context = {}) {
    if (!mriData) return { drift: [], pressure: [], absence: [], meta: {} };
    const cadence = deriveCadence(context);
    const instability = deriveInstability(context.poemId);
    const familiar = Number(context.familiarityLevel || 0) >= 0.15;
    const entropyHeavy = context.dominantField === 'entropy' || Number(context.entropy || 0) >= 0.72;
    const silenceHeavy = isSilenceHeavy(mriData);
    const omittedSections = entropyHeavy ? ['pressure'] : [];
    const scanMessage = context.falseRecognition
      ? 'field signature weakly recognized...'
      : familiar
        ? 'field signature partially recognized...'
        : instability.driftFragment
          ? 'structural residue degraded before scan completion.'
          : 'structural compression stabilizing...';

    return {
      drift:    buildDrift(mriData, cadence),
      pressure: omittedSections.includes('pressure') ? [] : buildPressure(mriData, cadence),
      absence:  buildAbsence(mriData, cadence, instability, silenceHeavy, familiar),
      meta: {
        omittedSections,
        scanMessage,
        scanDelayMs: cadence.scanDelayMs,
        residueDelayMs: context.scanFatigueLevel ? 180 : 0,
        sectionStaggerMs: cadence.sectionStaggerMs,
        sectionFadeMs: cadence.sectionFadeMs,
        instabilityScore: instability.score,
      },
    };
  }

  window.InstrumentTranslator = { translateMRI };

})();

/**
 * instrument_translator.js — MRI → Instrument Modal text
 *
 * Architecture: anchor_mri.json data → translateMRI() → 3 text blocks
 * Rules:
 *   - Template-based mappings only. No generative prose.
 *   - No interpretation. No sentiment. No literary claim.
 *   - Output: short, quiet, observatory sentences.
 *   - Lab mode: 12 anchor poems only.
 */

(function () {
  'use strict';

  // ── TRANSLATION MAPS ──────────────────────────────────────────────────────

  const MOTION_MAP = {
    'continuous deceleration':       'forward motion gradually reduces',
    'inward collapse':               'imagery contracts inward',
    'erratic pacing':                'motion shifts without consistent interval',
    'sudden elongation':             'line duration extends unexpectedly',
    'circular sweep':                'motion traces a closed path',
    'sustained orbital motion':      'forward drift remains in low orbit',
    'binary oscillation':            'motion alternates between two fixed states',
    'rapid reset':                   'motion returns to start without accumulation',
    'sequential progression':        'motion advances step by step',
    'linear decay':                  'motion reduces at a steady rate',
    'stagnant hovering':             'motion holds without advancing',
    'internal churning':             'internal motion detected beneath surface stillness',
    'erratic disturbance':           'motion is periodically interrupted',
    'binary split':                  'field divides into two opposing vectors',
    'spatial widening':              'field expands outward',
    'delayed bridging':              'connection is deferred',
    'downward release':              'trajectory moves toward lower mass',
    'fading trajectory':             'motion reduces toward zero',
    'vertical descent':              'motion follows a downward vertical path',
    'abrupt truncation':             'motion stops without transitional decay',
    'circular questioning':          'cadence loops without forward resolution',
    'static anticipation':           'motion holds in a pre-event state',
    'lateral drift across memory':   'motion moves sideways through accumulated imagery',
    'locational density anchoring':  'motion slows at place-name nodes',
    'heavy grounding':               'motion slows at place-name nodes',
  };

  const GRAVITY_MAP = {
    'downward compression':          'weight accumulates toward lower zones',
    'sustained drag':                'resistance persists across field',
    'mid-stanza density drop':       'field density reduces at midpoint',
    'horizontal drift':              'mass distributes laterally',
    'shallow drop':                  'gravity present but low intensity',
    'heavy localized compression':   'mass concentrates at fixed point',
    'lateral tension':               'opposing forces pull horizontally',
    'low gravity, distance scaling': 'gravity weakens as distance increases',
    'structural reduction':          'field loses mass progressively',
    'loss of mass':                  'field loses mass progressively',
    'descending drop':               'mass falls without return',
    'heavy top, sparse bottom':      'density concentrated at entry, sparse at terminal',
    'static temporal hold':          'mass stays fixed across time',
    'anchored wait':                 'mass stays fixed across time',
    'steady downward shift':         'mass moves steadily downward',
    'high gravity anchoring at locational nouns': 'place-names act as weight centers',
  };

  const DENSITY_MAP = {
    'heavy layering':        'density stacks across the full field',
    'uneven compression':    'density is inconsistent between zones',
    'even distribution':     'density spreads without clustering',
    'sparse arrangement':    'density remains low throughout',
    'structured fading':     'density reduces in measurable steps',
    'high internal density': 'density concentrates inward',
    'fragmented':            'density distributes in isolated clusters',
    'low density spread':    'density covers area at low concentration',
    'emptying state':        'density decreases without recovery',
    'funneling down':        'density converges toward terminal zone',
    'moderate density':      'density holds at mid-range',
    'dense narrative blocks':'density clusters in long continuous units',
  };

  const THERMAL_MAP = {
    'gradual thermal reduction':    'thermal state reduces at slow rate',
    'rapid thermal reduction':      'thermal state drops sharply',
    'sustained thermal state':      'thermal level holds without shift',
    'sustained warmth':             'thermal level holds without shift',
    'neutral thermal fluctuation':  'thermal state moves without fixed direction',
    'compressed thermal field':     'thermal range is narrow',
    'high thermal volatility':      'thermal state shifts rapidly',
    'low thermal persistence':      'thermal level does not hold',
    'unstable thermal retention':   'thermal state holds intermittently',
    'cooling nostalgia':            'thermal state reduces at slow rate',
    'deep freeze':                  'thermal state drops sharply',
    'suppressed heat':              'thermal range is narrow',
    'chilled stabilization':        'thermal level holds without shift',
  };

  const STRUCTURAL_DEC_MAP = {
    'ellipsis terminal marker':       'ellipsis holds the line open at terminal',
    'parenthetical isolation':        'parenthetical separates a segment from the main field',
    'parenthetical containment':      'parenthetical contains an isolated sub-field',
    'vertical line breaks':           'line breaks extend vertical spacing',
    'spacing drag':                   'spacing slows reading pace',
    'parenthetical opening':          'poem opens inside a parenthetical',
    'ellipsis elongation':            'ellipsis extends pause duration',
    'irregular line breaking':        'line breaks occur at irregular intervals',
  };

  const SEMANTIC_DEC_MAP = {
    'image accumulation':                                'imagery density increases without release',
    'repeated address':                                  'direct address recurs at intervals',
    "repeated address 'Nàng'":                           'subject address repeats, anchoring structural weight',
    "repeated address 'Xin tháng 5'":                   'month-address repeats as structural anchor',
    "repeated address 'tháng Tám'":                     'month-address repeats at entry and midfield',
    'unresolved object return':                          'object introduced but does not complete return path',
    'delayed semantic closure':                          'semantic resolution is deferred toward terminal',
    "delayed semantic closure via 'vùi' repetition":    'verb repetition delays semantic closure',
    'long-line reading friction':                        'extended line length increases reading resistance',
    "interrogative pause":                               'question structure suspends forward motion',
  };

  const UNRESOLVED_CADENCE_MAP = {
    "delayed return at 'xa xăm'": 'terminal state remains open',
    'hanging interrogative state': 'question structure holds cadence open',
    'circular unresolved loop at end': 'motion loops without terminal closure',
    'conditional loop closure': 'terminal cadence remains conditionally open',
    'final imperative introduces sudden halt': 'abrupt structural stop at terminal',
    'hanging query': 'cadence suspends on interrogative',
    'spatial division at end': 'terminal state splits structurally',
    'open spatial wait': 'cadence holds in empty space',
    "conditional 'Nếu' ending creates unresolved state": 'conditional marker suspends closure',
    'isolated syllables hanging in void': 'terminal syllables detach from main structure',
    'suspended terminal cadence': 'cadence halts without resolving',
    'cyclical unresolved return': 'terminal loops back without closure',
  };

  const ABSENCE_MAP_SUPPRESSED  = 'introduced early, absent from terminal field';
  const ABSENCE_MAP_MISSING     = 'trajectory initiated, not completed';
  const ABSENCE_MAP_CONTINUITY  = 'sequence broken before reaching endpoint';
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
    return !!line && !HUMILITY_BLOCKLIST.some(pattern => pattern.test(line));
  }

  function filterHumility(lines) {
    return lines
      .map(line => line.trim())
      .filter(passesHumilityFilter)
      .slice(0, 4);
  }

  // ── SECTION BUILDERS ──────────────────────────────────────────────────────

  /** SECTION A — drift: field motion + temporal arc */
  function buildDrift(mri) {
    const lines = [];
    const fd = mri.fieldDynamics || {};
    const tb = mri.temporalBehavior || {};

    const motions = renderList(fd.motionTrend || [], MOTION_MAP);
    if (motions.length === 1) lines.push(sentence(motions[0]));
    else if (motions.length >= 2) lines.push(sentence(motions[0] + ', while ' + motions[1]));

    const gravities = renderList(fd.gravityBehavior || [], GRAVITY_MAP);
    if (gravities.length) lines.push(sentence(gravities[0]));

    if (tb.entryState)       lines.push(sentence('entry: ' + tb.entryState));
    if (tb.terminalBehavior) lines.push(sentence('terminal: ' + tb.terminalBehavior));

    return filterHumility(lines);
  }

  /** SECTION B — pressure: structural weather + silence */
  function buildPressure(mri) {
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

    return filterHumility(lines);
  }

  /** SECTION C — absence: voids and dropped continuities */
  function buildAbsence(mri) {
    const lines = [];
    const ab = mri.absenceProfile || {};

    (ab.suppressedObjects || []).forEach(obj => {
      lines.push(sentence(`'${obj}' — ${ABSENCE_MAP_SUPPRESSED}`));
    });
    (ab.missingReturns || []).forEach(ret => {
      lines.push(sentence(`'${ret}' — ${ABSENCE_MAP_MISSING}`));
    });
    (ab.droppedContinuities || []).forEach(cont => {
      lines.push(sentence(`${cont} — ${ABSENCE_MAP_CONTINUITY}`));
    });

    return filterHumility(lines);
  }

  // ── PUBLIC API ────────────────────────────────────────────────────────────

  /**
   * translateMRI(mriData)
   * @param {Object} mriData — one poem entry from anchor_mri.json
   * @returns {{ drift: string[], pressure: string[], absence: string[] }}
   */
  function translateMRI(mriData) {
    if (!mriData) return { drift: [], pressure: [], absence: [] };
    return {
      drift:    buildDrift(mriData),
      pressure: buildPressure(mriData),
      absence:  buildAbsence(mriData),
    };
  }

  window.InstrumentTranslator = { translateMRI };

})();

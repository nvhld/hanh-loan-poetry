const poems = JSON.parse(JSON.stringify(POEMS_DATA));
try {
  const saved = localStorage.getItem('hanh-loan-curation-v1');
  if (saved) {
    const savedMap = JSON.parse(saved);
    poems.forEach(p => {
      if (savedMap[p.id]) {
        p.curatorOverride = savedMap[p.id].curatorOverride;
        p.curated = savedMap[p.id].curated;
      }
    });
  }
} catch(e) {}

const DOM_COLORS = {
  longing:'#2cb67d', eros:'#ff5470', entropy:'#a484e9',
  memory:'#fbc33c', distance:'#3a86ff', ecstasy:'#ff9f1c'
};
const DOM_LABELS = {
  longing:'Nỗi nhớ', eros:'Eros', entropy:'Tan rã',
  memory:'Ký ức', distance:'Xa cách', ecstasy:'Xuất thần'
};
const FIELD_COLORS = {
  longing:'#448aff', entropy:'#b388ff', eros:'#ff5252', warmth:'#ffab40',
  ambiguity:'#b0bec5', transcendence:'#18ffff', isolation:'#69f0ae', memoryPressure:'#ffd740'
};
const FIELD_LABELS = {
  longing:'Nỗi nhớ', entropy:'Tan rã', eros:'Eros', warmth:'Ấm áp',
  ambiguity:'Lưỡng lự', transcendence:'Siêu thoát', isolation:'Cô lập', memoryPressure:'Ký ức đè'
};
const FIELDS = ['longing','entropy','eros','warmth','ambiguity','transcendence','isolation','memoryPressure'];



let isMobile = window.innerWidth <= 768;
window.addEventListener('resize', () => isMobile = window.innerWidth <= 768);

let appState = 'entry'; // 'entry', 'dream', 'reading'
let readPoemNode = null; 

// Setup Entry Screen
const randomPoem = poems[Math.floor(Math.random() * poems.length)];
const lines = randomPoem.content ? randomPoem.content.split('\n').filter(l => l.trim().length > 10) : [];
const randomLine = lines.length > 0 ? lines[Math.floor(Math.random() * lines.length)] : "Khoảng không lặng im";
document.getElementById('entry-poem').innerText = '"' + randomLine.trim() + '"';

document.getElementById('entry-screen').addEventListener('click', () => {
  if (appState !== 'entry') return;
  const entry = document.getElementById('entry-screen');
  entry.style.opacity = '0';
  appState = 'dream';
  setTimeout(() => entry.style.display = 'none', 3000);
});

document.getElementById('reader-exit').addEventListener('click', () => {
  appState = 'dream';
  readPoemNode = null;
  document.getElementById('reader-layer').classList.remove('active');
});

let selectedPoem = null;
let nodePositions = [];
let hoveredIdx = null;

// ── ATTENTION COOLING (Mode B — ritual, not physical) ─────────────────────
// A poem doesn't age when unread. It sleeps.
// Decay only occurs when consciousness returns to face it.
const sessionAttention = {}; // poemId → cumulative seconds of hover attention

let _hoverTimer = null;
let _hoverPoemId = null;

function startAttention(poemId) {
  if (_hoverPoemId === poemId) return;
  stopAttention();
  _hoverPoemId = poemId;
  _hoverTimer = setInterval(() => {
    sessionAttention[poemId] = (sessionAttention[poemId] || 0) + 0.1;
  }, 100);
}

function stopAttention() {
  if (_hoverTimer) { clearInterval(_hoverTimer); _hoverTimer = null; }
  _hoverPoemId = null;
}

function boostAttention(poemId, seconds = 6) {
  sessionAttention[poemId] = Math.min(30, (sessionAttention[poemId] || 0) + seconds);
}

// warmth ∈ [0,1]: logarithmic curve — 'sáng' lingers much longer than 'thức dần'
// raw attention seconds → logarithmic warmth so early warmth comes fast,
// but the top tier (sáng > 0.7) requires sustained presence.
function getWarmth(p) {
  const s = sessionAttention[p.id] || 0;
  // log curve: warm at ~4s, 'sáng' at ~12s, saturates ~30s
  return Math.min(1, Math.log(1 + s * 0.4) / Math.log(1 + 30 * 0.4));
}

// ── FIELD SILENCE — idle breath system ─────────────────────────────────────
// Universe slows when no one is watching.
// Emotional physics: attention is the medium. Without it, fields collapse inward.
let _lastInteraction = Date.now();
let _silenceLevel = 0; // 0 = fully awake, 1 = fully silent
let _breathPhase = 0;  // drives gentle pulsation of surviving nodes
const SILENCE_ONSET_MS = 8000; // 8s before silence begins
const SILENCE_RISE_S   = 6;    // seconds to reach full silence

function touchInteraction() {
  _lastInteraction = Date.now();
}

function updateSilence(dt) {
  const idleMs = Date.now() - _lastInteraction;
  if (idleMs > SILENCE_ONSET_MS) {
    // Rise toward silence
    _silenceLevel = Math.min(1, _silenceLevel + dt / SILENCE_RISE_S);
  } else {
    // Wake quickly when user returns
    _silenceLevel = Math.max(0, _silenceLevel - dt * 2);
  }
  _breathPhase += dt * 0.4; // slow breath cycle
}

function getEffective(p) {
  return p.curatorOverride || p.aiSuggestion || {};
}

function getEF(p) {
  return getEffective(p).emotionalField || {};
}

// ── LAYOUT ─────────────────────────────────────────────────────────────────
function computePositions(W, H) {
  const xField = document.getElementById('x-axis').value;
  const yField = document.getElementById('y-axis').value;
  const jitter = parseInt(document.getElementById('jitter').value);
  document.getElementById('jitter-val').textContent = jitter;

  const pad = 50;
  
  // Pick 7 random nodes to be initially visible (only compute if empty)
  if (!nodePositions || nodePositions.length === 0) {
    const initialVisible = new Set();
    while(initialVisible.size < 7) {
      initialVisible.add(Math.floor(Math.random() * poems.length));
    }
    
    nodePositions = poems.map((p, i) => {
      const ef = getEF(p);
      const xVal = ef[xField] !== undefined ? ef[xField] : Math.random();
      const yVal = ef[yField] !== undefined ? ef[yField] : Math.random();
      
      return {
        poem: p,
        idx: i,
        ox: pad + xVal * (W - pad*2),
        oy: pad + (1 - yVal) * (H - pad*2), // flip Y axis for visual logic
        x: 0, y: 0, 
        readingDriftX: 0, readingDriftY: 0,
        vx: 0, vy: 0, // for spring physics
        revealAlpha: initialVisible.has(i) ? 1 : 0 
      };
    });
  } else {
    // Only update ox, oy to not reset physics/reveal states
    nodePositions.forEach(n => {
      const ef = getEF(n.poem);
      const xVal = ef[xField] !== undefined ? ef[xField] : Math.random();
      const yVal = ef[yField] !== undefined ? ef[yField] : Math.random();
      n.ox = pad + xVal * (W - pad*2);
      n.oy = pad + (1 - yVal) * (H - pad*2);
    });
  }

}

function getNodeColor(p) {
  const colorBy = document.getElementById('color-by').value;
  const eff = getEffective(p);
  const ef = getEF(p);

  if (colorBy === 'dominant') {
    return DOM_COLORS[eff.dominantField] || '#555';
  }
  if (colorBy === 'confidence') {
    const c = eff.confidence || 0;
    if (c < 0.4) return '#aa3030';
    if (c < 0.7) return '#aa7020';
    return '#3a9a3a';
  }
  if (colorBy === 'year') {
    const y = p.year || 2020;
    const t = (y - 2016) / (2024 - 2016);
    const r = Math.round(58 + t * 100);
    const b = Math.round(170 - t * 80);
    return `rgb(${r},80,${b})`;
  }
  if (colorBy === 'gravity') {
    const g = eff.gravityMass || 1;
    const t = (g - 0.5) / 2.5;
    return `hsl(${200 + t * 60}, 60%, ${30 + t * 25}%)`;
  }
  return '#555';
}

function getNodeRadius(p) {
  const sizeBy = document.getElementById('size-by').value;
  const eff = getEffective(p);
  if (sizeBy === 'gravity') return 4 + (eff.gravityMass || 1) * 3.5;
  if (sizeBy === 'confidence') return 4 + (1 - (eff.confidence || 0)) * 8;
  return 6;
}

// ── DENSITY HAZE — field cluster visualization ──────────────────────────────
// Replaces gravity edges. Instead of drawing lines between nodes,
// we render a soft radial bloom where poems cluster.
// Physical meaning: emotional mass warps the surrounding space.
function hexA(alpha) {
  return Math.min(255, Math.max(0, Math.round(alpha * 255))).toString(16).padStart(2, '0');
}


  // Update node positions with Jitter, Reveal, and Reading Drift
  const jitterAmt = parseInt(document.getElementById('jitter').value) || 0;
  const isReading = (appState === 'reading');
  
  revealedNodes.forEach(n => {
    // Reveal logic (hover exploration)
    if (appState === 'dream' && n.revealAlpha < 1) {
      const distToMouse = Math.hypot(n.ox - mouseX, n.oy - mouseY);
      if (distToMouse < 150) {
        n.revealAlpha += 0.005; // slow reveal
      } else {
        // very very slow random reveal
        if (Math.random() < 0.001) n.revealAlpha += 0.01;
      }
      if (n.revealAlpha > 1) n.revealAlpha = 1;
    }
    
    // Reading drift logic (Material 3 Expressive Spring Physics)
    const spring = 0.04;
    const friction = 0.82;
    let targetX = 0;
    let targetY = 0;

    if (isReading && readPoemNode) {
      if (n === readPoemNode) {
        // Move to center top slightly
        targetX = W/2 - n.ox;
        targetY = H * 0.3 - n.oy;
      } else {
        // Drift away elastically
        const dx = n.ox - readPoemNode.ox;
        const dy = n.oy - readPoemNode.oy;
        const dist = Math.hypot(dx, dy) || 1;
        const force = 600 / dist;
        targetX = (dx / dist) * force * 10;
        targetY = (dy / dist) * force * 10;
      }
    }

    n.vx += (targetX - n.readingDriftX) * spring;
    n.vy += (targetY - n.readingDriftY) * spring;
    n.vx *= friction;
    n.vy *= friction;
    n.readingDriftX += n.vx;
    n.readingDriftY += n.vy;

    const t = Date.now() / (isMobile ? 4000 : 2000);
    const jx = Math.sin(t + n.idx) * jitterAmt;
    const jy = Math.cos(t + n.idx) * jitterAmt;
    n.x = n.ox + jx + n.readingDriftX;
    n.y = n.oy + jy + n.readingDriftY;
  });

  if (appState === 'entry') return; // Do not draw universe during entry screen

  // Only consider revealed nodes for density haze
  const revealedNodes = nodePositions.filter(n => n.revealAlpha > 0.05);

function drawDensityHaze(ctx, W, H) {
  ctx.save();
  ctx.globalCompositeOperation = 'screen';
  const groups = {};
  revealedNodes.forEach(n => {
    const dom = getEffective(n.poem).dominantField || 'entropy';
    if (!groups[dom]) groups[dom] = [];
    groups[dom].push(n);
  });

  Object.entries(groups).forEach(([dom, nodes]) => {
    if (nodes.length < 2) return;
    const cx = nodes.reduce((s, n) => s + n.x, 0) / nodes.length;
    const cy = nodes.reduce((s, n) => s + n.y, 0) / nodes.length;
    const spread = nodes.reduce((s, n) => s + Math.hypot(n.x - cx, n.y - cy), 0) / nodes.length;
    const hazeR = Math.max(50, spread * 2.2);

    const color = DOM_COLORS[dom] || '#555';
    const baseAlpha = Math.min(isMobile ? 0.1 : 0.2, (nodes.length / poems.length) * 0.9) * (isReading ? 0.2 : 1);
    const silencedAlpha = baseAlpha * (1 - _silenceLevel * 0.7);

    const grd = ctx.createRadialGradient(cx, cy, 0, cx, cy, hazeR);
    grd.addColorStop(0, color + hexA(silencedAlpha * 2));
    grd.addColorStop(0.3, color + hexA(silencedAlpha * 0.8));
    grd.addColorStop(0.32, color + hexA(silencedAlpha * 2.5)); // sharp inner nebula edge
    grd.addColorStop(0.6, color + hexA(silencedAlpha * 0.5));
    grd.addColorStop(0.62, color + hexA(silencedAlpha * 1.5)); // sharp outer nebula edge
    grd.addColorStop(1, color + '00');

    ctx.beginPath();
    ctx.arc(cx, cy, hazeR, 0, Math.PI * 2);
    ctx.fillStyle = grd;
    ctx.fill();
    
    // Draw individual sharp halos for each node (stars in galaxy)
    nodes.forEach(n => {
      const nodeR = 20 + (getEffective(n.poem).gravityMass || 1) * 15;
      const nGrd = ctx.createRadialGradient(n.x, n.y, 0, n.x, n.y, nodeR);
      nGrd.addColorStop(0, color + hexA(silencedAlpha * 3));
      nGrd.addColorStop(0.15, color + hexA(silencedAlpha * 0.8));
      nGrd.addColorStop(1, color + '00');
      ctx.beginPath();
      ctx.arc(n.x, n.y, nodeR, 0, Math.PI * 2);
      ctx.fillStyle = nGrd;
      ctx.fill();
    });
  });
  ctx.restore();
}
// ── PRESSURE RIPPLE — proximity field tension ───────────────────────────────
// Emotional pressure between nearby poems of the same field.
// Physical meaning: poems in the same emotional orbit exert tension on each other.
function drawPressureRipples(ctx) {
  if (_silenceLevel > 0.95) return; // silent universe has no pressure
  const t = Date.now() / 1000;
  for (let i = 0; i < nodePositions.length; i++) {
    for (let j = i + 1; j < nodePositions.length; j++) {
      const ni = nodePositions[i], nj = nodePositions[j];
      const dist = Math.hypot(ni.x - nj.x, ni.y - nj.y);
      const domI = getEffective(ni.poem).dominantField;
      const domJ = getEffective(nj.poem).dominantField;
      if (dist > 55 || domI !== domJ) continue;

      // Animate a ripple ring that travels outward from midpoint
      const mx = (ni.x + nj.x) / 2;
      const my = (ni.y + nj.y) / 2;
      const phase = (t * 0.5 + i * 0.3) % 1; // 0→1 over 2s
      const rippleR = (dist / 2) * phase;
      const rippleAlpha = (1 - phase) * 0.12 * (1 - _silenceLevel);
      if (rippleAlpha < 0.005) continue;

      const color = DOM_COLORS[domI] || '#555';
      ctx.beginPath();
      ctx.arc(mx, my, rippleR, 0, Math.PI * 2);
      ctx.strokeStyle = color + Math.round(rippleAlpha * 255).toString(16).padStart(2,'0');
      ctx.lineWidth = 0.8;
      ctx.stroke();
    }
  }
}

// ── DUST FLOW — warm node aura drift ───────────────────────────────────────
// Warm poems shed small particles. Physical meaning: memory bleeds outward.
const dustParticles = [];
function spawnDust() {
  revealedNodes.forEach(n => {
    const w = getWarmth(n.poem);
    if (w < 0.25 || Math.random() > w * 0.08) return;
    const color = DOM_COLORS[getEffective(n.poem).dominantField] || '#555';
    const angle = Math.random() * Math.PI * 2;
    const speed = 0.1 + Math.random() * 0.3;
    dustParticles.push({
      x: n.x, y: n.y, vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed,
      life: 1.0, decay: 0.008 + Math.random() * 0.01, color, r: 1 + Math.random()
    });
  });
  // Cull dead particles
  while (dustParticles.length > 180) dustParticles.shift();
}

function drawDust(ctx) {
  dustParticles.forEach(d => {
    if (d.life <= 0) return;
    const alpha = d.life * 0.35 * (1 - _silenceLevel * 0.8);
    ctx.beginPath();
    ctx.arc(d.x, d.y, d.r, 0, Math.PI * 2);
    ctx.fillStyle = d.color + Math.round(alpha * 255).toString(16).padStart(2,'0');
    ctx.fill();
  });
}

function stepDust() {
  dustParticles.forEach(d => {
    d.x += d.vx; d.y += d.vy;
    d.vy -= 0.002; // gentle upward float
    d.life -= d.decay;
  });
}

// ── DRAW ───────────────────────────────────────────────────────────────────
let _lastFrameTime = performance.now();
let _animFrameId = null;

function redraw() {
  const canvas = document.getElementById('c');
  const wrap = document.getElementById('canvas-wrap');
  const W = wrap.clientWidth;
  const H = wrap.clientHeight;
  canvas.width = W; canvas.height = H;
  const ctx = canvas.getContext('2d');

  computePositions(W, H);
  drawFrame(ctx, W, H);
}

function drawFrame(ctx, W, H) {
  const now = performance.now();
  const dt = Math.min(0.1, (now - _lastFrameTime) / 1000);
  _lastFrameTime = now;

  updateSilence(dt);
  stepDust();
  spawnDust();

  ctx.clearRect(0,0,W,H);

  // Grid — single alpha pipeline. Color is naturally subtle; fade via globalAlpha only.
  ctx.globalAlpha = 1 - _silenceLevel * 0.85;
  ctx.strokeStyle = '#1a1a20';
  ctx.lineWidth = 1;
  for (let i = 1; i < 4; i++) {
    ctx.beginPath();
    ctx.moveTo(W * i/4, 0); ctx.lineTo(W * i/4, H);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(0, H * i/4); ctx.lineTo(W, H * i/4);
    ctx.stroke();
  }
  ctx.globalAlpha = 1;

  // Density haze (replaces gravity edges)
  drawDensityHaze(ctx, W, H);

  // Pressure ripples
  drawPressureRipples(ctx);

  // Dust
  drawDust(ctx);

  // Draw nodes — thermal state applied
  nodePositions.forEach((n, i) => {
    const p = n.poem;
    const r = getNodeRadius(p);
    const color = getNodeColor(p);
    const isSelected = selectedPoem && selectedPoem.id === p.id;
    const isHovered = hoveredIdx === i;
    const warmth = getWarmth(p);

    // Thermal alpha: cold nodes are nearly invisible (0.18), warm nodes fully opaque
    const alpha = isSelected ? 1.0 : (0.18 + warmth * 0.82);
    const alphaHex = Math.round(alpha * 255).toString(16).padStart(2, '0');

    // Thermal radius: cold nodes slightly smaller
    const thermalR = r * (0.65 + warmth * 0.35);

    // Per-node breath — only 'sáng' nodes (warmth > 0.7) breathe during silence.
    // Golden angle phase distribution: prevents all nodes pulsing together → no screensaver.
    // Amplitude ±0.5px halo radius. Cycle ~6s. Below perception threshold for casual glance.
    const nodePhaseOffset = (n.idx * 2.39996) % (Math.PI * 2); // golden angle spread
    const isSang = warmth > 0.7 && !isSelected && !isHovered;
    const silenceFactor = Math.max(0, (_silenceLevel - 0.3) / 0.7);
    // _breathPhase grows at 0.4/s → 2.618 factor gives ~6s full cycle
    const breathPulse = isSang
      ? Math.sin(_breathPhase * 2.618 + nodePhaseOffset) * silenceFactor * 0.5
      : 0;

    // Warm glow halo (appears as warmth increases)
    if (warmth > 0.1 && (isSelected || isHovered || warmth > 0.4)) {
      const haloAlpha = warmth * (isSelected ? 0.28 : 0.15);
      const haloHex = Math.round(haloAlpha * 255).toString(16).padStart(2,'0');
      ctx.beginPath();
      ctx.arc(n.x, n.y, thermalR + 5 + warmth * 4 + breathPulse, 0, Math.PI*2);
      ctx.fillStyle = color + haloHex;
      ctx.fill();
    }

    // Node core
    ctx.beginPath();
    ctx.arc(n.x, n.y, thermalR, 0, Math.PI*2);
    ctx.fillStyle = color + alphaHex;
    ctx.fill();

    // Stub marker (dashed ring)
    if (p.isStub) {
      ctx.beginPath();
      ctx.arc(n.x, n.y, thermalR, 0, Math.PI*2);
      ctx.strokeStyle = '#ffffff' + Math.round(alpha * 0.3 * 255).toString(16).padStart(2,'0');
      ctx.lineWidth = 1;
      ctx.setLineDash([2,2]);
      ctx.stroke();
      ctx.setLineDash([]);
    }

    // Curated marker (green ring)
    if (p.curated) {
      ctx.beginPath();
      ctx.arc(n.x, n.y, thermalR + 2, 0, Math.PI*2);
      ctx.strokeStyle = '#3a9a5c' + Math.round(alpha * 0.6 * 255).toString(16).padStart(2,'0');
      ctx.lineWidth = 1;
      ctx.stroke();
    }

    // Low confidence warning ring
    const conf = getEffective(p).confidence || 0;
    if (conf < 0.4) {
      ctx.beginPath();
      ctx.arc(n.x, n.y, thermalR + 3, 0, Math.PI*2);
      ctx.strokeStyle = '#aa3030' + Math.round(alpha * 0.6 * 255).toString(16).padStart(2,'0');
      ctx.lineWidth = 1.5;
      ctx.stroke();
    }

    // Label for selected/hovered
    if (isSelected || (isHovered && warmth > 0)) {
      ctx.fillStyle = `rgba(255,255,255,${isSelected ? 0.9 : 0.6})`;
      ctx.font = '600 11px Outfit, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(p.title.slice(0, 22), n.x, n.y - thermalR - 8);
    }
  });

  // Axis labels — single alpha pipeline
  const xField = document.getElementById('x-axis').value;
  const yField = document.getElementById('y-axis').value;
  ctx.globalAlpha = 1 - _silenceLevel * 0.9;
  ctx.fillStyle = '#6e6b7b';
  ctx.font = '500 11px Outfit, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(`→ ${FIELD_LABELS[xField] || xField}`, W/2, H - 12);
  ctx.save();
  ctx.translate(16, H/2);
  ctx.rotate(-Math.PI/2);
  ctx.fillText(`→ ${FIELD_LABELS[yField] || yField}`, 0, 0);
  ctx.restore();
  ctx.globalAlpha = 1;

  // Stats (only when awake)
  if (_silenceLevel < 0.9) {
    renderStats();
    renderLegend();
  }
}

// ── LEGEND ─────────────────────────────────────────────────────────────────
function renderLegend() {
  const colorBy = document.getElementById('color-by').value;
  const legEl = document.getElementById('legend');
  legEl.innerHTML = '';

  if (colorBy === 'dominant') {
    Object.entries(DOM_COLORS).forEach(([dom, color]) => {
      const count = poems.filter(p => getEffective(p).dominantField === dom).length;
      const div = document.createElement('div');
      div.className = 'leg-item';
      div.innerHTML = `<div class="leg-dot" style="background:${color}"></div><span>${DOM_LABELS[dom] || dom} (${count})</span>`;
      legEl.appendChild(div);
    });
  } else {
    const labels = colorBy === 'confidence'
      ? [['thấp <40%','#aa3030'],['trung 40-70%','#aa7020'],['cao >70%','#3a9a3a']]
      : colorBy === 'year'
      ? [['2016','rgb(58,80,170)'],['2020','rgb(108,80,130)'],['2024','rgb(158,80,90)']]
      : [['nhẹ','#3a5a80'],['nặng','#7a5aa0']];
    labels.forEach(([label, color]) => {
      const div = document.createElement('div');
      div.className = 'leg-item';
      div.innerHTML = `<div class="leg-dot" style="background:${color}"></div><span>${label}</span>`;
      legEl.appendChild(div);
    });
  }

  // Fixed indicators
  const div2 = document.createElement('div');
  div2.className = 'leg-item';
  div2.innerHTML = `<div class="leg-dot" style="background:transparent;border:1px dashed #fff4"></div><span>stub</span>`;
  legEl.appendChild(div2);
  const div3 = document.createElement('div');
  div3.className = 'leg-item';
  div3.innerHTML = `<div class="leg-dot" style="background:transparent;border:1.5px solid #aa303088"></div><span>cần xem lại</span>`;
  legEl.appendChild(div3);
  // Thermal state indicator
  const div4 = document.createElement('div');
  div4.style.cssText = 'width:100%;font-size:9px;color:var(--dim);margin-top:2px;font-style:italic;';
  div4.textContent = 'hover để làm ấm · ngủ = chưa đọc';
  legEl.appendChild(div4);
}

// ── STATS ──────────────────────────────────────────────────────────────────
function renderStats() {
  const domCounts = {};
  let curated = 0;
  let totalGravity = 0;
  poems.forEach(p => {
    const dom = getEffective(p).dominantField || 'entropy';
    domCounts[dom] = (domCounts[dom] || 0) + 1;
    if (p.curated) curated++;
    totalGravity += getEffective(p).gravityMass || 1;
  });

  const avgGravity = (totalGravity / poems.length).toFixed(2);
  const dominated = Object.entries(domCounts).sort((a,b) => b[1]-a[1]);
  const warmed = poems.filter(p => (sessionAttention[p.id] || 0) > 0).length;
  const statsEl = document.getElementById('stats-content');
  statsEl.innerHTML = `
    <span style="color:var(--bright)">Vũ trụ cảm xúc</span><br>
    ${poems.length} bài · ${curated} đã duyệt · ${warmed} đã đọc<br>
    Khối lượng tb: ${avgGravity}<br>
    Phân cụm:<br>
    ${dominated.map(([d,c]) => `  <span style="color:${DOM_COLORS[d] || '#888'}">${DOM_LABELS[d] || d}</span>: ${c}`).join('<br>')}
  `;
}

// ── MOUSE ──────────────────────────────────────────────────────────────────
const canvasEl = document.getElementById('c');
const tooltip = document.getElementById('tooltip');

function getHoveredNode(mx, my) {
  let best = null, bestDist = 20;
  nodePositions.forEach((n, i) => {
    const d = Math.hypot(n.x - mx, n.y - my);
    if (d < bestDist) { bestDist = d; best = i; }
  });
  return best;
}

canvasEl.addEventListener('mousemove', e => {
  touchInteraction();
  const rect = canvasEl.getBoundingClientRect();
  const mx = e.clientX - rect.left, my = e.clientY - rect.top;
  const found = getHoveredNode(mx, my);

  if (found !== hoveredIdx) {
    hoveredIdx = found;
    redraw();
  }

  if (found !== null) {
    const p = nodePositions[found].poem;
    const eff = getEffective(p);
    // Accumulate attention while hovering
    startAttention(p.id);
    const warmth = getWarmth(p);
    const thermalLabel = warmth < 0.05 ? 'ngủ' : warmth < 0.35 ? 'thức dần' : warmth < 0.7 ? 'ấm' : 'sáng';

    tooltip.style.display = 'block';
    tooltip.style.left = (e.clientX + 14) + 'px';
    tooltip.style.top  = (e.clientY - 10) + 'px';
    tooltip.innerHTML = `
      <strong>${p.title}</strong><br>
      ${p.date || ''}<br>
      <span style="color:${DOM_COLORS[eff.dominantField]||'#888'}">${DOM_LABELS[eff.dominantField] || eff.dominantField}</span><br>
      khối lượng: ${(eff.gravityMass||1).toFixed(1)} | phân rã: ${(eff.decayRate||0.05).toFixed(3)}<br>
      độ tin: ${((eff.confidence||0)*100).toFixed(0)}%
      ${p.isStub ? ' <span style="color:#666">[stub]</span>' : ''}
      <br><span style="color:#55667788; font-size:10px">${thermalLabel}</span>
    `;
  } else {
    tooltip.style.display = 'none';
    stopAttention();
  }
});

canvasEl.addEventListener('mouseleave', () => {
  tooltip.style.display = 'none';
  hoveredIdx = null;
  stopAttention();
  redraw();
});

canvasEl.addEventListener('click', e => {
  touchInteraction();
  const rect = canvasEl.getBoundingClientRect();
  const mx = e.clientX - rect.left, my = e.clientY - rect.top;
  const found = getHoveredNode(mx, my);
  if (found !== null) {
    selectedPoem = nodePositions[found].poem;
    // Click immediately warms up the poem
    boostAttention(selectedPoem.id, 6);
    renderPoemInfo(selectedPoem);
    redraw();
  }
});

// ── POEM INFO ─────────────────────────────────────────────────────────────
function renderPoemInfo(p) {
  const eff = getEffective(p);
  const ef = eff.emotionalField || {};
  const motifs = (eff.motifs || {});

  document.getElementById('poem-info').innerHTML = `
    <h2>${p.title}</h2>
    <div class="info-date">
      ${p.date || '?'} &nbsp;|&nbsp;
      <span style="color:${DOM_COLORS[eff.dominantField]||'#888'}">${eff.dominantField}</span> &nbsp;|&nbsp;
      mass ${(eff.gravityMass||1).toFixed(1)} &nbsp;|&nbsp;
      decay ${(eff.decayRate||0.05).toFixed(3)}<br>
      conf: ${((eff.confidence||0)*100).toFixed(0)}%
      ${p.isStub ? ' <span style="color:var(--dim)">[stub — no text]</span>' : ''}
      ${p.curated ? ' <span style="color:#3a9a5c">✓ curated</span>' : ''}
    </div>
    <div style="margin-bottom:8px;">
      ${FIELDS.map(f => {
        const val = ef[f] || 0;
        const labelVi = FIELD_LABELS[f] || f;
        return `<div class="field-bar-row">
          <span class="field-bar-label" style="color:${FIELD_COLORS[f]}" title="${f}">${labelVi}</span>
          <div class="field-bar-wrap">
            <div class="field-bar-fill" style="width:${val*100}%;background:${FIELD_COLORS[f]}"></div>
          </div>
          <span class="field-bar-val">${val.toFixed(2)}</span>
        </div>`;
      }).join('')}
    </div>
    ${p.body || p.excerpt ? `<div style="font-style:italic;color:var(--dim);font-size:11px;line-height:1.7;border-left:2px solid var(--border);padding-left:8px;margin-bottom:8px">${(p.excerpt || p.body.split('\n').slice(0,3).join('\n')).replace(/\n/g,'<br>')}</div>` : ''}
    <div id="motif-list">
      ${Object.entries(motifs).sort((a,b)=>b[1]-a[1]).slice(0,10)
        .map(([k,v])=>`<span class="motif-tag">${k} ${v.toFixed(2)}</span>`)
        .join('') || '<span style="color:var(--dim)">no motifs</span>'}
    </div>
    ${eff.notes && eff.notes !== 'Inference stable.'
      ? `<div style="margin-top:8px;font-size:10px;color:#c47a20;border-left:2px solid #c47a20;padding-left:6px;line-height:1.5">${eff.notes}</div>`
      : ''}
  `;
}

// ── RESIZE ─────────────────────────────────────────────────────────────────
window.addEventListener('resize', () => {
  const canvas = document.getElementById('c');
  const wrap = document.getElementById('canvas-wrap');
  const W = wrap.clientWidth, H = wrap.clientHeight;
  canvas.width = W; canvas.height = H;
  const ctx = canvas.getContext('2d');
  computePositions(W, H);
});

// ── ANIMATION LOOP ─────────────────────────────────────────────────────────
// Continuous loop needed for: field silence breathing, ripples, dust drift.
function animate() {
  const canvas = document.getElementById('c');
  const wrap = document.getElementById('canvas-wrap');
  const W = wrap.clientWidth, H = wrap.clientHeight;
  // Recompute positions only on canvas resize — not every frame
  if (canvas.width !== W || canvas.height !== H) {
    canvas.width = W; canvas.height = H;
    computePositions(W, H);
  }
  const ctx = canvas.getContext('2d');
  drawFrame(ctx, W, H);
  _animFrameId = requestAnimationFrame(animate);
}

// ── INIT ───────────────────────────────────────────────────────────────────
// Compute positions once before loop starts
(function initPositions() {
  const wrap = document.getElementById('canvas-wrap');
  const canvas = document.getElementById('c');
  canvas.width = wrap.clientWidth;
  canvas.height = wrap.clientHeight;
  computePositions(wrap.clientWidth, wrap.clientHeight);
})();
animate();

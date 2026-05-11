import re

with open('/Users/nguyenvietcuong/Desktop/PrintHL/hanh-loan-poetry/topology.html', 'r') as f:
    text = f.read()

# 1. Add State Management and initial random poem line
state_js = """
let appState = 'entry'; // 'entry', 'dream', 'reading'
let readPoemNode = null; 

// Setup Entry Screen
const randomPoem = poems[Math.floor(Math.random() * poems.length)];
const lines = randomPoem.content ? randomPoem.content.split('\\n').filter(l => l.trim().length > 10) : [];
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

"""
text = text.replace('let selectedPoem = null;', state_js + 'let selectedPoem = null;')

# 2. Add revealAlpha to node initialization and Drift logic
init_js = """
    // Pick 7 random nodes to be initially visible
    const initialVisible = new Set();
    while(initialVisible.size < 7) {
      initialVisible.add(Math.floor(Math.random() * poems.length));
    }

    nodePositions = poems.map((p, i) => {
      const eff = getEffective(p);
      const ef = getEF(p);
      const dom = eff.dominantField;
      const xVal = ef[dom === 'longing' ? 'longing' : (dom === 'eros' ? 'eros' : 'entropy')] || Math.random();
      const yVal = ef[dom === 'entropy' ? 'entropy' : (dom === 'longing' ? 'longing' : 'eros')] || Math.random();
      
      const pad = 80;
      return {
        ox: pad + xVal * (W - pad*2), // original x
        oy: pad + (1 - yVal) * (H - pad*2), // original y
        x: 0, y: 0,
        poem: p,
        idx: i,
        revealAlpha: initialVisible.has(i) ? 1 : 0,
        readingDriftX: 0,
        readingDriftY: 0
      };
    });
"""
# Replace the nodePositions assignment in computePositions
text = re.sub(r'nodePositions = poems\.map\(\(p, i\) => \{.*?\n.*?\n.*?\n.*?\n.*?\n.*?\n.*?\n.*?\n.*?\n.*?\n.*?\}\);', init_js, text, flags=re.DOTALL)

# 3. Update drawing loop for Drift, Reveal, and Alpha
draw_js = """
  // Update node positions with Jitter, Reveal, and Reading Drift
  const jitterAmt = parseInt(document.getElementById('jitter').value) || 0;
  const isReading = (appState === 'reading');
  
  nodePositions.forEach(n => {
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
    
    // Reading drift logic
    if (isReading && readPoemNode) {
      if (n === readPoemNode) {
        // Move to center top slightly
        n.readingDriftX += (W/2 - n.ox - n.readingDriftX) * 0.02;
        n.readingDriftY += (H * 0.3 - n.oy - n.readingDriftY) * 0.02;
      } else {
        // Drift away
        const dx = n.ox - readPoemNode.ox;
        const dy = n.oy - readPoemNode.oy;
        const dist = Math.hypot(dx, dy) || 1;
        const force = 500 / dist;
        n.readingDriftX += ((dx / dist) * force * 10 - n.readingDriftX) * 0.02;
        n.readingDriftY += ((dy / dist) * force * 10 - n.readingDriftY) * 0.02;
      }
    } else {
      // Return to original
      n.readingDriftX += (0 - n.readingDriftX) * 0.03;
      n.readingDriftY += (0 - n.readingDriftY) * 0.03;
    }

    const t = Date.now() / 2000;
    const jx = Math.sin(t + n.idx) * jitterAmt;
    const jy = Math.cos(t + n.idx) * jitterAmt;
    n.x = n.ox + jx + n.readingDriftX;
    n.y = n.oy + jy + n.readingDriftY;
  });

  if (appState === 'entry') return; // Do not draw universe during entry screen

  // Only consider revealed nodes for density haze
  const revealedNodes = nodePositions.filter(n => n.revealAlpha > 0.05);
"""
# inject draw_js into animate before density haze
text = text.replace('function drawDensityHaze', draw_js + '\nfunction drawDensityHaze')

# Update drawDensityHaze to use revealedNodes and multiply alpha by revealAlpha
text = text.replace('nodePositions.forEach(n => {', 'revealedNodes.forEach(n => {')
# also adjust baseAlpha calculation in haze
text = text.replace('const baseAlpha = Math.min(0.2, (nodes.length / poems.length) * 0.9);', 'const baseAlpha = Math.min(0.2, (nodes.length / poems.length) * 0.9) * (isReading ? 0.2 : 1);')

# In drawNodes loop, multiply opacity by revealAlpha and adjust for reading state
text = text.replace('ctx.globalAlpha = 0.8 * pulse;', 'ctx.globalAlpha = 0.8 * pulse * n.revealAlpha * (isReading && n !== readPoemNode ? 0.1 : 1);')

# 4. Handle Click for Phase 3 (Reading State)
click_js = """
canvas.addEventListener('click', () => {
  if (appState !== 'dream') return;
  if (hoveredIdx !== null) {
    readPoemNode = nodePositions[hoveredIdx];
    appState = 'reading';
    
    // Populate reader
    const p = readPoemNode.poem;
    document.getElementById('reader-title').innerText = p.title;
    document.getElementById('reader-body').innerText = p.content || "Văn bản đang trống...";
    document.getElementById('reader-layer').classList.add('active');
    
    // Add memory warmth
    boostAttention(p.id, 15);
  }
});
"""
text = text.replace("canvas.addEventListener('click', () => {", click_js + "/* ")
text = text.replace("  updateInfo(poems[hoveredIdx]);\n});", "*/\n")

with open('/Users/nguyenvietcuong/Desktop/PrintHL/hanh-loan-poetry/topology.html', 'w') as f:
    f.write(text)
print('State management injected.')

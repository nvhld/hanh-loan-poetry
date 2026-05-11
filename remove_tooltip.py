import re

with open('/Users/nguyenvietcuong/Desktop/PrintHL/hanh-loan-poetry/topology.html', 'r') as f:
    text = f.read()

new_mouse = """canvasEl.addEventListener('mousemove', e => {
  touchInteraction();
  if (appState !== 'dream') return;
  const rect = canvasEl.getBoundingClientRect();
  const mx = e.clientX - rect.left, my = e.clientY - rect.top;
  const found = getHoveredNode(mx, my);

  if (found !== hoveredIdx) {
    hoveredIdx = found;
    redraw();
  }

  if (found !== null) {
    const p = nodePositions[found].poem;
    startAttention(p.id);
  } else {
    stopAttention();
  }
});

canvasEl.addEventListener('mouseleave', () => {
  hoveredIdx = null;
  stopAttention();
  redraw();
});"""

text = re.sub(r"canvasEl\.addEventListener\('mousemove', e => \{.*?\n\}\);\n\ncanvasEl\.addEventListener\('mouseleave', \(\) => \{.*?\n\}\);", new_mouse, text, flags=re.DOTALL)

with open('/Users/nguyenvietcuong/Desktop/PrintHL/hanh-loan-poetry/topology.html', 'w') as f:
    f.write(text)

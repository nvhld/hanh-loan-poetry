import re

with open('/Users/nguyenvietcuong/Desktop/PrintHL/hanh-loan-poetry/topology.html', 'r') as f:
    text = f.read()

# 1. Update CSS
css_updates = """
  html,body { background:var(--bg); color:var(--text); font-family:'Courier New',monospace; font-size:12px; height:100%; margin:0; overflow:hidden; }
  #app { display:block; height:100vh; overflow:hidden; }
  #canvas-wrap { position:relative; overflow:hidden; width:100vw; height:100vh; }
  canvas { display:block; width:100%; height:100%; }
  #sidebar { display:none; } /* NO DATA MODE */

  /* READER LAYER STYLES */
  #entry-screen {
    position: fixed; top:0; left:0; width:100vw; height:100vh;
    background: #000; z-index: 9999;
    display: flex; flex-direction: column; align-items: center; justify-content: center;
    transition: opacity 3s ease; cursor: pointer;
  }
  .entry-line {
    color: #ccc; font-family: serif; font-size: 16px; letter-spacing: 1px;
    margin-bottom: 60px; font-style: italic; opacity: 0.8;
  }
  .entry-hint {
    color: #444; font-size: 10px; letter-spacing: 4px; text-transform: uppercase;
    animation: pulseHint 4s infinite;
  }
  @keyframes pulseHint { 0%, 100% { opacity: 0.2; } 50% { opacity: 0.7; } }

  #reader-layer {
    position: fixed; top:0; left:0; width:100vw; height:100vh;
    z-index: 8000; pointer-events: none;
    display: flex; align-items: center; justify-content: center;
    background: transparent; transition: background 2s ease;
  }
  #reader-layer.active {
    pointer-events: auto;
    background: rgba(5, 5, 7, 0.92);
  }
  #reader-content {
    max-width: 600px; padding: 40px;
    color: #ddd; font-family: serif; font-size: 16px; line-height: 2.2;
    opacity: 0; transform: translateY(15px);
    transition: all 2s ease; transition-delay: 0.8s;
  }
  #reader-layer.active #reader-content {
    opacity: 1; transform: translateY(0);
  }
  .reader-title { font-size: 12px; color: #777; text-transform: uppercase; letter-spacing: 3px; margin-bottom: 30px; text-align: center; }
  .reader-body { white-space: pre-wrap; margin-bottom: 60px; text-align: left; }
  .reader-exit { text-align: center; font-size: 10px; color: #555; cursor: pointer; letter-spacing: 3px; text-transform: uppercase; transition: color 0.5s; }
  .reader-exit:hover { color: #aaa; }
"""
text = re.sub(r'html,body \{.*?\n.*?#sidebar \{.*?\n.*?(?=#controls)', css_updates, text, flags=re.DOTALL)

# 2. Add HTML
html_updates = """<div id="app">
  <div id="entry-screen">
    <div class="entry-line" id="entry-poem">"..."</div>
    <div class="entry-hint">chạm vào hạnh loan</div>
  </div>

  <div id="reader-layer">
    <div id="reader-content">
      <div class="reader-title" id="reader-title"></div>
      <div class="reader-body" id="reader-body"></div>
      <div class="reader-exit" id="reader-exit">trở về dải ngân hà</div>
    </div>
  </div>

  <div id="canvas-wrap">"""
text = text.replace('<div id="app">\n  <div id="canvas-wrap">', html_updates)

# Write back
with open('/Users/nguyenvietcuong/Desktop/PrintHL/hanh-loan-poetry/topology.html', 'w') as f:
    f.write(text)


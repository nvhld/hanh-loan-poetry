import re

with open('/Users/nguyenvietcuong/Desktop/PrintHL/hanh-loan-poetry/topology.html', 'r') as f:
    text = f.read()

# Add Mobile CSS
mobile_css = """
  /* MOBILE SIMPLIFICATION */
  @media (max-width: 768px) {
    .entry-line { font-size: 18px; margin-bottom: 40px; padding: 0 20px; text-align: center; }
    .entry-hint { font-size: 12px; }
    #reader-content { padding: 20px; font-size: 18px; line-height: 2.0; }
    .reader-title { font-size: 14px; margin-bottom: 20px; }
  }
"""
text = text.replace('</style>', mobile_css + '</style>')

# Mobile detection in JS to reduce motion and haze
mobile_js = """
let isMobile = window.innerWidth <= 768;
window.addEventListener('resize', () => isMobile = window.innerWidth <= 768);
"""
text = text.replace("let appState = 'entry';", mobile_js + "\nlet appState = 'entry';")

# Reduce haze on mobile
haze_js_target = "const baseAlpha = Math.min(0.2, (nodes.length / poems.length) * 0.9) * (isReading ? 0.2 : 1);"
haze_js_replace = "const baseAlpha = Math.min(isMobile ? 0.1 : 0.2, (nodes.length / poems.length) * 0.9) * (isReading ? 0.2 : 1);"
text = text.replace(haze_js_target, haze_js_replace)

# Reduce motion on mobile
motion_js_target = "const t = Date.now() / 2000;"
motion_js_replace = "const t = Date.now() / (isMobile ? 4000 : 2000);"
text = text.replace(motion_js_target, motion_js_replace)

with open('/Users/nguyenvietcuong/Desktop/PrintHL/hanh-loan-poetry/topology.html', 'w') as f:
    f.write(text)
print('Mobile adjustments applied.')

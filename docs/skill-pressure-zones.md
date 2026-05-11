# Skill: Phenomenological Pressure Zones Engine

**Concept:** Render conceptual clusters (e.g., categories, constellations, related nodes) as physical "weather" or "pressure" shifts in the UI, rather than using explicit visual UI elements like graphs, connecting lines, glowing borders, or tooltips. The goal is for the user to *feel* the change in the environment's density before they intellectually understand that a cluster has been activated.

## Core Principles

1.  **Felt, Not Shown:** No boundaries, graph lines, or glowing sectors. The cluster is experienced as a shift in atmospheric pressure.
2.  **Intentional Activation:** Trigger changes only on intentional interaction (e.g., lingering on an item for >350ms), avoiding chaotic "animation triggers" during casual scrolling.
3.  **Holistic Environment Response:** When a cluster is active, the entire system responds—background color, typography, unselected items, and background particle physics.
4.  **Weather over Curatorial Text:** Treat clusters as physical conditions (e.g., "heavy friction," "sparse illumination") rather than semantic categories.

## Implementation Blueprint

### 1. The Data Layer (The Invisible Map)
Define your clusters with physical atmosphere descriptions instead of academic logic.
```json
{
  "id": "mc-02",
  "name": "sự đứng yên",
  "nodes": ["node-A", "node-B"],
  "atmosphere": "heavy friction, arrested motion"
}
```

### 2. The DOM Layer (Density Shifts)
When a node is hovered, find its cluster and apply a global state class to the `body`, not just the element.
```javascript
let hoverTimeout;
row.addEventListener('mouseenter', () => {
  hoverTimeout = setTimeout(() => {
    // 1. Find cluster
    // 2. Add global class: document.body.classList.add('cluster-active');
    // 3. Mark related nodes: r.classList.add('cluster-node');
    // 4. Mark unrelated nodes: r.classList.add('cluster-dim');
    // 5. Expand parent containers if hidden: r.closest('.group').classList.add('expanded');
    // 6. Broadcast weather state to background engine
  }, 350); // Requires linger
});
```

### 3. The CSS Layer (Subtle Textural Changes)
Shift the background color, use blur for depth of field, and apply micro-typographic shifts.
```css
/* 1. The Void Deepens */
body.cluster-active {
  background-color: #030304; /* Darker than default */
}

/* 2. The Cluster Emerges */
body.cluster-active .node.cluster-node {
  opacity: 1;
  filter: blur(0px);
  /* Micro-typography shift instead of scale() */
  letter-spacing: 0.3px; 
  text-shadow: 0 4px 12px rgba(255, 255, 255, 0.05);
}

/* 3. The Irrelevant Recedes */
body.cluster-active .node.cluster-dim {
  opacity: 0.25;
  filter: blur(1.5px);
}
```

### 4. The Physics Layer (Canvas Weather)
The background canvas must interpolate its simulation variables based on the active weather state. Do not snap values; smoothly interpolate them (`current += (target - current) * friction`).

```javascript
// Inside requestAnimationFrame loop:
let tSpeed = 1, tDen = 1, tAlpha = 0.22;

if (window.activeWeather === 'mc-01') { 
  // Cold drop, sparse illumination
  tSpeed = 0.6; tDen = 0.35; tAlpha = 0.12;
} else if (window.activeWeather === 'mc-02') { 
  // Heavy friction
  tSpeed = 0.08; tDen = 1.3; tAlpha = 0.15;
}

// Smooth Interpolation
cwSpeed += (tSpeed - cwSpeed) * 0.03;
cwDensity += (tDen - cwDensity) * 0.03;
cwAlpha += (tAlpha - cwAlpha) * 0.03;

// Apply to physics
particle.x += particle.vx * cwSpeed;
```

## Anti-Patterns to Avoid
*   **"Mind Map Cosmic Edition":** Drawing actual SVG or Canvas lines between related items.
*   **Hover Chaos:** Triggering the weather shift instantly on `mouseenter`. It must require a `setTimeout` linger.
*   **Shader Spectacles:** Using overwhelming WebGL effects. Basic Canvas 2D `arc`, `opacity`, and `Math.random` are sufficient when combined with CSS blurs.
*   **"Users also read" UI:** Adding text or sidebars explicitly stating the connection. Let the visual emergence do the talking.

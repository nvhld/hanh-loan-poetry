/**
 * pending-modal.js — Shared MVP Gate
 * Intercepts non-anchor poem navigation with an atmospheric modal.
 * Rules: no redirect, no visual lock, real <a> semantics preserved,
 * pending memory via localStorage.
 */
(function () {
  'use strict';

  // ── 12 ANCHOR IDs ──────────────────────────────────────────────────────────
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
    '2023-082-mua-he-o-boston',
  ]);

  // ── COPY POOL ──────────────────────────────────────────────────────────────
  // Rotate flexibly, avoid repeating last shown
  const COPY_POOL = [
    'tứ thơ này chưa mở ra hết.',
    'một khoảng tối chưa đọc được.',
    'Hạnh Loan còn trú ẩn nơi này.',
  ];

  // ── PENDING MEMORY ─────────────────────────────────────────────────────────
  const MEM_KEY = 'hanh-loan-pending-v1';

  function loadMem() {
    try { return JSON.parse(localStorage.getItem(MEM_KEY) || '{}'); } catch (e) { return {}; }
  }
  function hasVisited(id) { return !!loadMem()[id]; }
  function markVisited(id) {
    try {
      const m = loadMem(); m[id] = true;
      localStorage.setItem(MEM_KEY, JSON.stringify(m));
    } catch (e) {}
  }

  // ── STYLES ─────────────────────────────────────────────────────────────────
  function injectStyles() {
    if (document.getElementById('pm-style')) return;
    const s = document.createElement('style');
    s.id = 'pm-style';
    s.textContent = `
      #pending-modal {
        position: fixed;
        inset: 0;
        z-index: 9000;
        display: flex;
        align-items: center;
        justify-content: center;
        background: rgba(5, 5, 8, 0);
        backdrop-filter: blur(0px);
        -webkit-backdrop-filter: blur(0px);
        opacity: 0;
        pointer-events: none;
        transition:
          opacity 1.2s cubic-bezier(0.16, 1, 0.3, 1),
          background 1.2s cubic-bezier(0.16, 1, 0.3, 1),
          backdrop-filter 1.2s ease,
          -webkit-backdrop-filter 1.2s ease;
      }
      /* Returning visitor: emerge faster, dimmer */
      #pending-modal.pm-returning {
        transition:
          opacity 0.55s cubic-bezier(0.16, 1, 0.3, 1),
          background 0.55s cubic-bezier(0.16, 1, 0.3, 1),
          backdrop-filter 0.55s ease,
          -webkit-backdrop-filter 0.55s ease;
      }
      #pending-modal.pm-visible {
        opacity: 1;
        pointer-events: auto;
        background: rgba(5, 5, 8, 0.86);
        backdrop-filter: blur(2.5px);
        -webkit-backdrop-filter: blur(2.5px);
      }
      /* Returning: opacity cap lower, less theatrical */
      #pending-modal.pm-returning.pm-visible {
        opacity: 0.6;
        background: rgba(5, 5, 8, 0.74);
      }
      .pm-content {
        display: flex;
        flex-direction: column;
        align-items: center;
        text-align: center;
        max-width: 380px;
        padding: 0 40px;
        pointer-events: none;
      }
      .pm-poem-title {
        font-family: 'Outfit', sans-serif;
        font-size: 9px;
        font-weight: 400;
        letter-spacing: 4px;
        text-transform: uppercase;
        color: rgba(220, 219, 227, 0.35);
        margin-bottom: 40px;
      }
      .pm-body {
        font-family: 'Playfair Display', serif;
        font-size: clamp(16px, 2.2vw, 21px);
        line-height: 1.9;
        color: rgba(220, 219, 227, 0.72);
        font-weight: 400;
      }
      #pending-modal.pm-returning .pm-body {
        color: rgba(220, 219, 227, 0.5);
      }
      /* Dot: near-subconscious blink, 8–11s cycle */
      .pm-dot {
        margin-top: 48px;
        font-size: 20px;
        color: rgba(220, 219, 227, 0.18);
        line-height: 1;
        animation: pm-dot-breathe 9.5s ease-in-out infinite;
        animation-delay: 3s;
      }
      @keyframes pm-dot-breathe {
        0%, 100% { opacity: 0.18; }
        50%       { opacity: 0.07; }
      }
      @media (max-width: 640px) {
        .pm-content { padding: 0 28px; }
        .pm-poem-title { margin-bottom: 32px; }
        .pm-dot { margin-top: 36px; }
      }
    `;
    document.head.appendChild(s);
  }

  // ── STATE ──────────────────────────────────────────────────────────────────
  let _el = null;
  let _escHandler = null;
  let _onDismissCb = null;

  // ── SHOW ───────────────────────────────────────────────────────────────────
  function show(poemId, poemTitle, onDismiss) {
    injectStyles();
    if (_el) _dismiss(true); // clear any existing
    
    _onDismissCb = onDismiss || null;

    const returning = hasVisited(poemId);
    markVisited(poemId);

    // Pick copy — avoid repeating last, use sessionStorage
    let lastIdx = -1;
    try { lastIdx = parseInt(sessionStorage.getItem('pm-last-copy-idx') || '-1'); } catch (e) {}
    let idx;
    do { idx = Math.floor(Math.random() * COPY_POOL.length); }
    while (COPY_POOL.length > 1 && idx === lastIdx);
    try { sessionStorage.setItem('pm-last-copy-idx', String(idx)); } catch (e) {}

    const overlay = document.createElement('div');
    overlay.id = 'pending-modal';
    overlay.setAttribute('role', 'dialog');
    overlay.setAttribute('aria-modal', 'true');
    overlay.setAttribute('aria-label', 'Nội dung đang được chuẩn bị');
    if (returning) overlay.classList.add('pm-returning');

    overlay.innerHTML = `
      <div class="pm-content">
        <div class="pm-poem-title">${poemTitle ? escapeHtml(poemTitle) : ''}</div>
        <div class="pm-body">${COPY_POOL[idx]}</div>
        <div class="pm-dot" aria-hidden="true">·</div>
      </div>
    `;
    document.body.appendChild(overlay);
    _el = overlay;

    // Trigger CSS transition
    requestAnimationFrame(() => requestAnimationFrame(() => {
      overlay.classList.add('pm-visible');
    }));

    // Dismiss on outside click (not on .pm-content)
    overlay.addEventListener('click', (e) => {
      if (!e.target.closest('.pm-content')) _dismiss();
    });

    // Dismiss on ESC
    _escHandler = (e) => { if (e.key === 'Escape') _dismiss(); };
    document.addEventListener('keydown', _escHandler);
  }

  // ── DISMISS ────────────────────────────────────────────────────────────────
  function _dismiss(instant) {
    if (!_el) return;
    const el = _el;
    const cb = _onDismissCb;
    _el = null;
    _onDismissCb = null;
    
    if (_escHandler) {
      document.removeEventListener('keydown', _escHandler);
      _escHandler = null;
    }
    el.classList.remove('pm-visible');
    const delay = instant ? 0 : 900;
    setTimeout(() => { 
      if (el.parentNode) el.parentNode.removeChild(el); 
      if (cb) cb();
    }, delay);
  }

  // ── HELPERS ────────────────────────────────────────────────────────────────
  function escapeHtml(s) {
    return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
  }

  function isAnchor(id) { return ANCHOR_12_IDS.has(id); }

  // ── EXPORT ─────────────────────────────────────────────────────────────────
  window.PendingModal = { show, dismiss: _dismiss, isAnchor };

})();

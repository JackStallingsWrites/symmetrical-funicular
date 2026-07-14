/* ═══════════════════════════════════════════════════════════════
   tweaks-panel.js — small hand-rolled Tweaks panel
   Three whole-feel controls, toggling body classes already wired
   up in style.css. No framework dependency.
   ═══════════════════════════════════════════════════════════════ */
'use strict';

(function () {
  const STORAGE_KEY = 'tsj_tweaks_v1';

  const CONTROLS = [
    {
      key: 'mood',
      section: 'Mood',
      label: 'Room mood',
      options: ['quiet', 'confessional'],
      default: 'quiet',
    },
    {
      key: 'roomLayout',
      section: 'Three Doors',
      label: 'Room layout',
      options: ['grid', 'stack'],
      default: 'grid',
    },
    {
      key: 'studioPresence',
      section: 'Studio by Jack',
      label: 'Presence',
      options: ['hidden', 'quiet', 'named'],
      default: 'quiet',
    },
  ];

  function loadState() {
    const defaults = {};
    CONTROLS.forEach((c) => { defaults[c.key] = c.default; });
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return defaults;
      return Object.assign(defaults, JSON.parse(raw));
    } catch {
      return defaults;
    }
  }

  function saveState(state) {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); } catch {}
  }

  function applyState(state) {
    const body = document.body;
    body.classList.toggle('mood-confessional', state.mood === 'confessional');
    body.classList.toggle('layout-stack', state.roomLayout === 'stack');
    body.classList.toggle('studio-hidden', state.studioPresence === 'hidden');
    body.classList.toggle('studio-named', state.studioPresence === 'named');
  }

  function buildPanel(state, onChange) {
    const panel = document.createElement('div');
    panel.id = 'tweaks-panel';
    panel.style.cssText = [
      'position:fixed', 'right:1.25rem', 'bottom:1.25rem', 'z-index:9999',
      'width:230px', 'background:#1C1C1C', 'color:#F5F0E8',
      'border:1px solid rgba(245,240,232,0.14)', 'border-radius:2px',
      'font-family:Inter,system-ui,sans-serif', 'font-size:12px',
      'box-shadow:0 12px 32px rgba(0,0,0,0.45)',
      'transition:transform 0.22s ease, opacity 0.22s ease',
    ].join(';');

    const header = document.createElement('div');
    header.style.cssText = [
      'display:flex', 'align-items:center', 'justify-content:space-between',
      'padding:0.7rem 0.85rem', 'border-bottom:1px solid rgba(245,240,232,0.12)',
      'cursor:pointer', 'user-select:none',
    ].join(';');
    header.innerHTML =
      '<span style="letter-spacing:0.1em;text-transform:uppercase;font-size:10.5px;opacity:0.75">Tweaks</span>' +
      '<span id="tweaks-toggle-caret" style="opacity:0.6">—</span>';

    const body = document.createElement('div');
    body.id = 'tweaks-body';
    body.style.cssText = 'padding:0.85rem;display:flex;flex-direction:column;gap:0.9rem;';

    let lastSection = null;
    CONTROLS.forEach((c) => {
      if (c.section !== lastSection) {
        const sec = document.createElement('div');
        sec.textContent = c.section;
        sec.style.cssText =
          'font-size:9.5px;letter-spacing:0.16em;text-transform:uppercase;opacity:0.45;margin-top:0.15rem;';
        body.appendChild(sec);
        lastSection = c.section;
      }

      const row = document.createElement('div');
      row.style.cssText = 'display:flex;flex-direction:column;gap:0.35rem;';

      const label = document.createElement('div');
      label.textContent = c.label;
      label.style.cssText = 'opacity:0.8;';
      row.appendChild(label);

      const seg = document.createElement('div');
      seg.style.cssText = 'display:flex;border:1px solid rgba(245,240,232,0.18);border-radius:2px;overflow:hidden;';

      c.options.forEach((opt) => {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.textContent = opt;
        btn.dataset.key = c.key;
        btn.dataset.value = opt;
        btn.style.cssText = [
          'flex:1', 'padding:0.4rem 0.3rem', 'font-size:11px',
          'background:transparent', 'color:inherit', 'border:none',
          'cursor:pointer', 'text-transform:capitalize', 'letter-spacing:0.02em',
          'transition:background 0.15s, color 0.15s',
        ].join(';');
        seg.appendChild(btn);
      });

      row.appendChild(seg);
      body.appendChild(row);
    });

    panel.appendChild(header);
    panel.appendChild(body);
    document.body.appendChild(panel);

    function refreshButtons() {
      body.querySelectorAll('button[data-key]').forEach((btn) => {
        const active = state[btn.dataset.key] === btn.dataset.value;
        btn.style.background = active ? '#7A1E1E' : 'transparent';
        btn.style.color = active ? '#F5F0E8' : 'rgba(245,240,232,0.62)';
      });
    }

    body.addEventListener('click', (e) => {
      const btn = e.target.closest('button[data-key]');
      if (!btn) return;
      state[btn.dataset.key] = btn.dataset.value;
      refreshButtons();
      onChange(state);
    });

    let collapsed = false;
    header.addEventListener('click', () => {
      collapsed = !collapsed;
      body.style.display = collapsed ? 'none' : 'flex';
      document.getElementById('tweaks-toggle-caret').textContent = collapsed ? '+' : '—';
    });

    refreshButtons();
  }

  function init() {
    const state = loadState();
    applyState(state);
    buildPanel(state, (s) => {
      applyState(s);
      saveState(s);
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();

/* ═══════════════════════════════════════════════════════════════
   main.js — Taste & See Jack (jackstallings.com)
   1. Path-based scroll routing  (/read → #about, etc.)
   2. Sticky nav on scroll
   3. Fade-in observer for all .fade-in elements
   4. Live RSS feed via rss2json.com, cached in localStorage 1hr
   ═══════════════════════════════════════════════════════════════ */

'use strict';

/* ─── 1. Sticky Nav ─────────────────────────────────────────── */
(function initNav() {
  const nav = document.getElementById('nav');
  if (!nav) return;

  window.addEventListener('scroll', () => {
    nav.classList.toggle('scrolled', window.scrollY > 60);
  }, { passive: true });
})();

/* ─── 2. Fade-in on Scroll ──────────────────────────────────── */
const fadeObserver = (() => {
  if (!('IntersectionObserver' in window)) {
    // Fallback: show everything immediately if no observer support
    document.querySelectorAll('.fade-in').forEach(el => el.classList.add('visible'));
    return null;
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(({ target, isIntersecting }) => {
      if (isIntersecting) {
        target.classList.add('visible');
        observer.unobserve(target);
      }
    });
  }, {
    threshold: 0.1,
    rootMargin: '0px 0px -48px 0px',
  });

  // Observe all existing .fade-in elements on page load
  document.querySelectorAll('.fade-in').forEach(el => observer.observe(el));

  return observer;
})();

/** Call this after injecting new .fade-in nodes into the DOM */
function observeNewFadeEls() {
  if (!fadeObserver) return;
  document.querySelectorAll('.fade-in:not(.visible)').forEach(el => {
    fadeObserver.observe(el);
  });
}

/* ─── 3. Live RSS Feed ──────────────────────────────────────── */
(function initFeed() {
  // ── Config ────────────────────────────────────────────────────
  // Primary feed: the paid custom subdomain (update when DNS is live)
  // Fallback:     the base Substack URL (always works)
  const FEED_URL = 'https://knowjack.substack.com/feed';
  // rss2json.com converts RSS/Atom → JSON with CORS support.
  // Free tier: 10 000 req/day — more than sufficient for a personal site.
  const API_ENDPOINT =
    'https://api.rss2json.com/v1/api.json' +
    '?rss_url=' + encodeURIComponent(FEED_URL) +
    '&count=6';

  const CACHE_KEY    = 'tsj_feed_v1';
  const CACHE_TTL_MS = 60 * 60 * 1000; // 1 hour

  const grid = document.getElementById('feed-grid');
  if (!grid) return;

  // ── Cache helpers ─────────────────────────────────────────────
  function getCached() {
    try {
      const raw = localStorage.getItem(CACHE_KEY);
      if (!raw) return null;
      const { ts, items } = JSON.parse(raw);
      if (!Array.isArray(items) || items.length === 0) return null;
      if (Date.now() - ts > CACHE_TTL_MS) return null;
      return items;
    } catch {
      return null;
    }
  }

  function setCache(items) {
    try {
      localStorage.setItem(CACHE_KEY, JSON.stringify({ ts: Date.now(), items }));
    } catch {
      // localStorage may be unavailable (private browsing quota, etc.) — ignore
    }
  }

  // ── Helpers ───────────────────────────────────────────────────
  function formatDate(str) {
    if (!str) return '';
    try {
      return new Date(str).toLocaleDateString('en-US', {
        year: 'numeric', month: 'long', day: 'numeric',
      });
    } catch {
      return '';
    }
  }

  /** Strip HTML tags and collapse whitespace to get plain text */
  function plainText(html) {
    if (!html) return '';
    try {
      const el = document.createElement('div');
      el.innerHTML = html;
      return (el.textContent || el.innerText || '').replace(/\s+/g, ' ').trim();
    } catch {
      return '';
    }
  }

  /** Escape user-supplied strings before injecting into innerHTML */
  function esc(str) {
    if (!str) return '';
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  // ── Render ────────────────────────────────────────────────────
  function renderEmpty() {
    grid.innerHTML =
      '<p class="feed-empty">' +
        'The dispatches are resting. When Jack writes, they appear here automatically.<br>' +
        '<a href="https://knowjack.substack.com" target="_blank" rel="noopener noreferrer">' +
          'Browse the archives →' +
        '</a>' +
      '</p>';
  }

  function buildCard(item) {
    const title   = esc(item.title || 'Untitled Dispatch');
    const link    = esc(item.link  || 'https://knowjack.substack.com');
    const date    = esc(formatDate(item.pubDate));
    const rawText = plainText(item.description || item.content || '');
    const excerpt = rawText.length > 165
      ? esc(rawText.slice(0, 165)) + '…'
      : esc(rawText);
    const cat     = esc((item.categories && item.categories[0]) || 'Dispatch');

    return (
      '<a href="' + link + '" ' +
          'class="feed-card fade-in" ' +
          'target="_blank" rel="noopener noreferrer" ' +
          'aria-label="' + title + '">' +
        '<span class="feed-card-category">' + cat + '</span>' +
        '<h3 class="feed-card-title">' + title + '</h3>' +
        (excerpt ? '<p class="feed-card-excerpt">' + excerpt + '</p>' : '') +
        (date    ? '<time class="feed-card-date">' + date + '</time>' : '') +
      '</a>'
    );
  }

  function renderCards(items) {
    if (!items || items.length === 0) {
      renderEmpty();
      return;
    }
    grid.innerHTML = items.map(buildCard).join('');
    observeNewFadeEls();
  }

  // ── Fetch ─────────────────────────────────────────────────────
  async function loadFeed() {
    // Serve from cache if fresh
    const cached = getCached();
    if (cached) {
      renderCards(cached);
      return;
    }

    try {
      const res = await fetch(API_ENDPOINT);
      if (!res.ok) throw new Error('HTTP ' + res.status);

      const json = await res.json();

      if (json.status === 'ok' && Array.isArray(json.items) && json.items.length > 0) {
        setCache(json.items);
        renderCards(json.items);
      } else {
        renderEmpty();
      }
    } catch (err) {
      // Network failure or API error — show graceful fallback
      console.warn('[TSJ Feed] Could not load dispatches:', err.message);
      renderEmpty();
    }
  }

  loadFeed();
})();

// Generates og-image.png — 1200×630, Brand Law: Global Ink + Global Bone + Honey Gold
const { createCanvas } = require('@napi-rs/canvas');
const fs = require('fs');

const W = 1200, H = 630;
const canvas = createCanvas(W, H);
const ctx = canvas.getContext('2d');

// ── Background ──────────────────────────────────────────────
ctx.fillStyle = '#1C1C1C';
ctx.fillRect(0, 0, W, H);

// ── Atmospheric glow (indigo, top-center) ───────────────────
const glow = ctx.createRadialGradient(W / 2, 200, 0, W / 2, 200, 480);
glow.addColorStop(0,   'rgba(61, 43, 107, 0.30)');
glow.addColorStop(0.6, 'rgba(61, 43, 107, 0.08)');
glow.addColorStop(1,   'rgba(28, 28, 28, 0)');
ctx.fillStyle = glow;
ctx.fillRect(0, 0, W, H);

// ── Gold hairline rules (top + bottom) ──────────────────────
function hairline(y) {
  const g = ctx.createLinearGradient(0, 0, W, 0);
  g.addColorStop(0,    'rgba(201,149,42,0)');
  g.addColorStop(0.15, 'rgba(201,149,42,0.55)');
  g.addColorStop(0.85, 'rgba(201,149,42,0.55)');
  g.addColorStop(1,    'rgba(201,149,42,0)');
  ctx.fillStyle = g;
  ctx.fillRect(0, y, W, 1);
}
hairline(48);
hairline(H - 48);

// ── TSJ monogram (top-left) ──────────────────────────────────
ctx.fillStyle = '#C9952A';
ctx.font = 'bold 28px serif';
ctx.fillText('TSJ', 80, 88);

// ── URL (top-right) ─────────────────────────────────────────
ctx.fillStyle = 'rgba(201,149,42,0.70)';
ctx.font = '18px sans-serif';
ctx.textAlign = 'right';
ctx.fillText('jackstallings.com', W - 80, 85);
ctx.textAlign = 'left';

// ── Eyebrow ──────────────────────────────────────────────────
ctx.fillStyle = 'rgba(245,240,232,0.55)';
ctx.font = '500 15px sans-serif';
ctx.letterSpacing = '4px';
ctx.fillText('TASTE  &  SEE  JACK', 80, 230);

// ── Headline line 1 ──────────────────────────────────────────
ctx.fillStyle = '#F5F0E8';
ctx.font = '400 96px serif';
ctx.fillText('The Art of the', 80, 340);

// ── Headline line 2 (italic gold) ───────────────────────────
ctx.fillStyle = '#C9952A';
ctx.font = 'italic 400 96px serif';
ctx.fillText('Unfinished.', 80, 450);

// ── Sub-copy ─────────────────────────────────────────────────
ctx.fillStyle = 'rgba(245,240,232,0.55)';
ctx.font = '300 20px sans-serif';
ctx.fillText('Grief · Masculinity · The Theology of Friction', 80, 520);

// ── Gold rule left accent ────────────────────────────────────
ctx.fillStyle = '#C9952A';
ctx.fillRect(80, 195, 36, 2);

// ── Write PNG ────────────────────────────────────────────────
const buf = canvas.toBuffer('image/png');
fs.writeFileSync('og-image.png', buf);
console.log('og-image.png written —', (buf.length / 1024).toFixed(1) + 'KB');

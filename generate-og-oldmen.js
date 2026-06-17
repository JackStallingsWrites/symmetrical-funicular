// Generates og-image for "Where Have All the Old Men Gone?"
// Oxblood accent, elegy tone — distinct from the site's gold og-image
const { createCanvas } = require('@napi-rs/canvas');
const fs = require('fs');

const W = 1200, H = 630;
const canvas = createCanvas(W, H);
const ctx = canvas.getContext('2d');

// Background
ctx.fillStyle = '#1C1C1C';
ctx.fillRect(0, 0, W, H);

// Atmospheric glow — deep oxblood, lower center
const glow = ctx.createRadialGradient(W / 2, H * 0.65, 0, W / 2, H * 0.65, 520);
glow.addColorStop(0,   'rgba(74, 15, 20, 0.45)');
glow.addColorStop(0.5, 'rgba(74, 15, 20, 0.15)');
glow.addColorStop(1,   'rgba(28, 28, 28, 0)');
ctx.fillStyle = glow;
ctx.fillRect(0, 0, W, H);

// Hairline rules — oxblood, top + bottom
function hairline(y) {
  const g = ctx.createLinearGradient(0, 0, W, 0);
  g.addColorStop(0,    'rgba(122,30,30,0)');
  g.addColorStop(0.15, 'rgba(122,30,30,0.55)');
  g.addColorStop(0.85, 'rgba(122,30,30,0.55)');
  g.addColorStop(1,    'rgba(122,30,30,0)');
  ctx.fillStyle = g;
  ctx.fillRect(0, y, W, 1);
}
hairline(48);
hairline(H - 48);

// TSJ monogram — gold (brand anchor)
ctx.fillStyle = '#C9952A';
ctx.font = 'bold 28px serif';
ctx.fillText('TSJ', 80, 88);

// URL — bone-dim
ctx.fillStyle = 'rgba(245,240,232,0.45)';
ctx.font = '17px sans-serif';
ctx.textAlign = 'right';
ctx.fillText('jackstallings.com/read', W - 80, 85);
ctx.textAlign = 'left';

// Left oxblood rule accent
ctx.fillStyle = '#7A1E1E';
ctx.fillRect(80, 192, 36, 2);

// Eyebrow
ctx.fillStyle = 'rgba(245,240,232,0.45)';
ctx.font = '500 14px sans-serif';
ctx.fillText('AN ELEGY  ·  JUNE 2026', 80, 228);

// Headline — two lines
ctx.fillStyle = '#F5F0E8';
ctx.font = '400 80px serif';
ctx.fillText('Where Have All', 80, 330);

ctx.font = 'italic 400 80px serif';
ctx.fillText('the Old Men Gone?', 80, 428);

// Dedication
ctx.fillStyle = 'rgba(245,240,232,0.48)';
ctx.font = 'italic 300 22px serif';
ctx.fillText('for Earshel Miller', 80, 500);

// Sub-copy
ctx.fillStyle = 'rgba(245,240,232,0.38)';
ctx.font = '300 18px sans-serif';
ctx.fillText('Startown · Starmount Village · the long ride home', 80, 546);

// Write PNG
const buf = canvas.toBuffer('image/png');
const out = 'read/where-have-all-the-old-men-gone/og-image.png';
fs.writeFileSync(out, buf);
console.log('Written:', out, '—', (buf.length / 1024).toFixed(1) + 'KB');

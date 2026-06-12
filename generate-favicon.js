// Generates favicon.png — 32×32, TSJ monogram, Global Ink + Honey Gold
const { createCanvas } = require('@napi-rs/canvas');
const fs = require('fs');

const S = 32;
const canvas = createCanvas(S, S);
const ctx = canvas.getContext('2d');

// Background
ctx.fillStyle = '#1C1C1C';
ctx.fillRect(0, 0, S, S);

// Gold border rule (1px inset)
ctx.strokeStyle = 'rgba(201,149,42,0.6)';
ctx.lineWidth = 1;
ctx.strokeRect(0.5, 0.5, S - 1, S - 1);

// TSJ — tight, centered
ctx.fillStyle = '#C9952A';
ctx.font = 'bold 11px sans-serif';
ctx.textAlign = 'center';
ctx.textBaseline = 'middle';
ctx.fillText('TSJ', S / 2, S / 2 + 1);

const buf = canvas.toBuffer('image/png');
fs.writeFileSync('favicon.png', buf);
console.log('favicon.png written —', buf.length + 'B');

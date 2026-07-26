// Genera los íconos PWA a partir de un SVG de marca (bolt negro sobre verde ácido).
// Uso: node scripts/gen-pwa-icons.mjs
import sharp from 'sharp';
import { mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const ACID = '#CCFF00';
const outDir = join(dirname(fileURLToPath(import.meta.url)), '..', 'public');
mkdirSync(outDir, { recursive: true });

// Bolt (rayo) de Lucide "zap" en viewBox 24x24.
const boltPath = 'M13 2 L3 14 L12 14 L11 22 L21 10 L12 10 L13 2 Z';

/**
 * SVG cuadrado con fondo verde y el rayo negro centrado.
 * @param {number} size  lado en px
 * @param {number} pad   fracción de padding a cada lado (0 = full-bleed, 0.18 = maskable safe-zone)
 * @param {number} radius radio de esquinas en px (0 para maskable)
 */
function svg(size, pad, radius) {
  const inner = size * (1 - pad * 2);
  const offset = size * pad;
  const scale = inner / 24;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  <rect width="${size}" height="${size}" rx="${radius}" fill="${ACID}"/>
  <g transform="translate(${offset},${offset}) scale(${scale})">
    <path d="${boltPath}" fill="#07070A"/>
  </g>
</svg>`;
}

const targets = [
  { name: 'pwa-192.png', size: 192, pad: 0.22, radius: 40 },
  { name: 'pwa-512.png', size: 512, pad: 0.22, radius: 110 },
  { name: 'pwa-maskable-512.png', size: 512, pad: 0.30, radius: 0 }, // safe-zone para maskable
  { name: 'apple-touch-icon.png', size: 180, pad: 0.22, radius: 0 }, // iOS pone su propia máscara
  { name: 'favicon-64.png', size: 64, pad: 0.18, radius: 12 },
];

for (const t of targets) {
  await sharp(Buffer.from(svg(t.size, t.pad, t.radius))).png().toFile(join(outDir, t.name));
  console.log('✓', t.name);
}

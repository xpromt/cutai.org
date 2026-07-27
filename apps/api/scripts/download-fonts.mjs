import { writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const fontDir = join(__dirname, '..', 'assets', 'fonts');

// Inter v4.1 — official releases from rsms/inter
const BASE = 'https://github.com/rsms/inter/releases/download/v4.1';

const FONTS = [
  { file: 'Inter-Regular.ttf', url: `${BASE}/Inter-Regular.ttf` },
  { file: 'Inter-Bold.ttf', url: `${BASE}/Inter-Bold.ttf` },
];

async function download() {
  for (const font of FONTS) {
    const path = join(fontDir, font.file);
    try {
      const exists = await import('node:fs').then(fs => fs.promises.stat(path).then(() => true).catch(() => false));
      if (exists) {
        console.log(`${font.file} already exists, skipping.`);
        continue;
      }
    } catch {}
    console.log(`Downloading ${font.file}...`);
    const res = await fetch(font.url);
    if (!res.ok) throw new Error(`Failed to download ${font.file}: ${res.status}`);
    const buffer = Buffer.from(await res.arrayBuffer());
    await writeFile(path, buffer);
    console.log(`  Saved ${buffer.length} bytes`);
  }
  console.log('Fonts ready.');
}

download().catch(e => {
  console.error('Download failed:', e.message);
  console.log('Please manually download Inter fonts from:');
  console.log('  https://github.com/rsms/inter/releases/latest');
  console.log('Copy Inter-Regular.ttf and Inter-Bold.ttf to apps/api/assets/fonts/');
});

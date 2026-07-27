import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const FONT_DIR = join(__dirname, '..', '..', '..', 'assets', 'fonts');

let loaded = false;
let regularFont: ArrayBuffer | null = null;
let boldFont: ArrayBuffer | null = null;

export interface FontData {
  name: string;
  data: ArrayBuffer;
  weight: 400 | 700;
  style: 'normal';
}

export async function loadFonts(): Promise<FontData[]> {
  if (loaded) {
    return getLoadedFonts();
  }

  try {
    regularFont = await readFile(join(FONT_DIR, 'Inter-Regular.ttf')).then(b => b.buffer as ArrayBuffer);
    boldFont = await readFile(join(FONT_DIR, 'Inter-Bold.ttf')).then(b => b.buffer as ArrayBuffer);
  } catch {
    console.warn('Font files not found at', FONT_DIR, '- badge rendering will fail without fonts');
  }

  loaded = true;
  return getLoadedFonts();
}

function getLoadedFonts(): FontData[] {
  const fonts: FontData[] = [];
  if (regularFont) {
    fonts.push({ name: 'Inter', data: regularFont, weight: 400, style: 'normal' });
  }
  if (boldFont) {
    fonts.push({ name: 'Inter', data: boldFont, weight: 700, style: 'normal' });
  }
  return fonts;
}

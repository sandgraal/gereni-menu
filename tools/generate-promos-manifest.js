#!/usr/bin/env node

const fs = require('fs/promises');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const PROMOS_DIR = path.join(ROOT, 'assets', 'promos');
const OUTPUT_PATH = path.join(PROMOS_DIR, 'promos.json');
const ALLOWED_EXTENSIONS = new Set([
  '.png',
  '.jpg',
  '.jpeg',
  '.webp',
  '.avif',
  '.svg',
  '.mp4'
]);

async function ensureDirectory() {
  try {
    await fs.access(PROMOS_DIR);
    return true;
  } catch (error) {
    if (error && error.code === 'ENOENT') {
      return false;
    }

    throw error;
  }
}

async function readPromoFiles() {
  if (!(await ensureDirectory())) {
    return [];
  }

  const entries = await fs.readdir(PROMOS_DIR, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    if (!entry.isFile()) {
      continue;
    }

    const ext = path.extname(entry.name).toLowerCase();
    if (!ALLOWED_EXTENSIONS.has(ext)) {
      continue;
    }

    const filePath = path.join(PROMOS_DIR, entry.name);
    const stats = await fs.stat(filePath);

    files.push({
      name: entry.name,
      mtime: stats.mtimeMs,
      updatedAt: stats.mtime.toISOString()
    });
  }

  files.sort((a, b) => {
    if (b.mtime !== a.mtime) {
      return b.mtime - a.mtime;
    }

    return a.name.localeCompare(b.name, 'en');
  });

  return files.map(file => ({
    src: `assets/promos/${file.name}`,
    updatedAt: file.updatedAt
  }));
}

async function writeManifest(items) {
  const payload = {
    generatedAt: new Date().toISOString(),
    items
  };

  const content = `${JSON.stringify(payload, null, 2)}\n`;
  await fs.writeFile(OUTPUT_PATH, content, 'utf8');
}

async function main() {
  try {
    const items = await readPromoFiles();
    await writeManifest(items);
    if (process.env.CI) {
      console.log(`Generated promo manifest with ${items.length} item(s).`);
    }
  } catch (error) {
    console.error('No fue posible generar el manifiesto de promociones.');
    console.error(error);
    process.exitCode = 1;
  }
}

main();

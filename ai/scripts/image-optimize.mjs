// ai/scripts/image-optimize.mjs
import { readdir, stat, mkdir, writeFile, copyFile } from 'node:fs/promises';
import { createWriteStream, existsSync } from 'node:fs';
import path from 'node:path';

const SOURCE_DIR = path.join(process.cwd(), 'assets', 'photos');
const OUTPUT_DIR = path.join(SOURCE_DIR, 'optimized');
const TARGET_WIDTHS = [640, 1280];
const QUALITY = 80;
const LOG_PATH = path.join(process.cwd(), 'ai', 'logs', 'menu-image.jsonl');

async function ensureDir(dir) {
  await mkdir(dir, { recursive: true });
}

function isProcessableFile(file) {
  const allowed = ['.png', '.jpg', '.jpeg'];
  return allowed.includes(path.extname(file).toLowerCase());
}

async function gatherSourceFiles() {
  const entries = await readdir(SOURCE_DIR, { withFileTypes: true });
  return entries
    .filter(entry => entry.isFile() && isProcessableFile(entry.name))
    .map(entry => path.join(SOURCE_DIR, entry.name));
}

function outputName(base, suffix, extension = 'webp') {
  const extless = base.replace(/\.[^.]+$/, '');
  return `${extless}-${suffix}.${extension}`;
}

async function needsRegeneration(srcPath, destPath) {
  try {
    const [srcStat, destStat] = await Promise.all([stat(srcPath), stat(destPath)]);
    return destStat.mtimeMs < srcStat.mtimeMs;
  } catch (err) {
    if (err && err.code === 'ENOENT') {
      return true;
    }
    throw err;
  }
}

async function writeManifest(manifest) {
  const manifestPath = path.join(OUTPUT_DIR, 'manifest.json');
  const payload = {
    ai_generated: true,
    generated_at: new Date().toISOString(),
    items: manifest
  };
  await writeFile(manifestPath, JSON.stringify(payload, null, 2));
}

async function appendLog(entry) {
  const logDir = path.dirname(LOG_PATH);
  if (!existsSync(logDir)) {
    await mkdir(logDir, { recursive: true });
  }
  await writeFile(LOG_PATH, JSON.stringify(entry) + '\n', { flag: 'a' });
}

let cachedSharp = undefined;
async function loadSharp() {
  if (cachedSharp !== undefined) {
    return cachedSharp;
  }
  try {
    const mod = await import('sharp');
    cachedSharp = mod.default || mod;
    return cachedSharp;
  } catch (error) {
    console.warn('[image] sharp no está disponible; se realizará copia sin conversión.');
    cachedSharp = null;
    return cachedSharp;
  }
}

async function processWithSharp(sharp, filePath, fileName) {
  const results = [];
  const metadata = await sharp(filePath).metadata();
  const naturalWidth = metadata.width || null;

  for (const width of TARGET_WIDTHS) {
    if (naturalWidth && width > naturalWidth) {
      continue;
    }
    const targetName = outputName(fileName, `${width}w`);
    const destPath = path.join(OUTPUT_DIR, targetName);
    const regenerate = await needsRegeneration(filePath, destPath);
    if (!regenerate) {
      results.push({
        source: fileName,
        output: targetName,
        width,
        reused: true
      });
      continue;
    }

    await new Promise((resolve, reject) => {
      const transformer = sharp(filePath)
        .resize({ width, withoutEnlargement: true })
        .webp({ quality: QUALITY, effort: 6 });
      const outStream = createWriteStream(destPath);
      outStream.on('finish', resolve);
      outStream.on('error', reject);
      transformer.on('error', reject);
      transformer.pipe(outStream);
    });

    const { size } = await stat(destPath);
    results.push({
      source: fileName,
      output: targetName,
      width,
      reused: false,
      bytes: size
    });
  }

  if (results.length === 0) {
    const fallbackName = outputName(fileName, 'original', path.extname(fileName).slice(1));
    const destPath = path.join(OUTPUT_DIR, fallbackName);
    await copyFile(filePath, destPath);
    const { size } = await stat(destPath);
    results.push({
      source: fileName,
      output: fallbackName,
      width: naturalWidth,
      reused: false,
      bytes: size,
      note: 'copied-original'
    });
  }

  return results;
}

async function processWithoutSharp(filePath, fileName) {
  const targetName = outputName(fileName, 'original', path.extname(fileName).slice(1));
  const destPath = path.join(OUTPUT_DIR, targetName);
  const regenerate = await needsRegeneration(filePath, destPath);
  if (regenerate) {
    await copyFile(filePath, destPath);
  }
  const { size } = await stat(destPath);
  return [{
    source: fileName,
    output: targetName,
    width: null,
    reused: !regenerate,
    bytes: size,
    note: 'copied-original'
  }];
}

async function processImage(filePath) {
  const fileName = path.basename(filePath);
  const sharp = await loadSharp();
  if (sharp) {
    return processWithSharp(sharp, filePath, fileName);
  }
  return processWithoutSharp(filePath, fileName);
}

async function main() {
  const start = Date.now();
  await ensureDir(OUTPUT_DIR);

  const files = await gatherSourceFiles();
  if (files.length === 0) {
    console.warn('[image] No se encontraron imágenes en assets/photos');
  }

  const manifest = [];
  let optimizedCount = 0;

  for (const file of files) {
    const outputs = await processImage(file);
    manifest.push({
      source: path.basename(file),
      variants: outputs
    });
    optimizedCount += outputs.filter(entry => !entry.reused).length;
  }

  await writeManifest(manifest);

  const logEntry = {
    ts: new Date().toISOString(),
    ai_generated: true,
    agent: 'menu-image',
    status: 'ok',
    duration_ms: Date.now() - start,
    sources: files.length,
    optimized: optimizedCount
  };

  await appendLog(logEntry);
  console.log(`[image] Variantes procesadas: ${optimizedCount} (${files.length} archivos origen).`);
}

main().catch(async error => {
  const logEntry = {
    ts: new Date().toISOString(),
    ai_generated: true,
    agent: 'menu-image',
    status: 'error',
    duration_ms: 0,
    error: error.message
  };
  await appendLog(logEntry).catch(() => {});
  console.error('[image] Error durante la optimización:', error);
  process.exit(1);
});

#!/usr/bin/env node

const fs = require('fs/promises');
const path = require('path');
const sharp = require('sharp');

const SOURCE_DIR = path.join(process.cwd(), 'assets/photos');
const OUTPUT_ROOT = path.join(process.cwd(), 'public/images');
const MANIFEST_NAME = 'manifest.json';

const IMAGE_EXTENSIONS = new Set(['.jpg', '.jpeg', '.png', '.heic', '.heif', '.tif', '.tiff']);
const ANGLE_TAGS = new Set([
  'top',
  'side',
  'front',
  'back',
  '45deg',
  'iso',
  'detail',
  'angled',
]);

const ASPECT_RATIOS = {
  '1x1': [1, 1],
  '4x3': [4, 3],
  '16x9': [16, 9],
};

const TARGET_WIDTHS = [640, 1280, 1920, 2560];
const OUTPUT_FORMATS = [
  { ext: 'avif', sharpFormat: 'avif', options: { quality: 60, effort: 4 } },
  { ext: 'webp', sharpFormat: 'webp', options: { quality: 80 } },
  { ext: 'jpg', sharpFormat: 'jpeg', options: { quality: 85, progressive: true } },
];

const DRY_RUN =
  process.argv.includes('--dry-run') ||
  (process.env.DRY_RUN && ['1', 'true', 'yes'].includes(process.env.DRY_RUN.toLowerCase()));

async function pathExists(filePath) {
  try {
    await fs.access(filePath);
    return true;
  } catch (error) {
    return false;
  }
}

function normalisePath(inputPath) {
  return inputPath.split(path.sep).join('/');
}

function parseImageFilename(filename) {
  const { name } = path.parse(filename);
  const parts = name.split('-');
  if (parts.length === 0) {
    return { slug: name, angle: null };
  }

  const last = parts[parts.length - 1].toLowerCase();
  if (ANGLE_TAGS.has(last)) {
    return {
      slug: parts.slice(0, -1).join('-') || name,
      angle: last,
    };
  }

  return { slug: name, angle: null };
}

async function collectSourceFiles(dir) {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    if (entry.name.startsWith('.')) continue;
    if (entry.isDirectory()) {
      if (entry.name === 'optimized') continue;
      const nested = await collectSourceFiles(path.join(dir, entry.name));
      files.push(...nested);
    } else {
      const ext = path.extname(entry.name).toLowerCase();
      if (!IMAGE_EXTENSIONS.has(ext)) continue;
      files.push(path.join(dir, entry.name));
    }
  }

  return files;
}

async function ensureDirectory(targetDir) {
  if (DRY_RUN) {
    return;
  }
  await fs.mkdir(targetDir, { recursive: true });
}

async function generateVariant({
  sourcePath,
  outputPath,
  width,
  height,
  format,
  options,
  sourceStat,
}) {
  const outputExists = await pathExists(outputPath);
  if (outputExists) {
    const outputStat = await fs.stat(outputPath);
    if (outputStat.mtimeMs >= sourceStat.mtimeMs) {
      return { generated: false, mtimeMs: outputStat.mtimeMs };
    }
  }

  if (DRY_RUN) {
    console.log(`[dry-run] Would generate ${normalisePath(path.relative(process.cwd(), outputPath))}`);
    const dryTime = outputExists ? (await fs.stat(outputPath)).mtimeMs : sourceStat.mtimeMs;
    return { generated: false, mtimeMs: dryTime };
  }

  await sharp(sourcePath)
    .rotate()
    .resize(width, height, { fit: 'cover', position: 'attention' })
    .toFormat(format, options)
    .toFile(outputPath);

  const newStat = await fs.stat(outputPath);
  return { generated: true, mtimeMs: newStat.mtimeMs };
}

async function processImage(filePath, manifestBySlug) {
  try {
    const sourceStat = await fs.stat(filePath);
    const image = sharp(filePath);
    const metadata = await image.metadata();
    if (!metadata.width || !metadata.height) {
      console.warn(`Skipping ${filePath}: unable to read dimensions`);
      return;
    }

    const relativeSource = normalisePath(path.relative(process.cwd(), filePath));
    const { slug, angle } = parseImageFilename(path.basename(filePath));
    if (!slug) {
      console.warn(`Skipping ${filePath}: unable to derive slug`);
      return;
    }

    const slugDir = path.join(OUTPUT_ROOT, slug);
    await ensureDirectory(slugDir);

    const slugKey = slug;
    if (!manifestBySlug.has(slugKey)) {
      manifestBySlug.set(slugKey, {
        slug,
        aiGenerated: true,
        original: {
          width: metadata.width,
          height: metadata.height,
          format: metadata.format || path.extname(filePath).replace('.', ''),
        },
        sources: [],
        variants: [],
      });
    }

    const manifestEntry = manifestBySlug.get(slugKey);
    manifestEntry.sources.push({
      file: relativeSource,
      angle,
      modifiedAt: new Date(sourceStat.mtimeMs).toISOString(),
    });

    for (const [aspectKey, [ratioW, ratioH]] of Object.entries(ASPECT_RATIOS)) {
      for (const width of TARGET_WIDTHS) {
        const height = Math.round((width * ratioH) / ratioW);
        if (width > metadata.width || height > metadata.height) {
          continue;
        }

        const baseName = `${slug}${angle ? `-${angle}` : ''}-${aspectKey}-${width}w`;
        const variantInfo = {
          angle,
          aspect: aspectKey,
          width,
          height,
          files: {},
          updatedAt: null,
        };
        let hasAnyFile = false;
        let latestMtime = 0;

        for (const { ext, sharpFormat, options } of OUTPUT_FORMATS) {
          const outputPath = path.join(slugDir, `${baseName}.${ext}`);
          const result = await generateVariant({
            sourcePath: filePath,
            outputPath,
            width,
            height,
            format: sharpFormat,
            options,
            sourceStat,
          });

          const existsNow = DRY_RUN ? await pathExists(outputPath) : true;
          if (DRY_RUN && !existsNow) {
            // In dry-run without an existing file, we only log and skip manifest entry.
            continue;
          }

          const outputStat = existsNow ? await fs.stat(outputPath) : null;
          const fileMtime = outputStat ? outputStat.mtimeMs : result.mtimeMs;
          latestMtime = Math.max(latestMtime, fileMtime);
          const relativeOutput = normalisePath(path.relative(process.cwd(), outputPath));
          variantInfo.files[ext] = {
            path: relativeOutput,
            regenerated: result.generated,
          };
          hasAnyFile = true;
        }

        if (hasAnyFile) {
          variantInfo.updatedAt = new Date(latestMtime).toISOString();
          manifestEntry.variants.push(variantInfo);
        }
      }
    }
  } catch (error) {
    console.error(`Error processing ${filePath}:`, error.message);
  }
}

async function writeManifest(slug, entry) {
  if (entry.variants.length === 0) {
    return;
  }

  const manifestPath = path.join(OUTPUT_ROOT, slug, MANIFEST_NAME);
  const latestVariantTime = entry.variants.reduce((max, variant) => {
    if (!variant.updatedAt) return max;
    const time = Date.parse(variant.updatedAt);
    return Number.isNaN(time) ? max : Math.max(max, time);
  }, 0);
  entry.generatedAt = latestVariantTime ? new Date(latestVariantTime).toISOString() : null;

  const payload = JSON.stringify(entry, null, 2);

  if (DRY_RUN) {
    console.log(`[dry-run] Would write manifest for ${slug} at ${normalisePath(path.relative(process.cwd(), manifestPath))}`);
    return;
  }

  await fs.writeFile(manifestPath, `${payload}\n`);
}

async function main() {
  const sourceExists = await pathExists(SOURCE_DIR);
  if (!sourceExists) {
    console.error(`Source directory not found: ${SOURCE_DIR}`);
    process.exitCode = 1;
    return;
  }

  const manifestBySlug = new Map();
  const files = await collectSourceFiles(SOURCE_DIR);
  if (files.length === 0) {
    console.log('No source images found.');
    return;
  }

  console.log(`Processing ${files.length} source image${files.length === 1 ? '' : 's'}...`);
  for (const file of files) {
    await processImage(file, manifestBySlug);
  }

  for (const [slug, entry] of manifestBySlug.entries()) {
    await writeManifest(slug, entry);
  }

  console.log('Image processing complete.');
}

main().catch((error) => {
  console.error('Unexpected error:', error);
  process.exitCode = 1;
});

#!/usr/bin/env node

/**
 * Test suite for promo showcase functionality
 * Verifies:
 * 1. Promos manifest exists and is valid
 * 2. All referenced files exist
 * 3. Files follow naming conventions
 * 4. No broken references (e.g., noche_mascarada.jpg)
 */

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const PROMOS_DIR = path.join(ROOT, 'assets', 'promos');
const MANIFEST_PATH = path.join(PROMOS_DIR, 'promos.json');
const ALLOWED_EXTENSIONS = ['.png', '.jpg', '.jpeg', '.webp', '.avif', '.svg', '.mp4'];

let passed = 0;
let failed = 0;

function assert(condition, message) {
  if (condition) {
    console.log(`✓ ${message}`);
    passed++;
  } else {
    console.error(`✗ ${message}`);
    failed++;
  }
}

// Test 1: Manifest file exists
const manifestExists = fs.existsSync(MANIFEST_PATH);
assert(manifestExists, 'promos.json manifest exists');

if (!manifestExists) {
  console.error('\nCannot continue tests without manifest file');
  process.exit(1);
}

// Test 2: Manifest is valid JSON
let manifest;
try {
  const content = fs.readFileSync(MANIFEST_PATH, 'utf8');
  manifest = JSON.parse(content);
  assert(true, 'promos.json is valid JSON');
} catch (error) {
  assert(false, 'promos.json is valid JSON');
  console.error(`Parse error: ${error.message}`);
  process.exit(1);
}

// Test 3: Manifest has required structure
assert(
  manifest && typeof manifest === 'object',
  'manifest is an object'
);
assert(
  typeof manifest.generatedAt === 'string',
  'manifest has generatedAt timestamp'
);
assert(
  Array.isArray(manifest.items),
  'manifest has items array'
);

// Test 4: All referenced files exist
if (Array.isArray(manifest.items)) {
  manifest.items.forEach((item, index) => {
    const src = item.src;
    const filePath = path.join(ROOT, src);
    
    assert(
      fs.existsSync(filePath),
      `item ${index + 1}: file exists (${src})`
    );
    
    // Check if file extension is allowed
    const ext = path.extname(src).toLowerCase();
    assert(
      ALLOWED_EXTENSIONS.includes(ext),
      `item ${index + 1}: has allowed extension (${ext})`
    );
    
    // Check if MP4 files follow naming convention
    if (ext === '.mp4') {
      const fileName = path.basename(src);
      // Naming convention: YYYY-MM-descriptive-name.mp4 (descriptive name uses lowercase letters, numbers, and hyphens)
      const followsConvention = /^\d{4}-\d{2}-[a-z0-9]+(-[a-z0-9]+)*\.mp4$/.test(fileName);
      assert(
        followsConvention,
        `item ${index + 1}: MP4 follows naming convention (${fileName})`
      );
    }
  });
}

// Test 5: No broken references (specifically check for noche_mascarada.jpg)
const hasBrokenMascarada = manifest.items.some(item => 
  item.src.includes('noche_mascarada.jpg')
);
assert(
  !hasBrokenMascarada,
  'no reference to broken noche_mascarada.jpg file'
);

// Test 6: No old timestamp-based filenames
const hasTimestampFilename = manifest.items.some(item => {
  const fileName = path.basename(item.src);
  return /^VIDEO-\d{4}-\d{2}-\d{2}-\d{2}-\d{2}-\d{2}/.test(fileName);
});
assert(
  !hasTimestampFilename,
  'no timestamp-based filenames (e.g., VIDEO-2025-12-04-22-53-11.mp4)'
);

// Test 7: Verify promoShowcase.js exists and handles MP4 files
const promoScriptPath = path.join(ROOT, 'scripts', 'promoShowcase.js');
assert(
  fs.existsSync(promoScriptPath),
  'promoShowcase.js script exists'
);

const promoScript = fs.readFileSync(promoScriptPath, 'utf8');
assert(
  promoScript.includes('isVideoSource'),
  'promoShowcase.js has video detection logic'
);
assert(
  promoScript.includes('.mp4'),
  'promoShowcase.js checks for .mp4 extension'
);
// Test for video element creation logic (checking for key parts without exact string match)
const hasVideoCreation = promoScript.includes('createElement') && 
                         promoScript.includes('video') && 
                         promoScript.includes('img');
assert(
  hasVideoCreation,
  'promoShowcase.js creates video elements for MP4 files'
);

// Summary
console.log(`\n${passed} test(s) passed${failed > 0 ? `, ${failed} failed` : ''}.`);
process.exit(failed > 0 ? 1 : 0);

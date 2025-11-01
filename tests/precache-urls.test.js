const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');

const tests = [];

function test(name, fn) {
  tests.push({ name, fn });
}

// Helper to load and parse the generated precache URLs
function loadPrecacheUrls() {
  const precacheImagePath = path.join(__dirname, '..', 'scripts', 'precache-images.js');
  
  if (!fs.existsSync(precacheImagePath)) {
    throw new Error('precache-images.js not found. Run "npm run build:precache" first.');
  }
  
  const content = fs.readFileSync(precacheImagePath, 'utf8');
  
  // Extract the MENU_IMAGE_URLS array from the file
  const match = content.match(/const MENU_IMAGE_URLS = (\[[\s\S]*?\]);/);
  if (!match) {
    throw new Error('Could not parse MENU_IMAGE_URLS from precache-images.js');
  }
  
  return JSON.parse(match[1]);
}

test('precache-images.js includes base images from menu.json', () => {
  const urls = loadPrecacheUrls();
  
  // Check that base images are included
  const hasBaseImages = urls.some(url => url.startsWith('assets/photos/'));
  assert.ok(hasBaseImages, 'Should include base images from assets/photos/');
});

test('precache-images.js includes responsive variants', () => {
  const urls = loadPrecacheUrls();
  
  // Check for different widths
  const has640w = urls.some(url => url.includes('640w'));
  const has1280w = urls.some(url => url.includes('1280w'));
  const has1920w = urls.some(url => url.includes('1920w'));
  
  assert.ok(has640w, 'Should include 640w variants');
  assert.ok(has1280w, 'Should include 1280w variants');
  assert.ok(has1920w, 'Should include 1920w variants');
});

test('precache-images.js includes modern image formats', () => {
  const urls = loadPrecacheUrls();
  
  const hasAvif = urls.some(url => url.endsWith('.avif'));
  const hasWebp = urls.some(url => url.endsWith('.webp'));
  const hasJpg = urls.some(url => url.endsWith('.jpg'));
  
  assert.ok(hasAvif, 'Should include .avif format');
  assert.ok(hasWebp, 'Should include .webp format');
  assert.ok(hasJpg, 'Should include .jpg format');
});

test('precache-images.js has no duplicate URLs', () => {
  const urls = loadPrecacheUrls();
  const uniqueUrls = new Set(urls);
  
  assert.equal(
    urls.length,
    uniqueUrls.size,
    'Should not contain duplicate URLs'
  );
});

test('precache-images.js URLs are properly formatted', () => {
  const urls = loadPrecacheUrls();
  
  for (const url of urls) {
    assert.ok(typeof url === 'string', 'Each URL should be a string');
    assert.ok(url.trim() === url, 'URLs should not have leading/trailing whitespace');
    assert.ok(url.length > 0, 'URLs should not be empty');
  }
});

test('service-worker.js uses the generated MENU_IMAGE_URLS', () => {
  const swPath = path.join(__dirname, '..', 'service-worker.js');
  const swContent = fs.readFileSync(swPath, 'utf8');
  const precacheUrls = loadPrecacheUrls();
  
  // Verify that service worker contains at least some of the URLs from precache-images
  let matchCount = 0;
  for (const url of precacheUrls.slice(0, 10)) {
    if (swContent.includes(url)) {
      matchCount++;
    }
  }
  
  assert.ok(
    matchCount >= 5,
    `Service worker should contain at least 5 URLs from precache-images.js (found ${matchCount})`
  );
});

(async () => {
  let failures = 0;

  for (const { name, fn } of tests) {
    try {
      await fn();
      console.log(`✓ ${name}`);
    } catch (error) {
      failures += 1;
      console.error(`✗ ${name}`);
      console.error(error.stack);
    }
  }

  if (failures > 0) {
    console.error(`\n${failures} test(s) failed.`);
    process.exitCode = 1;
    return;
  }

  console.log(`\n${tests.length} test(s) passed.`);
})();

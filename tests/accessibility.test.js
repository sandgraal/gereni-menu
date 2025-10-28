#!/usr/bin/env node

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const tests = [];

function test(name, fn) {
  tests.push({ name, fn });
}

// Read HTML file once at module level for better performance
const indexPath = path.join(__dirname, '..', 'index.html');
const html = fs.readFileSync(indexPath, 'utf8');

test('promo image has aria-describedby attribute', () => {
  // Check that the promo image has aria-describedby on the same <img> tag
  // Use a regex that works regardless of attribute order
  const hasClassAndAria = 
    /<img[^>]*(class=["'][^"']*home-highlights__poster[^"']*["'][^>]*aria-describedby=["']promo-details["']|aria-describedby=["']promo-details["'][^>]*class=["'][^"']*home-highlights__poster[^"']*["'])[^>]*>/i.test(html);
  
  assert.ok(
    hasClassAndAria,
    'Promo image should have aria-describedby="promo-details" on the same <img> element'
  );
});

test('promo description span exists with sr-only class', () => {
  // Check that the description span exists
  assert.ok(
    html.includes('id="promo-details"') && html.includes('class="sr-only"'),
    'Description span should exist with id="promo-details" and class="sr-only"'
  );
});

test('promo description includes price information', () => {
  // Check that the description includes price with standard format (₡5.500)
  assert.ok(
    html.includes('₡5.500'),
    'Description should include the price ₡5.500'
  );
});

test('promo description includes deadline information', () => {
  // Check that the description mentions the deadline (either in Spanish or English)
  assert.ok(
    html.includes('domingo') || html.includes('Sunday'),
    'Description should mention the deadline (domingo/Sunday)'
  );
});

test('promo description has bilingual support', () => {
  // Check that the description has both Spanish and English versions
  const hasSpanish = html.includes('data-i18n-es=') && html.includes('Lasaña con vino tinto');
  const hasEnglish = html.includes('data-i18n-en=') && html.includes('Lasagna with red wine');
  
  assert.ok(
    hasSpanish && hasEnglish,
    'Description should have both Spanish (data-i18n-es) and English (data-i18n-en) translations'
  );
});

// Run all tests
let passed = 0;
let failed = 0;

tests.forEach(({ name, fn }) => {
  try {
    fn();
    console.log(`✓ ${name}`);
    passed++;
  } catch (err) {
    console.error(`✗ ${name}`);
    console.error(`  ${err.message}`);
    failed++;
  }
});

console.log(`\n${passed} test(s) passed${failed > 0 ? `, ${failed} failed` : ''}.`);
process.exit(failed > 0 ? 1 : 0);

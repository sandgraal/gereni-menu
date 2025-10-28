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

test('home panel exposes a navigation landmark', () => {
  const panelPattern = /<div[^>]*class=\"home-panel\"[^>]*role=\"navigation\"[^>]*aria-label=\"/i;

  assert.ok(
    panelPattern.test(html),
    'Home panel should expose role="navigation" with an aria-label for assistive tech'
  );
});

test('quick actions are presented as an unordered list', () => {
  const listPattern = /<ul[^>]*class=\"home-actions\"[^>]*>[\s\S]*?<\/ul>/i;
  const itemPattern = /<li[^>]*class=\"home-actions__item\"[^>]*>/i;

  assert.ok(listPattern.test(html), 'Quick actions list <ul class="home-actions"> should exist');
  assert.ok(itemPattern.test(html), 'Quick actions should use <li class="home-actions__item"> elements');
});

test('download link keeps dynamic class for PDF swapping', () => {
  const downloadPattern = /<a[^>]*class=\"[^\"]*link-download[^\"]*\"[^>]*href=\"output\/Menu_Gereni_digital_es_dark.pdf\"[^>]*>/i;

  assert.ok(
    downloadPattern.test(html),
    'Download action should keep link-download class so the PDF updater can find it'
  );
});

test('social links remain external and open in a new tab', () => {
  const socialPattern = /<a[^>]*class=\"[^\"]*home-actions__link--social[^\"]*\"[^>]*>/gi;
  const matches = html.match(socialPattern) || [];

  assert.ok(matches.length >= 2, 'Both social actions should be rendered');

  matches.forEach((match) => {
    assert.ok(match.includes('target="_blank"'), 'Social actions should use target="_blank"');
    assert.ok(match.includes('rel="noopener"'), 'Social actions should include rel="noopener"');
  });
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

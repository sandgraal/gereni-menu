#!/usr/bin/env node

const assert = require('node:assert/strict');
const { JSDOM } = require('jsdom');
const fs = require('node:fs');
const path = require('node:path');

const tests = [];

function test(name, fn) {
  tests.push({ name, fn });
}

test('index.html should not have duplicate script tags', () => {
  const indexPath = path.join(__dirname, '../index.html');
  const html = fs.readFileSync(indexPath, 'utf-8');
  const dom = new JSDOM(html);
  const scripts = dom.window.document.querySelectorAll('script[src]');
  
  const scriptSrcs = new Map();
  
  scripts.forEach((script) => {
    const src = script.getAttribute('src');
    scriptSrcs.set(src, (scriptSrcs.get(src) || 0) + 1);
  });
  
  const duplicates = [];
  scriptSrcs.forEach((count, src) => {
    if (count > 1) {
      duplicates.push(`${src} (${count} times)`);
    }
  });
  
  assert.strictEqual(
    duplicates.length,
    0,
    `Found duplicate script tags: ${duplicates.join(', ')}`
  );
});

// Run all tests
function runTests() {
  console.log(`Running ${tests.length} test(s)...\n`);
  
  let passed = 0;
  let failed = 0;
  
  for (const { name, fn } of tests) {
    try {
      fn();
      console.log(`✓ ${name}`);
      passed++;
    } catch (err) {
      console.error(`✗ ${name}`);
      console.error(`  ${err.message}`);
      if (err.stack) {
        console.error(err.stack.split('\n').slice(1, 4).join('\n'));
      }
      failed++;
    }
  }
  
  console.log(`\n${passed} test(s) passed${failed > 0 ? `, ${failed} failed` : ''}.`);
  
  if (failed > 0) {
    process.exit(1);
  }
}

runTests();

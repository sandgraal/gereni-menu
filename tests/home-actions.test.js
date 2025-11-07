#!/usr/bin/env node

const assert = require('node:assert/strict');
const { JSDOM } = require('jsdom');
const fs = require('node:fs');
const path = require('node:path');

const tests = [];

function test(name, fn) {
  tests.push({ name, fn });
}

function setupDOM() {
  const html = `
    <!DOCTYPE html>
    <html>
    <head></head>
    <body>
      <ul data-home-actions data-home-actions-source="data/home-actions.json"></ul>
    </body>
    </html>
  `;
  
  const dom = new JSDOM(html, {
    runScripts: 'dangerously',
    resources: 'usable',
    url: 'http://localhost'
  });
  
  return dom;
}

function loadHomeActions(dom, mockFetch) {
  const homeActionsPath = path.join(__dirname, '../scripts/homeActions.js');
  const homeActionsCode = fs.readFileSync(homeActionsPath, 'utf-8');
  
  // Mock fetch before loading the script
  if (mockFetch) {
    dom.window.fetch = mockFetch;
  }
  
  dom.window.eval(homeActionsCode);
  return dom.window;
}

// Test rel attribute behavior with newTab
test('rel attribute defaults to "noopener" when newTab is true and rel is not provided', () => {
  const dom = setupDOM();
  
  // Mock fetch to return test data
  const mockFetch = () => Promise.resolve({
    ok: true,
    json: () => Promise.resolve({
      actions: [
        {
          id: 'test-action',
          href: 'https://example.com',
          variant: 'primary',
          title: { es: 'Test', en: 'Test' },
          description: { es: 'Test desc', en: 'Test desc' },
          icon: 'menu',
          newTab: true
          // Note: no rel attribute provided
        }
      ]
    })
  });
  
  const window = loadHomeActions(dom, mockFetch);
  
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      try {
        const link = window.document.querySelector('[data-home-action-id="test-action"]');
        assert.ok(link, 'Link should exist');
        assert.strictEqual(link.target, '_blank', 'Target should be _blank');
        assert.strictEqual(link.rel, 'noopener', 'Rel should default to noopener');
        resolve();
      } catch (err) {
        reject(err);
      }
    }, 100);
  });
});

// Test custom rel attribute with newTab
test('rel attribute uses custom value when newTab is true and rel is provided', () => {
  const dom = setupDOM();
  
  const mockFetch = () => Promise.resolve({
    ok: true,
    json: () => Promise.resolve({
      actions: [
        {
          id: 'test-action-custom',
          href: 'https://example.com',
          variant: 'primary',
          title: { es: 'Test', en: 'Test' },
          description: { es: 'Test desc', en: 'Test desc' },
          icon: 'menu',
          newTab: true,
          rel: 'noopener noreferrer'
        }
      ]
    })
  });
  
  const window = loadHomeActions(dom, mockFetch);
  
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      try {
        const link = window.document.querySelector('[data-home-action-id="test-action-custom"]');
        assert.ok(link, 'Link should exist');
        assert.strictEqual(link.target, '_blank', 'Target should be _blank');
        assert.strictEqual(link.rel, 'noopener noreferrer', 'Rel should use custom value');
        resolve();
      } catch (err) {
        reject(err);
      }
    }, 100);
  });
});

// Test rel attribute without newTab
test('rel attribute is not set when newTab is false and rel is not provided', () => {
  const dom = setupDOM();
  
  const mockFetch = () => Promise.resolve({
    ok: true,
    json: () => Promise.resolve({
      actions: [
        {
          id: 'test-action-no-tab',
          href: '/menu.html',
          variant: 'primary',
          title: { es: 'Test', en: 'Test' },
          description: { es: 'Test desc', en: 'Test desc' },
          icon: 'menu',
          newTab: false
          // Note: no rel attribute provided
        }
      ]
    })
  });
  
  const window = loadHomeActions(dom, mockFetch);
  
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      try {
        const link = window.document.querySelector('[data-home-action-id="test-action-no-tab"]');
        assert.ok(link, 'Link should exist');
        assert.strictEqual(link.target, '', 'Target should be empty');
        assert.strictEqual(link.rel, '', 'Rel should be empty');
        resolve();
      } catch (err) {
        reject(err);
      }
    }, 100);
  });
});

// Test rel attribute set when newTab is false but rel is provided
test('rel attribute uses custom value when newTab is false but rel is provided', () => {
  const dom = setupDOM();
  
  const mockFetch = () => Promise.resolve({
    ok: true,
    json: () => Promise.resolve({
      actions: [
        {
          id: 'test-action-rel-only',
          href: '/menu.html',
          variant: 'primary',
          title: { es: 'Test', en: 'Test' },
          description: { es: 'Test desc', en: 'Test desc' },
          icon: 'menu',
          newTab: false,
          rel: 'prefetch'
        }
      ]
    })
  });
  
  const window = loadHomeActions(dom, mockFetch);
  
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      try {
        const link = window.document.querySelector('[data-home-action-id="test-action-rel-only"]');
        assert.ok(link, 'Link should exist');
        assert.strictEqual(link.target, '', 'Target should be empty');
        assert.strictEqual(link.rel, 'prefetch', 'Rel should use custom value');
        resolve();
      } catch (err) {
        reject(err);
      }
    }, 100);
  });
});

// Run all tests
async function runTests() {
  console.log(`Running ${tests.length} test(s)...\n`);
  
  let passed = 0;
  let failed = 0;
  
  for (const { name, fn } of tests) {
    try {
      await fn();
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
  
  console.log(`\n${passed} passed, ${failed} failed`);
  
  if (failed > 0) {
    process.exit(1);
  }
}

runTests();

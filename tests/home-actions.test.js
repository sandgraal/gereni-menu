#!/usr/bin/env node

const assert = require('node:assert/strict');
const { JSDOM } = require('jsdom');
const fs = require('node:fs');
const path = require('node:path');

const tests = [];

function test(name, fn) {
  tests.push({ name, fn });
}

function setupDOM(actionsData) {
  const html = `
    <!DOCTYPE html>
    <html>
    <head></head>
    <body>
      <ul data-home-actions data-home-actions-source="test-actions.json"></ul>
    </body>
    </html>
  `;
  
  const dom = new JSDOM(html, {
    runScripts: 'dangerously',
    resources: 'usable',
    url: 'http://localhost'
  });
  
  // Mock fetch to return test data
  dom.window.fetch = () => {
    return Promise.resolve({
      ok: true,
      json: () => Promise.resolve(actionsData)
    });
  };
  
  return dom;
}

function loadHomeActions(dom) {
  const homeActionsPath = path.join(__dirname, '../scripts/homeActions.js');
  const homeActionsCode = fs.readFileSync(homeActionsPath, 'utf-8');
  dom.window.eval(homeActionsCode);
  return dom.window;
}

test('Link with newTab and no rel should have rel="noopener"', () => {
  const actionsData = {
    actions: [
      {
        id: 'test-link',
        href: 'test.html',
        title: { es: 'Test' },
        description: { es: 'Test description' },
        icon: 'menu',
        newTab: true
      }
    ]
  };
  
  const dom = setupDOM(actionsData);
  loadHomeActions(dom);
  
  return new Promise((resolve) => {
    setTimeout(() => {
      const list = dom.window.document.querySelector('[data-home-actions]');
      const link = list.querySelector('a');
      assert.ok(link, 'Link should exist');
      assert.strictEqual(link.target, '_blank', 'Link should have target="_blank"');
      assert.strictEqual(link.rel, 'noopener', 'Link should have rel="noopener"');
      resolve();
    }, 100);
  });
});

test('Link with newTab and custom rel should use custom rel', () => {
  const actionsData = {
    actions: [
      {
        id: 'test-link',
        href: 'test.html',
        title: { es: 'Test' },
        description: { es: 'Test description' },
        icon: 'menu',
        newTab: true,
        rel: 'noreferrer noopener'
      }
    ]
  };
  
  const dom = setupDOM(actionsData);
  loadHomeActions(dom);
  
  return new Promise((resolve) => {
    setTimeout(() => {
      const list = dom.window.document.querySelector('[data-home-actions]');
      const link = list.querySelector('a');
      assert.ok(link, 'Link should exist');
      assert.strictEqual(link.target, '_blank', 'Link should have target="_blank"');
      assert.strictEqual(link.rel, 'noreferrer noopener', 'Link should have custom rel value');
      resolve();
    }, 100);
  });
});

test('Link without newTab and with rel should have rel attribute', () => {
  const actionsData = {
    actions: [
      {
        id: 'test-link',
        href: 'test.html',
        title: { es: 'Test' },
        description: { es: 'Test description' },
        icon: 'menu',
        newTab: false,
        rel: 'prefetch'
      }
    ]
  };
  
  const dom = setupDOM(actionsData);
  loadHomeActions(dom);
  
  return new Promise((resolve) => {
    setTimeout(() => {
      const list = dom.window.document.querySelector('[data-home-actions]');
      const link = list.querySelector('a');
      assert.ok(link, 'Link should exist');
      assert.strictEqual(link.target, '', 'Link should not have target attribute');
      assert.strictEqual(link.rel, 'prefetch', 'Link should have custom rel value');
      resolve();
    }, 100);
  });
});

test('Link without newTab and without rel should not have rel attribute', () => {
  const actionsData = {
    actions: [
      {
        id: 'test-link',
        href: 'test.html',
        title: { es: 'Test' },
        description: { es: 'Test description' },
        icon: 'menu',
        newTab: false
      }
    ]
  };
  
  const dom = setupDOM(actionsData);
  loadHomeActions(dom);
  
  return new Promise((resolve) => {
    setTimeout(() => {
      const list = dom.window.document.querySelector('[data-home-actions]');
      const link = list.querySelector('a');
      assert.ok(link, 'Link should exist');
      assert.strictEqual(link.target, '', 'Link should not have target attribute');
      assert.strictEqual(link.rel, '', 'Link should not have rel attribute');
      resolve();
    }, 100);
  });
});

// Run all tests
(async () => {
  console.log(`Running ${tests.length} test(s)...`);
  console.log();

  let passed = 0;
  let failed = 0;

  for (const { name, fn } of tests) {
    try {
      await fn();
      console.log(`✔ ${name}`);
      passed++;
    } catch (err) {
      console.log(`✖ ${name}`);
      console.error(`  ${err.message}`);
      if (err.stack) {
        console.error(err.stack.split('\n').slice(1, 4).join('\n'));
      }
      failed++;
    }
  }

  console.log();
  console.log(`${passed} passed, ${failed} failed`);
  process.exit(failed > 0 ? 1 : 0);
})();

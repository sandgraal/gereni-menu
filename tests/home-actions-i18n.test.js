#!/usr/bin/env node

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { JSDOM } = require('jsdom');

const tests = [];

function test(name, fn) {
  tests.push({ name, fn });
}

test('homeActions applies current language after rendering JSON actions', async () => {
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
    url: 'http://localhost',
    runScripts: 'dangerously',
    resources: 'usable'
  });

  const { window } = dom;
  const { document } = window;

  // Set up localStorage before scripts load
  Object.defineProperty(window, 'localStorage', {
    value: {
      getItem: (key) => {
        if (key === 'gereni-language') {
          return 'en';
        }
        return null;
      },
      setItem: () => {}
    },
    writable: true,
    configurable: true
  });

  window.fetch = async (url) => {
    if (url.includes('home-actions.json')) {
      return {
        ok: true,
        json: async () => ({
          actions: [
            {
              id: 'test-action',
              href: '#test',
              variant: 'primary',
              title: { es: 'Título en Español', en: 'Title in English' },
              description: { es: 'Descripción en Español', en: 'Description in English' },
              icon: 'menu'
            }
          ]
        })
      };
    }
    throw new Error('Not found');
  };

  // Load scripts in order
  const i18nScript = document.createElement('script');
  i18nScript.textContent = fs.readFileSync(path.join(__dirname, '..', 'scripts', 'i18n.js'), 'utf8');
  document.body.appendChild(i18nScript);

  const homeActionsScript = document.createElement('script');
  homeActionsScript.textContent = fs.readFileSync(path.join(__dirname, '..', 'scripts', 'homeActions.js'), 'utf8');
  document.body.appendChild(homeActionsScript);

  await new Promise(resolve => setTimeout(resolve, 100));

  const titleElement = document.querySelector('.home-actions__title');
  const descElement = document.querySelector('.home-actions__description');

  assert.ok(titleElement, 'Title element should exist after rendering');
  assert.ok(descElement, 'Description element should exist after rendering');
  
  assert.strictEqual(
    titleElement.textContent,
    'Title in English',
    'Title should be in English when language preference is "en"'
  );
  
  assert.strictEqual(
    descElement.textContent,
    'Description in English',
    'Description should be in English when language preference is "en"'
  );

  assert.ok(
    titleElement.hasAttribute('data-i18n-es'),
    'Title should have Spanish translation data attribute'
  );
  
  assert.ok(
    titleElement.hasAttribute('data-i18n-en'),
    'Title should have English translation data attribute'
  );
});

test('homeActions sets i18n data attributes on rendered elements', async () => {
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
    url: 'http://localhost',
    runScripts: 'dangerously',
    resources: 'usable'
  });

  const { window } = dom;
  const { document } = window;

  // Set up localStorage before scripts load
  Object.defineProperty(window, 'localStorage', {
    value: {
      getItem: (key) => {
        if (key === 'gereni-language') {
          return 'es';
        }
        return null;
      },
      setItem: () => {}
    },
    writable: true,
    configurable: true
  });
  
  window.fetch = async (url) => {
    if (url.includes('home-actions.json')) {
      return {
        ok: true,
        json: async () => ({
          actions: [
            {
              id: 'test-action',
              href: '#test',
              variant: 'primary',
              title: { es: 'Ver el Menú', en: 'View the Menu' },
              description: { es: 'Descripción', en: 'Description' },
              icon: 'menu'
            }
          ]
        })
      };
    }
    throw new Error('Not found');
  };

  // Load scripts in order
  const i18nScript = document.createElement('script');
  i18nScript.textContent = fs.readFileSync(path.join(__dirname, '..', 'scripts', 'i18n.js'), 'utf8');
  document.body.appendChild(i18nScript);

  const homeActionsScript = document.createElement('script');
  homeActionsScript.textContent = fs.readFileSync(path.join(__dirname, '..', 'scripts', 'homeActions.js'), 'utf8');
  document.body.appendChild(homeActionsScript);

  await new Promise(resolve => setTimeout(resolve, 100));

  const titleElement = document.querySelector('.home-actions__title');
  
  assert.ok(titleElement, 'Title element should exist');
  assert.strictEqual(
    titleElement.getAttribute('data-i18n-es'),
    'Ver el Menú',
    'Should have correct Spanish translation data attribute'
  );
  assert.strictEqual(
    titleElement.getAttribute('data-i18n-en'),
    'View the Menu',
    'Should have correct English translation data attribute'
  );
});

// Run all tests
let passed = 0;
let failed = 0;

(async () => {
  for (const { name, fn } of tests) {
    try {
      await fn();
      console.log(`✓ ${name}`);
      passed++;
    } catch (err) {
      console.error(`✗ ${name}`);
      console.error(`  ${err.message}`);
      console.error(err.stack);
      failed++;
    }
  }

  console.log(`\n${passed} test(s) passed${failed > 0 ? `, ${failed} failed` : ''}.`);
  process.exit(failed > 0 ? 1 : 0);
})();

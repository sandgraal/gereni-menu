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
      <div id="menu-container">
        <div>Menu content</div>
      </div>
    </body>
    </html>
  `;
  
  const dom = new JSDOM(html, {
    runScripts: 'dangerously',
    resources: 'usable'
  });
  
  return dom;
}

function loadScrollHelper(dom) {
  const scrollHelperPath = path.join(__dirname, '../scripts/scrollHelper.js');
  const scrollHelperCode = fs.readFileSync(scrollHelperPath, 'utf-8');
  dom.window.eval(scrollHelperCode);
  return dom.window;
}

test('GereniScrollHelper initializes and provides API', () => {
  const dom = setupDOM();
  const window = loadScrollHelper(dom);
  
  // Wait for initialization
  return new Promise((resolve) => {
    setTimeout(() => {
      assert.ok(window.GereniScrollHelper);
      assert.ok(typeof window.GereniScrollHelper.getMaxScroll === 'function');
      assert.ok(typeof window.GereniScrollHelper.recompute === 'function');
      assert.ok(typeof window.GereniScrollHelper.subscribe === 'function');
      assert.ok(typeof window.GereniScrollHelper.scheduleUpdate === 'function');
      resolve();
    }, 10);
  });
});

test('GereniScrollHelper dispatches gereni:scrollLimitsUpdated event', () => {
  const dom = setupDOM();
  const window = loadScrollHelper(dom);
  
  return new Promise((resolve) => {
    window.document.addEventListener('gereni:scrollLimitsUpdated', (event) => {
      assert.ok(event.detail);
      assert.ok(typeof event.detail.maxScroll === 'number');
      resolve();
    });
    
    setTimeout(() => {
      window.GereniScrollHelper.recompute();
    }, 10);
  });
});

test('GereniScrollHelper recomputes on gereni:languagechange', () => {
  const dom = setupDOM();
  const window = loadScrollHelper(dom);
  
  return new Promise((resolve) => {
    let updateReceived = false;
    
    window.document.addEventListener('gereni:scrollLimitsUpdated', () => {
      if (updateReceived) {
        // Second update from language change
        resolve();
      }
      updateReceived = true;
    });
    
    // Trigger language change after initial update
    setTimeout(() => {
      const event = new window.CustomEvent('gereni:languagechange', {
        detail: { lang: 'en' }
      });
      window.document.dispatchEvent(event);
    }, 20);
  });
});

test('GereniScrollHelper recomputes on window resize', () => {
  const dom = setupDOM();
  const window = loadScrollHelper(dom);
  
  return new Promise((resolve) => {
    let updateReceived = false;
    
    window.document.addEventListener('gereni:scrollLimitsUpdated', () => {
      if (updateReceived) {
        // Second update from resize
        resolve();
      }
      updateReceived = true;
    });
    
    // Trigger resize after initial update
    setTimeout(() => {
      const event = new window.Event('resize');
      window.dispatchEvent(event);
    }, 20);
  });
});

test('GereniScrollHelper recomputes on gereni:menuRendered', () => {
  const dom = setupDOM();
  const window = loadScrollHelper(dom);
  
  return new Promise((resolve) => {
    let updateReceived = false;
    
    window.document.addEventListener('gereni:scrollLimitsUpdated', () => {
      if (updateReceived) {
        // Second update from menu rendered
        resolve();
      }
      updateReceived = true;
    });
    
    // Trigger menu rendered after initial update
    setTimeout(() => {
      const event = new window.CustomEvent('gereni:menuRendered');
      window.document.dispatchEvent(event);
    }, 20);
  });
});

test('GereniScrollHelper subscription works correctly', () => {
  const dom = setupDOM();
  const window = loadScrollHelper(dom);
  
  return new Promise((resolve) => {
    let notified = false;
    
    const unsubscribe = window.GereniScrollHelper.subscribe((maxScroll) => {
      notified = true;
      assert.ok(typeof maxScroll === 'number');
    });
    
    setTimeout(() => {
      assert.ok(notified, 'Subscriber should be notified immediately');
      
      // Test unsubscribe
      unsubscribe();
      resolve();
    }, 10);
  });
});

// Run tests
(async () => {
  console.log(`Running ${tests.length} test(s)...\n`);
  let passed = 0;
  let failed = 0;
  
  for (const { name, fn } of tests) {
    try {
      await fn();
      console.log(`✔ ${name}`);
      passed++;
    } catch (err) {
      console.error(`✖ ${name}`);
      console.error(`  ${err.message}`);
      if (err.stack) {
        console.error(err.stack.split('\n').slice(1, 4).join('\n'));
      }
      failed++;
    }
  }
  
  console.log(`\n${passed} passed, ${failed} failed`);
  process.exit(failed > 0 ? 1 : 0);
})();

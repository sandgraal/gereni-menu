#!/usr/bin/env node

const assert = require('node:assert/strict');

const tests = [];

function test(name, fn) {
  tests.push({ name, fn });
}

// Mock service worker environment
function createServiceWorkerEnv() {
  const caches = new Map();
  
  return {
    self: {
      location: new URL('https://example.com/')
    },
    caches: {
      async open(cacheName) {
        if (!caches.has(cacheName)) {
          caches.set(cacheName, new Map());
        }
        const cache = caches.get(cacheName);
        return {
          async match(request) {
            const url = typeof request === 'string' ? request : request.url;
            return cache.get(url);
          },
          async put(request, response) {
            const url = typeof request === 'string' ? request : request.url;
            cache.set(url, response);
          }
        };
      }
    },
    fetch: null, // Will be mocked per test
    URL,
    Error
  };
}

// Simulate the networkFirstShell function
function createNetworkFirstShell(env) {
  return async (request) => {
    const cache = await env.caches.open('SHELL_CACHE');
    try {
      const response = await env.fetch(request);
      if (response && response.ok) {
        await cache.put(request, { ...response, clone: () => response });
        return response;
      }
      throw new Error(`Network response not ok: ${response.status}`);
    } catch (error) {
      const cached = await cache.match(request);
      if (cached) {
        return cached;
      }
      throw error;
    }
  };
}

test('networkFirstShell returns network response when ok', async () => {
  const env = createServiceWorkerEnv();
  const networkFirstShell = createNetworkFirstShell(env);
  
  env.fetch = async () => ({
    ok: true,
    status: 200,
    body: 'fresh content'
  });
  
  const response = await networkFirstShell({ url: 'https://example.com/style.css' });
  assert.equal(response.status, 200);
  assert.equal(response.body, 'fresh content');
});

test('networkFirstShell falls back to cache on 304 response', async () => {
  const env = createServiceWorkerEnv();
  const networkFirstShell = createNetworkFirstShell(env);
  
  // Pre-populate cache
  const cache = await env.caches.open('SHELL_CACHE');
  await cache.put({ url: 'https://example.com/style.css' }, {
    ok: true,
    status: 200,
    body: 'cached content'
  });
  
  // Network returns 304
  env.fetch = async () => ({
    ok: false,
    status: 304,
    body: ''
  });
  
  const response = await networkFirstShell({ url: 'https://example.com/style.css' });
  assert.equal(response.status, 200);
  assert.equal(response.body, 'cached content');
});

test('networkFirstShell falls back to cache on 404 response', async () => {
  const env = createServiceWorkerEnv();
  const networkFirstShell = createNetworkFirstShell(env);
  
  // Pre-populate cache
  const cache = await env.caches.open('SHELL_CACHE');
  await cache.put({ url: 'https://example.com/script.js' }, {
    ok: true,
    status: 200,
    body: 'cached script'
  });
  
  // Network returns 404
  env.fetch = async () => ({
    ok: false,
    status: 404,
    body: 'Not Found'
  });
  
  const response = await networkFirstShell({ url: 'https://example.com/script.js' });
  assert.equal(response.status, 200);
  assert.equal(response.body, 'cached script');
});

test('networkFirstShell falls back to cache on network error', async () => {
  const env = createServiceWorkerEnv();
  const networkFirstShell = createNetworkFirstShell(env);
  
  // Pre-populate cache
  const cache = await env.caches.open('SHELL_CACHE');
  await cache.put({ url: 'https://example.com/app.js' }, {
    ok: true,
    status: 200,
    body: 'cached app'
  });
  
  // Network throws error
  env.fetch = async () => {
    throw new Error('Network error');
  };
  
  const response = await networkFirstShell({ url: 'https://example.com/app.js' });
  assert.equal(response.status, 200);
  assert.equal(response.body, 'cached app');
});

test('networkFirstShell throws when no cache and network fails', async () => {
  const env = createServiceWorkerEnv();
  const networkFirstShell = createNetworkFirstShell(env);
  
  env.fetch = async () => {
    throw new Error('Network error');
  };
  
  await assert.rejects(
    async () => await networkFirstShell({ url: 'https://example.com/missing.js' }),
    Error
  );
});

test('networkFirstShell throws when no cache and response not ok', async () => {
  const env = createServiceWorkerEnv();
  const networkFirstShell = createNetworkFirstShell(env);
  
  env.fetch = async () => ({
    ok: false,
    status: 500,
    body: 'Server Error'
  });
  
  await assert.rejects(
    async () => await networkFirstShell({ url: 'https://example.com/error.js' }),
    /Network response not ok: 500/
  );
});

test('networkFirstShell caches successful network responses', async () => {
  const env = createServiceWorkerEnv();
  const networkFirstShell = createNetworkFirstShell(env);
  
  env.fetch = async () => ({
    ok: true,
    status: 200,
    body: 'new content',
    clone: function() { return this; }
  });
  
  await networkFirstShell({ url: 'https://example.com/new.css' });
  
  // Verify it was cached by simulating a failed network
  env.fetch = async () => {
    throw new Error('Network error');
  };
  
  const response = await networkFirstShell({ url: 'https://example.com/new.css' });
  assert.equal(response.status, 200);
  assert.equal(response.body, 'new content');
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

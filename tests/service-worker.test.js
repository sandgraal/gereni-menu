const assert = require('node:assert/strict');

const tests = [];

function test(name, fn) {
  tests.push({ name, fn });
}

// Mock service worker environment
function createServiceWorkerEnv() {
  const caches = new Map();

  class FakeRequest {
    constructor(input, init = {}) {
      if (typeof input === 'string') {
        this.url = input;
        this.method = 'GET';
      } else if (input && typeof input === 'object') {
        this.url = input.url;
        this.method = input.method || 'GET';
      } else {
        throw new TypeError('Invalid request input');
      }

      if (init.cache) {
        this.cache = init.cache;
      }
    }
  }

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
    Request: FakeRequest,
    URL,
    Error
  };
}

// Simulate the staleWhileRevalidateShell function
function createStaleWhileRevalidateShell(env) {
  return async (request, event = { waitUntil() {} }) => {
    const cache = await env.caches.open('SHELL_CACHE');
    const cached = await cache.match(request);

    let fetchError;
    const networkFetch = env
      .fetch(request)
      .then(async (response) => {
        if (response && response.ok) {
          const clonedResponse = { ...response };
          await cache.put(request, clonedResponse);
        }
        return response;
      })
      .catch((error) => {
        fetchError = error;
        return undefined;
      });

    if (event && typeof event.waitUntil === 'function') {
      event.waitUntil(networkFetch.then(() => undefined));
    }

    if (cached) {
      return cached;
    }

    const networkResponse = await networkFetch;
    if (networkResponse) {
      return networkResponse;
    }

    const fallback = await cache.match(request);
    if (fallback) {
      return fallback;
    }

    if (fetchError) {
      throw fetchError;
    }

    throw new Error('Network request failed and no cache available.');
  };
}

test('staleWhileRevalidateShell returns cached response and updates in background', async () => {
  const env = createServiceWorkerEnv();
  const staleWhileRevalidateShell = createStaleWhileRevalidateShell(env);

  const cache = await env.caches.open('SHELL_CACHE');
  await cache.put({ url: 'https://example.com/style.css' }, {
    ok: true,
    status: 200,
    body: 'cached content'
  });

  let fetchCalled = false;
  env.fetch = async () => {
    fetchCalled = true;
    return {
      ok: true,
      status: 200,
      body: 'fresh content'
    };
  };

  const waitUntilPromises = [];
  const event = {
    waitUntil(promise) {
      waitUntilPromises.push(promise);
    }
  };

  const response = await staleWhileRevalidateShell({ url: 'https://example.com/style.css' }, event);
  assert.equal(response.body, 'cached content');
  assert.equal(fetchCalled, true);

  await Promise.all(waitUntilPromises);
  const updated = await cache.match({ url: 'https://example.com/style.css' });
  assert.equal(updated.body, 'fresh content');
});

test('staleWhileRevalidateShell returns network response when cache missing', async () => {
  const env = createServiceWorkerEnv();
  const staleWhileRevalidateShell = createStaleWhileRevalidateShell(env);

  env.fetch = async () => ({
    ok: true,
    status: 200,
    body: 'network content'
  });

  const response = await staleWhileRevalidateShell({ url: 'https://example.com/new.css' });
  assert.equal(response.status, 200);
  assert.equal(response.body, 'network content');

  const cache = await env.caches.open('SHELL_CACHE');
  const cached = await cache.match({ url: 'https://example.com/new.css' });
  assert.equal(cached.body, 'network content');
});

test('staleWhileRevalidateShell falls back to cache on network error', async () => {
  const env = createServiceWorkerEnv();
  const staleWhileRevalidateShell = createStaleWhileRevalidateShell(env);

  const cache = await env.caches.open('SHELL_CACHE');
  await cache.put({ url: 'https://example.com/app.js' }, {
    ok: true,
    status: 200,
    body: 'cached app'
  });

  env.fetch = async () => {
    throw new Error('Network error');
  };

  const response = await staleWhileRevalidateShell({ url: 'https://example.com/app.js' });
  assert.equal(response.status, 200);
  assert.equal(response.body, 'cached app');
});

test('staleWhileRevalidateShell throws when no cache and network fails', async () => {
  const env = createServiceWorkerEnv();
  const staleWhileRevalidateShell = createStaleWhileRevalidateShell(env);

  env.fetch = async () => {
    throw new Error('Network error');
  };

  await assert.rejects(
    async () => await staleWhileRevalidateShell({ url: 'https://example.com/missing.js' }),
    /Network error/
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

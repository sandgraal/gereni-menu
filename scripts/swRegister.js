(function registerServiceWorker() {
  if (typeof window !== 'undefined' && window.__DISABLE_SW__) {
    return;
  }

  if (!('serviceWorker' in navigator) || !navigator.serviceWorker) {
    return;
  }

  const swPath = 'service-worker.js';
  const register = () => {
    navigator.serviceWorker.register(swPath).catch(error => {
      console.warn('[SW] Registration failed:', error);
    });
  };

  if (document.readyState === 'complete') {
    register();
  } else {
    window.addEventListener('load', register, { once: true });
  }
})();

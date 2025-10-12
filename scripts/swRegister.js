(function registerServiceWorker() {
  if (!('serviceWorker' in navigator)) {
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

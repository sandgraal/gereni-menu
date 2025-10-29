(function() {
  'use strict';

  const promosRoot = document.querySelector('[data-promos-root]');
  if (!promosRoot) {
    return;
  }

  const MANIFEST_URL = 'assets/promos/promos.json';

  function resolveItems(manifest) {
    if (!manifest) return [];
    if (Array.isArray(manifest.items)) return manifest.items;
    if (Array.isArray(manifest)) return manifest;
    return [];
  }

  function normalizeSource(entry) {
    if (entry && typeof entry === 'object' && typeof entry.src === 'string') {
      return entry.src.trim();
    }

    if (typeof entry === 'string') {
      return entry.trim();
    }

    return '';
  }

  function isAllowedSource(src) {
    if (!src) return false;
    return src.startsWith('assets/promos/');
  }

  function createPromoElement(src, index) {
    const wrapper = document.createElement('div');
    wrapper.className = 'home-promos__item';

    const img = document.createElement('img');
    img.className = 'home-promos__image';
    img.src = src;
    img.alt = '';
    img.decoding = 'async';
    img.setAttribute('aria-hidden', 'true');
    if (index > 0) {
      img.loading = 'lazy';
    }

    wrapper.appendChild(img);
    return wrapper;
  }

  fetch(MANIFEST_URL, { cache: 'no-store' })
    .then(response => {
      if (!response.ok) {
        throw new Error('Failed to load promo manifest');
      }

      return response.json();
    })
    .then(manifest => {
      const urls = resolveItems(manifest)
        .map(normalizeSource)
        .filter(isAllowedSource);

      if (urls.length === 0) {
        return;
      }

      const fragment = document.createDocumentFragment();
      urls.forEach((src, index) => {
        fragment.appendChild(createPromoElement(src, index));
      });

      promosRoot.appendChild(fragment);
      promosRoot.removeAttribute('hidden');
      promosRoot.setAttribute('data-promos-count', String(urls.length));
    })
    .catch(() => {
      // Si no se encuentra el manifiesto o es inválido, mantenemos la sección oculta.
    });
})();

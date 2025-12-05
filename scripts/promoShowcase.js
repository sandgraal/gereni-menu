(function() {
  'use strict';

  const promosRoot = document.querySelector('[data-promos-root]');
  if (!promosRoot) {
    return;
  }

  const MANIFEST_URL = 'assets/promos/promos.json';
  const PROMO_STATES = {
    LOADING: 'loading',
    READY: 'ready',
    EMPTY: 'empty'
  };

  function setPromoState(state) {
    promosRoot.dataset.promosState = state;

    if (state === PROMO_STATES.READY) {
      promosRoot.removeAttribute('aria-hidden');
      // Removed BEM class operations; rely on data attribute for state
      return;
    }

    promosRoot.setAttribute('aria-hidden', 'true');
    // Removed BEM class operations; rely on data attribute for state

    // No need to add/remove BEM classes for loading state
  }

  function collapsePromos() {
    setPromoState(PROMO_STATES.EMPTY);
    promosRoot.removeAttribute('data-promos-count');
  }

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

  function isVideoSource(src) {
    return src.toLowerCase().endsWith('.mp4');
  }

  function createPromoElement(src, index) {
    const wrapper = document.createElement('div');
    wrapper.className = 'home-promos__item';

    const isVideo = isVideoSource(src);
    const media = document.createElement(isVideo ? 'video' : 'img');
    media.className = 'home-promos__media';
    media.src = src;
    media.setAttribute('aria-hidden', 'true');

    if (isVideo) {
      media.autoplay = true;
      media.loop = true;
      media.muted = true;
      media.playsInline = true;
      media.preload = index > 0 ? 'none' : 'metadata';
    } else {
      media.alt = '';
      media.decoding = 'async';
      if (index > 0) {
        media.loading = 'lazy';
      }
    }

    wrapper.appendChild(media);
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
        collapsePromos();
        return;
      }

      const fragment = document.createDocumentFragment();
      urls.forEach((src, index) => {
        fragment.appendChild(createPromoElement(src, index));
      });

      promosRoot.appendChild(fragment);
      promosRoot.setAttribute('data-promos-count', String(urls.length));
      setPromoState(PROMO_STATES.READY);
    })
    .catch(() => {
      // Si no se encuentra el manifiesto o es inválido, mantenemos la sección oculta.
      collapsePromos();
    });
})();

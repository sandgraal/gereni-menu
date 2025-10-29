(() => {
  const PANEL_SELECTOR = '.home-panel';
  const EFFECT_ATTRIBUTE = 'data-seasonal-effect';
  const HALLOWEEN_VALUE = 'halloween';
  const BODY_CLASS = 'holiday--halloween';
  const OVERLAY_CLASS = 'seasonal-overlay';

  let observer = null;
  let overlay = null;

  const motionQuery = typeof window !== 'undefined' && typeof window.matchMedia === 'function'
    ? window.matchMedia('(prefers-reduced-motion: reduce)')
    : null;

  function isMotionReduced() {
    return motionQuery ? motionQuery.matches : false;
  }

  function ensureOverlay() {
    if (overlay) {
      return overlay;
    }
    const container = document.createElement('div');
    container.className = OVERLAY_CLASS;
    container.setAttribute('aria-hidden', 'true');
    container.innerHTML = [
      '<div class="seasonal-overlay__glow"></div>',
      '<div class="seasonal-overlay__bats" aria-hidden="true">',
      '  <span class="seasonal-overlay__bat seasonal-overlay__bat--left"></span>',
      '  <span class="seasonal-overlay__bat seasonal-overlay__bat--right"></span>',
      '</div>',
      '<div class="seasonal-overlay__lanterns" aria-hidden="true">',
      '  <span class="seasonal-overlay__lantern seasonal-overlay__lantern--front"></span>',
      '  <span class="seasonal-overlay__lantern seasonal-overlay__lantern--rear"></span>',
      '</div>'
    ].join('');
    overlay = container;
    return overlay;
  }

  function removeOverlay() {
    if (overlay && overlay.isConnected) {
      overlay.remove();
    }
  }

  function disableEffect() {
    removeOverlay();
    if (document.body) {
      document.body.classList.remove(BODY_CLASS);
    }
  }

  function hasHalloweenCard(panel) {
    if (!panel) {
      return false;
    }
    return Boolean(panel.querySelector(`[${EFFECT_ATTRIBUTE}="${HALLOWEEN_VALUE}"]`));
  }

  function updateEffect() {
    const body = document.body;
    if (!body || !body.classList.contains('inicio')) {
      disableEffect();
      return;
    }

    const panel = document.querySelector(PANEL_SELECTOR);
    const shouldEnable = hasHalloweenCard(panel) && !isMotionReduced();

    if (!shouldEnable) {
      disableEffect();
      return;
    }

    body.classList.add(BODY_CLASS);
    const overlayElement = ensureOverlay();
    if (overlayElement && !overlayElement.isConnected) {
      body.appendChild(overlayElement);
    }
  }

  function handleMutation() {
    updateEffect();
  }

  function observePanel(panel) {
    if (!panel) {
      return;
    }
    if (observer) {
      observer.disconnect();
    }
    observer = new MutationObserver(handleMutation);
    observer.observe(panel, {
      subtree: true,
      childList: true,
      attributes: true,
      attributeFilter: [EFFECT_ATTRIBUTE]
    });
    updateEffect();
  }

  function init() {
    if (!document.body || !document.body.classList.contains('inicio')) {
      return;
    }
    const panel = document.querySelector(PANEL_SELECTOR);
    if (panel) {
      observePanel(panel);
    } else {
      updateEffect();
    }
  }

  if (motionQuery) {
    if (typeof motionQuery.addEventListener === 'function') {
      motionQuery.addEventListener('change', updateEffect);
    } else if (typeof motionQuery.addListener === 'function') {
      motionQuery.addListener(updateEffect);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init, { once: true });
  } else {
    init();
  }
})();

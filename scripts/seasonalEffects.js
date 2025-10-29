(() => {
  const PANEL_SELECTOR = '.home-panel';
  const EFFECT_ATTRIBUTE = 'data-seasonal-effect';
  const HALLOWEEN_VALUE = 'halloween';
  const BODY_CLASS = 'holiday--halloween';
  const OVERLAY_CLASS = 'seasonal-overlay';
  const SPIDER_LAYER_CLASS = 'seasonal-overlay__spider-layer';
  const SPIDER_CLASS = 'seasonal-overlay__spider';
  const SPIDER_BODY_CLASS = 'seasonal-overlay__spider-body';
  const SPIDER_EYES_CLASS = 'seasonal-overlay__spider-eyes';
  const SPIDER_WEB_CLASS = 'seasonal-overlay__spider-web';
  const SPIDER_ANIMATION_CLASS = 'seasonal-overlay__spider--animating';
  const MIN_SPIDER_INTERVAL = 4500;
  const MAX_SPIDER_INTERVAL = 9000;
  const MAX_ACTIVE_SPIDERS = 4;

  let observer = null;
  let overlay = null;
  let spiderLayer = null;
  let spiderTimeout = null;
  const activeSpiders = new Set();

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
    spiderLayer = document.createElement('div');
    spiderLayer.className = SPIDER_LAYER_CLASS;
    spiderLayer.setAttribute('aria-hidden', 'true');
    overlay.appendChild(spiderLayer);
    return overlay;
  }

  function removeOverlay() {
    if (overlay && overlay.isConnected) {
      overlay.remove();
      overlay = null;
      spiderLayer = null;
    }
  }

  function disableEffect() {
    stopSpiders();
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
    if (spiderLayer) {
      startSpiders();
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

  // Store reference to handler for cleanup
  const motionQueryHandler = updateEffect;
  let motionQueryCleanup = null;
  if (motionQuery) {
    if (typeof motionQuery.addEventListener === 'function') {
      motionQuery.addEventListener('change', motionQueryHandler);
      motionQueryCleanup = () => {
        motionQuery.removeEventListener('change', motionQueryHandler);
      };
    } else if (typeof motionQuery.addListener === 'function') {
      motionQuery.addListener(motionQueryHandler);
      motionQueryCleanup = () => {
        motionQuery.removeListener(motionQueryHandler);
      };
    }
  }
  // Remove event listener on unload to prevent memory leaks
  if (motionQueryCleanup) {
    window.addEventListener('unload', motionQueryCleanup);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init, { once: true });
  } else {
    init();
  }

  function createSpiderElement() {
    if (!spiderLayer) {
      return null;
    }
    const spider = document.createElement('div');
    spider.className = `${SPIDER_CLASS} ${SPIDER_ANIMATION_CLASS}`;
    const body = document.createElement('span');
    body.className = SPIDER_BODY_CLASS;
    const eyes = document.createElement('span');
    eyes.className = SPIDER_EYES_CLASS;
    const thread = document.createElement('span');
    thread.className = SPIDER_WEB_CLASS;
    spider.appendChild(body);
    spider.appendChild(eyes);
    spider.appendChild(thread);

    const offset = Math.random();
    const horizontalPosition = Math.round(offset * 100);
    spider.style.setProperty('--spider-left', `${horizontalPosition}%`);
    spider.style.setProperty('--spider-scale', String(0.85 + Math.random() * 0.5));
    const duration = 4 + Math.random() * 3;
    spider.style.setProperty('--spider-duration', `${duration.toFixed(2)}s`);
    const swayDirection = Math.random() > 0.5 ? '1' : '-1';
    spider.style.setProperty('--spider-sway-direction', swayDirection);

    spider.addEventListener('animationend', () => {
      activeSpiders.delete(spider);
      spider.remove();
    }, { once: true });

    activeSpiders.add(spider);
    spiderLayer.appendChild(spider);
    return spider;
  }

  function scheduleNextSpider() {
    if (spiderTimeout) {
      clearTimeout(spiderTimeout);
    }
    const delay = Math.round(
      MIN_SPIDER_INTERVAL + Math.random() * (MAX_SPIDER_INTERVAL - MIN_SPIDER_INTERVAL)
    );
    spiderTimeout = window.setTimeout(() => {
      spiderTimeout = null;
      if (activeSpiders.size < MAX_ACTIVE_SPIDERS) {
        createSpiderElement();
      }
      scheduleNextSpider();
    }, delay);
  }

  function startSpiders() {
    if (!spiderLayer || spiderTimeout) {
      return;
    }
    // Warm up with an immediate spider to reinforce the Halloween mood.
    if (activeSpiders.size === 0) {
      createSpiderElement();
    }
    scheduleNextSpider();
  }

  function stopSpiders() {
    if (spiderTimeout) {
      clearTimeout(spiderTimeout);
      spiderTimeout = null;
    }
    if (activeSpiders.size > 0) {
      activeSpiders.forEach((spider) => {
        if (spider && spider.isConnected) {
          spider.remove();
        }
      });
      activeSpiders.clear();
    }
  }
})();

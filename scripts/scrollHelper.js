/**
 * scrollHelper.js
 * 
 * Manages scroll limit computation for the menu container.
 * Automatically recomputes scroll limits when:
 * - Window is resized
 * - Device orientation changes
 * - Language is changed (via gereni:languagechange event)
 * - Menu is rendered (via gereni:menuRendered event)
 * 
 * This ensures that UI components that depend on scroll metrics
 * (like sliders, scroll indicators, or bottom buttons) remain
 * accurate when the menu content height changes.
 * 
 * Public API:
 * - GereniScrollHelper.getMaxScroll(): Returns current max scroll value
 * - GereniScrollHelper.recompute(): Forces immediate recomputation
 * - GereniScrollHelper.subscribe(fn): Subscribe to scroll limit updates
 * - GereniScrollHelper.scheduleUpdate(): Schedule an update on next frame
 * 
 * Events dispatched:
 * - gereni:scrollLimitsUpdated: Fired when scroll limits are recomputed
 */
(() => {
  let maxScroll = 0;
  let layoutUpdateScheduled = false;
  const subscribers = new Set();

  const MENU_CONTAINER_SELECTORS = [
    '[data-menu-scroll-container]',
    '[data-scroll-container]',
    '#menu-container',
    '.menu-container'
  ];

  const SCROLL_BUTTON_SELECTORS = {
    top: '[data-scroll-button="top"]',
    bottom: '[data-scroll-button="bottom"]'
  };

  let cachedContainer = null;
  let boundContainer = null;
  let topButton = null;
  let bottomButton = null;

  // Distance from top/bottom edge (in pixels) within which scroll buttons are disabled.
  const SCROLL_EDGE_THRESHOLD = 16;

  const reduceMotionQuery = window.matchMedia
    ? window.matchMedia('(prefers-reduced-motion: reduce)')
    : null;

  function prefersReducedMotion() {
    return reduceMotionQuery ? reduceMotionQuery.matches : false;
  }

  function getMenuContainer() {
    if (cachedContainer && document.contains(cachedContainer)) {
      return cachedContainer;
    }

    for (const selector of MENU_CONTAINER_SELECTORS) {
      const element = document.querySelector(selector);
      if (element) {
        cachedContainer = element;
        return cachedContainer;
      }
    }

    cachedContainer = null;
    return cachedContainer;
  }

  function getScrollTop() {
    const container = getMenuContainer();
    if (container) {
      return container.scrollTop;
    }

    return window.scrollY || document.documentElement.scrollTop || document.body.scrollTop || 0;
  }

  function bindContainerListeners() {
    const container = getMenuContainer();
    if (!container || container === boundContainer) {
      return;
    }

    if (boundContainer) {
      boundContainer.removeEventListener('scroll', handleContainerScroll);
    }

    container.addEventListener('scroll', handleContainerScroll, { passive: true });
    boundContainer = container;
  }

  function computeMaxScroll() {
    const container = getMenuContainer();
    if (!container) {
      maxScroll = 0;
      return maxScroll;
    }

    const scrollHeight = container.scrollHeight;
    const clientHeight = container.clientHeight;
    maxScroll = Math.max(0, scrollHeight - clientHeight);
    
    return maxScroll;
  }

  function notifySubscribers() {
    const currentMax = maxScroll;
    updateButtonState();
    subscribers.forEach(fn => {
      try {
        fn(currentMax);
      } catch (err) {
        console.error('Error en suscriptor de scroll:', err);
      }
    });
    document.dispatchEvent(new CustomEvent('gereni:scrollLimitsUpdated', { 
      detail: { maxScroll: currentMax } 
    }));
  }

  function scheduleLayoutUpdate() {
    if (layoutUpdateScheduled) {
      return;
    }

    layoutUpdateScheduled = true;

    // Use requestAnimationFrame to batch layout updates if available
    const scheduleFunc = typeof requestAnimationFrame !== 'undefined'
      ? requestAnimationFrame
      : (fn) => setTimeout(fn, 0);

    scheduleFunc(() => {
      resolveScrollButtons();
      bindContainerListeners();
      computeMaxScroll();
      notifySubscribers();
      layoutUpdateScheduled = false;
    });
  }

  function handleResize() {
    scheduleLayoutUpdate();
  }

  function resolveScrollButtons() {
    topButton = document.querySelector(SCROLL_BUTTON_SELECTORS.top) || topButton || null;
    bottomButton = document.querySelector(SCROLL_BUTTON_SELECTORS.bottom) || bottomButton || null;
  }

  function updateButtonState() {
    if (!topButton && !bottomButton) {
      return;
    }

    const top = Math.max(0, Math.min(getScrollTop(), maxScroll));
    const nearTop = top <= SCROLL_EDGE_THRESHOLD;
    const nearBottom = maxScroll - top <= SCROLL_EDGE_THRESHOLD;
    if (topButton) {
      topButton.disabled = nearTop;
    }
    if (bottomButton) {
      bottomButton.disabled = nearBottom;
    }
  }

  function handleContainerScroll() {
    if (prefersReducedMotion()) {
      scheduleLayoutUpdate();
    } else {
      updateButtonState();
    }
  }

  function handleLanguageChange() {
    scheduleLayoutUpdate();
  }

  function handleMenuRendered() {
    scheduleLayoutUpdate();
  }

  function handleOrientation() {
    scheduleLayoutUpdate();
  }

  function init() {
    // Initial computation
    resolveScrollButtons();
    scheduleLayoutUpdate();

    // Listen to resize events
    window.addEventListener('resize', handleResize);

    // Listen to orientation change events
    if ('onorientationchange' in window) {
      window.addEventListener('orientationchange', handleOrientation);
    }

    // Listen to language change events
    document.addEventListener('gereni:languagechange', handleLanguageChange);

    // Listen to menu render events
    document.addEventListener('gereni:menuRendered', handleMenuRendered);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  // Public API
  window.GereniScrollHelper = {
    getMaxScroll() {
      return maxScroll;
    },
    recompute() {
      computeMaxScroll();
      notifySubscribers();
      return maxScroll;
    },
    subscribe(fn) {
      if (typeof fn === 'function') {
        subscribers.add(fn);
        // Immediately notify new subscriber with current value
        try {
          fn(maxScroll);
        } catch (err) {
          console.error('Error notificando suscriptor inicial:', err);
        }
        return () => subscribers.delete(fn);
      }
      return () => {};
    },
    scheduleUpdate() {
      scheduleLayoutUpdate();
    }
  };
})();

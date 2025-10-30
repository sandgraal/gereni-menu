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

  // Distance from top/bottom edge (in pixels) within which scroll buttons are disabled.
  const SCROLL_EDGE_THRESHOLD = 16;

  const reduceMotionQuery = window.matchMedia
    ? window.matchMedia('(prefers-reduced-motion: reduce)')
    : null;

  function prefersReducedMotion() {
    return reduceMotionQuery ? reduceMotionQuery.matches : false;
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
      computeMaxScroll();
      notifySubscribers();
      layoutUpdateScheduled = false;
    });
  }

  function handleResize() {
    scheduleLayoutUpdate();
  }

    function updateButtonState() {
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

  function handleLanguageChange() {
    scheduleLayoutUpdate();
  }

  function handleMenuRendered() {
    scheduleLayoutUpdate();
  }

  function init() {
    // Initial computation
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

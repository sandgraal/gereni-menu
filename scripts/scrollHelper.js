(() => {
  let maxScroll = 0;
  let layoutUpdateScheduled = false;
  const subscribers = new Set();

  function getMenuContainer() {
    return document.getElementById('menu-container');
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

  function handleOrientation() {
    scheduleLayoutUpdate();
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

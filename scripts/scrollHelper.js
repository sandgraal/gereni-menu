(() => {
  const reduceMotionQuery = window.matchMedia
    ? window.matchMedia('(prefers-reduced-motion: reduce)')
    : null;

  function prefersReducedMotion() {
    return reduceMotionQuery ? reduceMotionQuery.matches : false;
  }

  function init() {
    const helper = document.querySelector('[data-scroll-helper]');
    const slider = helper ? helper.querySelector('[data-scroll-slider]') : null;

    if (!helper || !slider) {
      return;
    }

    const topButton = helper.querySelector('[data-scroll-top]');
    const bottomButton = helper.querySelector('[data-scroll-bottom]');
    const progress = helper.querySelector('[data-scroll-progress]');
    const doc = document.documentElement;
    const body = document.body;

    let maxScroll = 0;
    let isUserSliding = false;
    let scrollFrame = null;
    let layoutFrame = null;

    function getScrollTop() {
      return (
        window.pageYOffset ||
        doc.scrollTop ||
        (body ? body.scrollTop : 0) ||
        0
      );
    }

    function updateProgressDisplay(current) {
      const bounded = maxScroll > 0 ? Math.min(Math.max(current, 0), maxScroll) : 0;
      const percent = maxScroll > 0 ? Math.round((bounded / maxScroll) * 100) : 0;
      if (progress) {
        progress.textContent = `${percent}%`;
      }
      slider.style.setProperty('--scroll-progress', `${percent}%`);
    }

    function computeMaxScroll() {
      const bodyHeight = body
        ? Math.max(body.scrollHeight, body.offsetHeight, body.clientHeight || 0)
        : 0;
      const docHeight = Math.max(
        doc.scrollHeight,
        doc.offsetHeight,
        doc.clientHeight || 0,
        bodyHeight
      );
      const viewport = window.innerHeight || doc.clientHeight || 0;
      maxScroll = Math.max(docHeight - viewport, 0);
      const disabled = maxScroll <= 8;
      slider.max = maxScroll > 0 ? maxScroll : 1;
      slider.disabled = disabled;
      helper.hidden = disabled;
      if (disabled) {
        slider.value = '0';
        updateProgressDisplay(0);
      }
    }

    function syncToScroll() {
      const top = Math.max(0, Math.min(getScrollTop(), maxScroll));
      slider.value = String(top);
      updateProgressDisplay(top);
    }

    function handleScroll() {
      if (isUserSliding) {
        return;
      }
      if (scrollFrame) {
        return;
      }
      scrollFrame = window.requestAnimationFrame(() => {
        scrollFrame = null;
        syncToScroll();
      });
    }

    function scheduleLayoutUpdate() {
      if (layoutFrame) {
        return;
      }
      layoutFrame = window.requestAnimationFrame(() => {
        layoutFrame = null;
        computeMaxScroll();
        syncToScroll();
      });
    }

    function scrollToPosition(position) {
      if (maxScroll <= 0) {
        return;
      }
      const target = Math.max(0, Math.min(position, maxScroll));
      const behavior = prefersReducedMotion() ? 'auto' : 'smooth';
      window.scrollTo({ top: target, behavior });
      updateProgressDisplay(target);
    }

    slider.addEventListener('input', () => {
      if (slider.disabled) {
        return;
      }
      const value = Number(slider.value);
      scrollToPosition(Number.isFinite(value) ? value : 0);
    });

    slider.addEventListener('change', () => {
      if (!isUserSliding) {
        syncToScroll();
      }
    });

    slider.addEventListener('pointerdown', () => {
      isUserSliding = true;
    });

    const stopSliding = () => {
      if (!isUserSliding) {
        return;
      }
      isUserSliding = false;
      syncToScroll();
    };

    slider.addEventListener('pointerup', stopSliding);
    slider.addEventListener('pointercancel', stopSliding);
    slider.addEventListener('blur', stopSliding);

    topButton?.addEventListener('click', event => {
      event.preventDefault();
      scrollToPosition(0);
    });

    bottomButton?.addEventListener('click', event => {
      event.preventDefault();
      scrollToPosition(maxScroll);
    });

    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', scheduleLayoutUpdate);
    window.addEventListener('orientationchange', scheduleLayoutUpdate);
    window.addEventListener('load', scheduleLayoutUpdate);
    document.addEventListener('gereni:menuRendered', scheduleLayoutUpdate);

    computeMaxScroll();
    syncToScroll();

    if (reduceMotionQuery) {
      reduceMotionQuery.addEventListener('change', syncToScroll);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();

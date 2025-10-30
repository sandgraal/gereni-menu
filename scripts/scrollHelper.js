(() => {
  // Minimum scrollable height (in pixels) required to show the scroll helper.
  // Below this threshold, the helper is hidden since scrolling is negligible.
  const MIN_SCROLL_THRESHOLD = 8;

  // Distance from top/bottom edge (in pixels) within which scroll buttons are disabled.
  const SCROLL_EDGE_THRESHOLD = 16;

  const reduceMotionQuery = window.matchMedia
    ? window.matchMedia('(prefers-reduced-motion: reduce)')
    : null;

  function prefersReducedMotion() {
    return reduceMotionQuery ? reduceMotionQuery.matches : false;
  }

  function init() {
    const helper = document.querySelector('[data-scroll-helper]');
    if (!helper) {
      return;
    }

    const topButton = helper.querySelector('[data-scroll-top]');
    const bottomButton = helper.querySelector('[data-scroll-bottom]');
    const doc = document.documentElement;
    const body = document.body;

    let maxScroll = 0;
    let layoutFrame = null;

    function getScrollTop() {
      return (
        window.pageYOffset ||
        doc.scrollTop ||
        (body ? body.scrollTop : 0) ||
        0
      );
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
      const disabled = maxScroll <= MIN_SCROLL_THRESHOLD;
      helper.hidden = disabled;
      updateButtonState();
    }

    function handleScroll() {
      window.requestAnimationFrame(updateButtonState);
    }

    function scheduleLayoutUpdate() {
      if (layoutFrame) {
        return;
      }
      layoutFrame = window.requestAnimationFrame(() => {
        layoutFrame = null;
        computeMaxScroll();
      });
    }

    function scrollToPosition(position) {
      if (maxScroll <= 0) {
        return;
      }
      const target = Math.max(0, Math.min(position, maxScroll));
      const behavior = prefersReducedMotion() ? 'auto' : 'smooth';
      window.scrollTo({ top: target, behavior });
      window.requestAnimationFrame(updateButtonState);
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
    updateButtonState();

    if (reduceMotionQuery) {
      reduceMotionQuery.addEventListener('change', updateButtonState);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();

(() => {
  const section = document.querySelector('.social-section[data-facebook-page]');
  if (!section) return;

  const pageUrl = section.getAttribute('data-facebook-page');
  if (!pageUrl) return;

  const pageEmbed = section.querySelector('.fb-page');
  const loadingEl = section.querySelector('[data-facebook-loading]');
  const fallbackEl = section.querySelector('[data-facebook-fallback]');
  const openButtons = section.querySelectorAll('[data-facebook-open]');

  let sdkRequested = false;
  let timeoutId = null;
  let resizeId = null;
  let renderListenerAttached = false;

  const clearFallbackTimer = () => {
    if (timeoutId) {
      clearTimeout(timeoutId);
      timeoutId = null;
    }
  };

  const showEmbed = () => {
    clearFallbackTimer();
    if (fallbackEl) fallbackEl.hidden = true;
    if (loadingEl) loadingEl.hidden = true;
    if (pageEmbed) pageEmbed.hidden = false;
  };

  const showLoading = () => {
    if (fallbackEl) fallbackEl.hidden = true;
    if (loadingEl) loadingEl.hidden = false;
    if (pageEmbed) pageEmbed.hidden = true;
  };

  const showFallback = () => {
    clearFallbackTimer();
    if (fallbackEl) fallbackEl.hidden = false;
    if (loadingEl) loadingEl.hidden = true;
    if (pageEmbed) pageEmbed.hidden = true;
  };

  const updateEmbedWidth = () => {
    if (!pageEmbed) return;
    const width = Math.max(320, Math.floor(section.getBoundingClientRect().width));
    pageEmbed.setAttribute('data-width', `${width}`);
  };

  const ensurePageAttributes = () => {
    if (!pageEmbed) return;
    pageEmbed.setAttribute('data-href', pageUrl);
    const blockquote = pageEmbed.querySelector('blockquote');
    if (blockquote) {
      blockquote.setAttribute('cite', pageUrl);
      const link = blockquote.querySelector('a');
      if (link) {
        link.setAttribute('href', pageUrl);
      }
    }
  };

  const normalizeUrl = (value) => {
    if (!value) return '';
    try {
      const parsed = new URL(value, window.location.href);
      return `${parsed.origin}${parsed.pathname}`.replace(/\/$/, '');
    } catch (err) {
      return value.replace(/[#?].*$/, '').replace(/\/$/, '');
    }
  };

  const attachRenderListener = () => {
    if (renderListenerAttached) return;
    if (!window.FB || !window.FB.Event || typeof window.FB.Event.subscribe !== 'function') {
      return;
    }
    window.FB.Event.subscribe('xfbml.render', event => {
      if (!event || !event.href) {
        showEmbed();
        return;
      }
      const normalizedHref = normalizeUrl(event.href);
      const normalizedPage = normalizeUrl(pageUrl);
      if (normalizedHref === normalizedPage) {
        showEmbed();
      }
    });
    renderListenerAttached = true;
  };

  const tryRenderFeed = () => {
    if (!pageEmbed) return false;
    if (window.FB && window.FB.XFBML && typeof window.FB.XFBML.parse === 'function') {
      pageEmbed.hidden = false;
      attachRenderListener();
      try {
        window.FB.XFBML.parse(section);
      } catch (error) {
        console.error('No se pudo renderizar el feed de Facebook:', error);
        showFallback();
      }
      return true;
    }
    return false;
  };

  openButtons.forEach(button => {
    button.addEventListener('click', event => {
      event.preventDefault();
      window.open(pageUrl, '_blank', 'noopener');
    });
  });

  const requestSdk = () => {
    if (sdkRequested) return;
    sdkRequested = true;

    ensurePageAttributes();
    showLoading();
    updateEmbedWidth();

    if (tryRenderFeed()) {
      return;
    }

    window.fbAsyncInit = () => {
      if (!window.FB || typeof window.FB.init !== 'function') {
        showFallback();
        return;
      }
      window.FB.init({
        xfbml: false,
        version: 'v19.0'
      });
      attachRenderListener();
      clearFallbackTimer();
      if (!tryRenderFeed()) {
        showFallback();
      }
    };

    if (!document.getElementById('facebook-jssdk')) {
      const script = document.createElement('script');
      script.id = 'facebook-jssdk';
      script.async = true;
      script.defer = true;
      script.crossOrigin = 'anonymous';
      script.src = 'https://connect.facebook.net/es_ES/sdk.js';
      script.onerror = () => {
        showFallback();
      };
      document.body.appendChild(script);
    }

    timeoutId = window.setTimeout(() => {
      showFallback();
    }, 7000);
  };

  updateEmbedWidth();

  window.addEventListener('resize', () => {
    window.clearTimeout(resizeId);
    resizeId = window.setTimeout(updateEmbedWidth, 150);
  });

  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          observer.disconnect();
          requestSdk();
        }
      });
    }, { rootMargin: '0px 0px 200px 0px' });
    observer.observe(section);
  } else {
    requestSdk();
  }

  if (fallbackEl) fallbackEl.hidden = true;
})();

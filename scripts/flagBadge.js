(() => {
  const SELECTOR = '[data-lang-src-es], [data-lang-src-en]';

  function getPreferredSrc(element, lang) {
    if (!element || !element.dataset) return null;
    if (lang === 'en' && element.dataset.langSrcEn) {
      return element.dataset.langSrcEn;
    }
    if (lang === 'es' && element.dataset.langSrcEs) {
      return element.dataset.langSrcEs;
    }
    return element.dataset.langSrcEs || element.dataset.langSrcEn || null;
  }

  function updateFlagBadge(lang) {
    document.querySelectorAll(SELECTOR).forEach(element => {
      const nextSrc = getPreferredSrc(element, lang);
      if (nextSrc && element.getAttribute('src') !== nextSrc) {
        element.setAttribute('src', nextSrc);
      }
    });
  }

  function resolveLanguage(event) {
    if (event && event.detail && typeof event.detail.lang === 'string') {
      return event.detail.lang;
    }
    if (window.GereniLang && typeof window.GereniLang.getCurrent === 'function') {
      return window.GereniLang.getCurrent();
    }
    return document.documentElement.getAttribute('lang') || 'es';
  }

  function init() {
    const initialLang = resolveLanguage();
    updateFlagBadge(initialLang);

    document.addEventListener('gereni:languagechange', event => {
      const lang = resolveLanguage(event);
      updateFlagBadge(lang);
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();

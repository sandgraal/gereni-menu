(() => {
  const FALLBACK_LANG = 'es';
  const FALLBACK_THEME = 'dark';
  const BASE_PATH = 'output';

  function resolveLang(lang) {
    return lang === 'en' ? 'en' : FALLBACK_LANG;
  }

  function resolveTheme(theme) {
    return theme === 'light' ? 'light' : FALLBACK_THEME;
  }

  function buildHref(lang, theme) {
    return `${BASE_PATH}/Menu_Gereni_digital_${resolveLang(lang)}_${resolveTheme(theme)}.pdf`;
  }

  function getCurrentLang() {
    if (window.GereniLang && typeof window.GereniLang.getCurrent === 'function') {
      return window.GereniLang.getCurrent();
    }
    const attr = document.documentElement.getAttribute('lang');
    return attr === 'en' ? 'en' : FALLBACK_LANG;
  }

  function getCurrentTheme() {
    if (window.GereniTheme && typeof window.GereniTheme.getCurrent === 'function') {
      return window.GereniTheme.getCurrent();
    }
    const attr = document.body ? document.body.getAttribute('data-theme') : null;
    return attr === 'light' ? 'light' : FALLBACK_THEME;
  }

  function updateLink() {
    const link = document.querySelector('.link-download');
    if (!link) return;
    const lang = resolveLang(getCurrentLang());
    const theme = resolveTheme(getCurrentTheme());
    link.setAttribute('href', buildHref(lang, theme));
  }

  function init() {
    updateLink();

    if (window.GereniLang && typeof window.GereniLang.subscribe === 'function') {
      window.GereniLang.subscribe(updateLink);
    } else {
      document.addEventListener('gereni:languagechange', updateLink);
    }

    if (window.GereniTheme && typeof window.GereniTheme.subscribe === 'function') {
      window.GereniTheme.subscribe(updateLink);
    } else {
      document.addEventListener('gereni:themechange', updateLink);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();

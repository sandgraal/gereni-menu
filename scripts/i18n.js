(function() {
  const STORAGE_KEY = 'gereni-language';
  const DEFAULT_LANG = 'es';
  const VALID_LANGS = new Set(['es', 'en']);
  const subscribers = new Set();
  let currentLang = DEFAULT_LANG;

  function sanitizeLanguage(lang) {
    if (typeof lang !== 'string') return DEFAULT_LANG;
    const lower = lang.trim().toLowerCase();
    if (VALID_LANGS.has(lower)) {
      return lower;
    }
    if (lower.startsWith('en')) return 'en';
    return DEFAULT_LANG;
  }

  function readStoredLanguage() {
    try {
      const stored = window.localStorage ? window.localStorage.getItem(STORAGE_KEY) : null;
      if (stored) {
        return sanitizeLanguage(stored);
      }
    } catch (err) {
      console.warn('No se pudo leer el idioma guardado:', err);
    }
    return DEFAULT_LANG;
  }

  function writeStoredLanguage(lang) {
    try {
      if (window.localStorage) {
        window.localStorage.setItem(STORAGE_KEY, lang);
      }
    } catch (err) {
      console.warn('No se pudo guardar el idioma seleccionado:', err);
    }
  }

  function applyTranslations(lang) {
    const elements = document.querySelectorAll('[data-i18n-es]');
    elements.forEach(el => {
      const targetAttr = el.getAttribute('data-i18n-attr');
      const esValue = el.getAttribute('data-i18n-es') || '';
      const enValue = el.getAttribute('data-i18n-en') || esValue;
      const value = lang === 'en' ? enValue : esValue;
      if (targetAttr) {
        el.setAttribute(targetAttr, value);
      } else {
        el.textContent = value;
      }
    });
  }

  function updateToggleState(lang) {
    const buttons = document.querySelectorAll('[data-lang-option]');
    buttons.forEach(btn => {
      const btnLang = btn.getAttribute('data-lang-option');
      const isActive = btnLang === lang;
      btn.classList.toggle('active', isActive);
      btn.setAttribute('aria-pressed', isActive ? 'true' : 'false');
    });
  }

  function dispatchLanguageChange(lang) {
    const detail = { lang };
    subscribers.forEach(fn => {
      try {
        fn(lang);
      } catch (err) {
        console.error('Error en suscriptor de idioma:', err);
      }
    });
    document.dispatchEvent(new CustomEvent('gereni:languagechange', { detail }));
  }

  function setLanguage(lang) {
    const normalized = sanitizeLanguage(lang);
    if (currentLang === normalized) return;
    currentLang = normalized;
    writeStoredLanguage(currentLang);
    document.documentElement.setAttribute('lang', currentLang === 'en' ? 'en' : 'es');
    applyTranslations(currentLang);
    updateToggleState(currentLang);
    dispatchLanguageChange(currentLang);
  }

  function handleToggleClick(event) {
    const target = event.target.closest('[data-lang-option]');
    if (!target) return;
    const lang = target.getAttribute('data-lang-option');
    setLanguage(lang);
  }

  currentLang = readStoredLanguage();

  function init() {
    document.documentElement.setAttribute('lang', currentLang === 'en' ? 'en' : 'es');
    applyTranslations(currentLang);
    updateToggleState(currentLang);
    document.addEventListener('click', handleToggleClick);
    dispatchLanguageChange(currentLang);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  window.GereniLang = {
    getCurrent() {
      return currentLang;
    },
    set(lang) {
      setLanguage(lang);
    },
    subscribe(fn) {
      if (typeof fn === 'function') {
        subscribers.add(fn);
        return () => subscribers.delete(fn);
      }
      return () => {};
    },
    translateRoot() {
      applyTranslations(currentLang);
    }
  };
})();

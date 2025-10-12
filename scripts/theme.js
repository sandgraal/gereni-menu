(() => {
  const STORAGE_KEY = 'gereni-theme';
  const FALLBACK_THEME = 'dark';
  const VALID_THEMES = new Set(['dark', 'light']);
  const subscribers = new Set();
  let hasStoredPreference = false;
  let systemPreferenceWatcherAttached = false;
  let currentTheme = FALLBACK_THEME;

  function sanitizeTheme(theme) {
    if (typeof theme !== 'string') return FALLBACK_THEME;
    let normalized = theme.trim().toLowerCase();
    if (normalized === 'legacy') normalized = 'dark';
    if (normalized === 'modern') normalized = 'light';
    return VALID_THEMES.has(normalized) ? normalized : FALLBACK_THEME;
  }

  function readStoredTheme() {
    try {
      if (window.localStorage) {
        const stored = window.localStorage.getItem(STORAGE_KEY);
        if (stored) {
          return sanitizeTheme(stored);
        }
      }
    } catch (err) {
      console.warn('No se pudo leer el tema guardado:', err);
    }
    return null;
  }

  function getSystemTheme() {
    try {
      if (typeof window.matchMedia === 'function') {
        if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
          return 'dark';
        }
        if (window.matchMedia('(prefers-color-scheme: light)').matches) {
          return 'light';
        }
      }
    } catch (err) {
      console.warn('No se pudo determinar el tema del sistema:', err);
    }
    return FALLBACK_THEME;
  }

  function writeStoredTheme(theme) {
    try {
      if (window.localStorage) {
        window.localStorage.setItem(STORAGE_KEY, theme);
      }
    } catch (err) {
      console.warn('No se pudo guardar el tema seleccionado:', err);
    }
  }

  function applyTheme(theme) {
    const root = document.documentElement;
    root.setAttribute('data-theme', theme);
    if (document.body) {
      document.body.setAttribute('data-theme', theme);
    }
  }

  function updateToggleState(theme) {
    const buttons = document.querySelectorAll('[data-theme-option]');
    buttons.forEach(btn => {
      const option = btn.getAttribute('data-theme-option');
      const isActive = option === theme;
      btn.classList.toggle('active', isActive);
      btn.setAttribute('aria-pressed', isActive ? 'true' : 'false');
    });
  }

  function handleSystemPreferenceChange() {
    if (hasStoredPreference) return;
    const systemTheme = getSystemTheme();
    setTheme(systemTheme, { persist: false });
  }

  function watchSystemPreference() {
    if (systemPreferenceWatcherAttached) return;
    if (typeof window.matchMedia !== 'function') return;
    const media = window.matchMedia('(prefers-color-scheme: dark)');
    const listener = () => handleSystemPreferenceChange();
    if (typeof media.addEventListener === 'function') {
      media.addEventListener('change', listener);
    } else if (typeof media.addListener === 'function') {
      media.addListener(listener);
    }
    systemPreferenceWatcherAttached = true;
  }

  function notifySubscribers(theme) {
    subscribers.forEach(fn => {
      try {
        fn(theme);
      } catch (err) {
        console.error('Error en suscriptor de tema:', err);
      }
    });
    document.dispatchEvent(new CustomEvent('gereni:themechange', { detail: { theme } }));
  }

  function setTheme(theme, { persist = true } = {}) {
    const normalized = sanitizeTheme(theme);
    const previousTheme = currentTheme;
    currentTheme = normalized;
    applyTheme(currentTheme);
    updateToggleState(currentTheme);
    if (persist) {
      hasStoredPreference = true;
      writeStoredTheme(currentTheme);
    }
    if (currentTheme !== previousTheme) {
      notifySubscribers(currentTheme);
    }
  }

  function handleToggleClick(event) {
    const target = event.target.closest('[data-theme-option]');
    if (!target) return;
    const theme = target.getAttribute('data-theme-option');
    setTheme(theme);
  }

  function init() {
    updateToggleState(currentTheme);
    document.addEventListener('click', handleToggleClick);
    notifySubscribers(currentTheme);
  }

  const storedTheme = readStoredTheme();
  if (storedTheme) {
    hasStoredPreference = true;
    currentTheme = storedTheme;
  } else {
    currentTheme = FALLBACK_THEME;
  }
  currentTheme = sanitizeTheme(currentTheme);
  applyTheme(currentTheme);
  watchSystemPreference();

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  window.GereniTheme = {
    getCurrent() {
      return currentTheme;
    },
    set(theme) {
      setTheme(theme);
    },
    subscribe(fn) {
      if (typeof fn === 'function') {
        subscribers.add(fn);
        return () => subscribers.delete(fn);
      }
      return () => {};
    }
  };
})();

(() => {
  const START_BUFFER_DAYS = 2;
  const SEASON_END_MONTH = 11; // December (0-indexed)
  const SEASON_END_DAY = 31;
  const STORAGE_KEYS = {
    toastDismissed: 'gereni-holiday-toast-dismissed',
  };

  const isFinePointer = () => {
    if (typeof window.matchMedia !== 'function') return false;
    return window.matchMedia('(pointer: fine)').matches;
  };

  const safeLocalStorage = {
    get: key => {
      try {
        return window.localStorage ? window.localStorage.getItem(key) : null;
      } catch (error) {
        console.warn('No se pudo leer localStorage:', error);
        return null;
      }
    },
    set: (key, value) => {
      try {
        if (window.localStorage) {
          window.localStorage.setItem(key, value);
        }
      } catch (error) {
        console.warn('No se pudo escribir en localStorage:', error);
      }
    },
  };

  const getThanksgivingDate = year => {
    const novemberFirst = new Date(year, 10, 1);
    const dayOfWeek = novemberFirst.getDay();
    const offsetToThursday = (11 - dayOfWeek) % 7;
    const thanksgivingDay = 22 + offsetToThursday;
    return new Date(year, 10, thanksgivingDay);
  };

  const getSeasonWindow = () => {
    const now = new Date();
    const year = now.getFullYear();
    const thanksgiving = getThanksgivingDate(year);
    const start = new Date(thanksgiving.getTime());
    start.setDate(start.getDate() + START_BUFFER_DAYS);
    const end = new Date(year, SEASON_END_MONTH, SEASON_END_DAY);
    return { start, end };
  };

  const isInSeasonWindow = () => {
    const now = new Date();
    const { start, end } = getSeasonWindow();
    return now >= start && now <= end;
  };

  const createSparkles = () => {
    if (!isFinePointer()) return () => {};

    const sparkleContainer = document.createElement('div');
    sparkleContainer.className = 'holiday-sparkle-container';
    document.body.appendChild(sparkleContainer);

    let pointerPending = null;
    let rafId = null;
    const createSparkle = ({ clientX, clientY }) => {
      const sparkle = document.createElement('span');
      sparkle.className = 'holiday-sparkle';
      sparkle.style.left = `${clientX}px`;
      sparkle.style.top = `${clientY}px`;
      sparkleContainer.appendChild(sparkle);
      requestAnimationFrame(() => sparkle.classList.add('active'));
      setTimeout(() => sparkle.remove(), 1000);
    };

    const processPointer = () => {
      if (!pointerPending) return;
      createSparkle(pointerPending);
      pointerPending = null;
      rafId = null;
    };

    const handlePointerMove = event => {
      pointerPending = { clientX: event.clientX, clientY: event.clientY };
      if (!rafId) {
        rafId = requestAnimationFrame(processPointer);
      }
    };

    document.addEventListener('pointermove', handlePointerMove);

    return () => {
      document.removeEventListener('pointermove', handlePointerMove);
      if (rafId) {
        cancelAnimationFrame(rafId);
      }
      sparkleContainer.remove();
    };
  };

  const createSnowCanvas = () => {
    const canvas = document.createElement('canvas');
    canvas.className = 'holiday-snow';
    canvas.setAttribute('aria-hidden', 'true');
    const ctx = canvas.getContext('2d');
    document.body.appendChild(canvas);

    const snowflakes = Array.from({ length: 80 }, () => ({
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      r: Math.random() * 3 + 1,
      d: Math.random() * 1 + 0.5,
    }));

    let animationFrame = null;
    let isPaused = document.visibilityState !== 'visible';

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
      snowflakes.forEach(flake => {
        ctx.beginPath();
        ctx.arc(flake.x, flake.y, flake.r, 0, Math.PI * 2);
        ctx.fill();
      });
      update();
      schedule();
    };

    const update = () => {
      snowflakes.forEach(flake => {
        flake.y += flake.d;
        flake.x += Math.sin(flake.y * 0.01) * 0.5;
        if (flake.y > canvas.height) {
          flake.y = -5;
          flake.x = Math.random() * canvas.width;
        }
      });
    };

    const schedule = () => {
      if (!isPaused) {
        animationFrame = requestAnimationFrame(draw);
      }
    };

    const handleVisibilityChange = () => {
      const hidden = document.visibilityState !== 'visible';
      if (hidden && animationFrame) {
        cancelAnimationFrame(animationFrame);
        animationFrame = null;
      }
      isPaused = hidden;
      if (!hidden && !animationFrame) {
        schedule();
      }
    };

    resize();
    window.addEventListener('resize', resize);
    document.addEventListener('visibilitychange', handleVisibilityChange);
    schedule();

    return () => {
      window.removeEventListener('resize', resize);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      if (animationFrame) {
        cancelAnimationFrame(animationFrame);
      }
      canvas.remove();
    };
  };

  const getActiveLanguage = () => {
    const storedLang = window.GereniLang?.getCurrent?.();
    if (storedLang) return storedLang;
    const docLang = document.documentElement.getAttribute('lang');
    if (docLang && docLang.toLowerCase().startsWith('en')) return 'en';
    return 'es';
  };

  const getChristmasDate = () => {
    const now = new Date();
    const christmas = new Date(now.getFullYear(), 11, 25);
    if (now > christmas) {
      christmas.setFullYear(now.getFullYear() + 1);
    }
    return christmas;
  };

  const getCountdownMessage = lang => {
    const now = new Date();
    const christmas = getChristmasDate();
    const remaining = Math.max(0, christmas - now);
    const days = Math.ceil(remaining / (1000 * 60 * 60 * 24));
    const locale = lang === 'en' ? 'en' : 'es';

    const messages = {
      es: {
        today: '¡Feliz Navidad! 🎄',
        single: 'Falta 1 día para Navidad.',
        plural: daysCount => `Faltan ${daysCount} días para Navidad.`,
      },
      en: {
        today: 'Merry Christmas! 🎄',
        single: '1 day until Christmas.',
        plural: daysCount => `${daysCount} days until Christmas.`,
      },
    };

    const copy = messages[locale];
    if (days <= 0) return copy.today;
    if (days === 1) return copy.single;
    return copy.plural(days);
  };

  const addCountdownRibbon = () => {
    const ribbon = document.createElement('div');
    ribbon.className = 'holiday-ribbon';
    ribbon.setAttribute('role', 'status');
    const updateMessage = lang => {
      ribbon.textContent = getCountdownMessage(lang);
    };

    updateMessage(getActiveLanguage());
    document.body.prepend(ribbon);

    const handleLanguageChange = event => {
      const nextLang = event?.detail?.lang || getActiveLanguage();
      updateMessage(nextLang);
    };

    document.addEventListener('gereni:languagechange', handleLanguageChange);

    return () => {
      document.removeEventListener('gereni:languagechange', handleLanguageChange);
    };
  };

  const addHolidayToast = () => {
    const dismissed = safeLocalStorage.get(STORAGE_KEYS.toastDismissed);
    if (dismissed === 'true') return () => {};

    const toast = document.createElement('div');
    toast.className = 'holiday-toast';
    toast.setAttribute('role', 'status');

    const message = document.createElement('span');
    message.textContent = '¡Celebra con nosotros esta temporada!';

    const closeButton = document.createElement('button');
    closeButton.type = 'button';
    closeButton.className = 'toast-close';
    closeButton.setAttribute('aria-label', 'Cerrar notificación');
    closeButton.textContent = '×';

    const dismiss = () => {
      safeLocalStorage.set(STORAGE_KEYS.toastDismissed, 'true');
      toast.remove();
    };

    closeButton.addEventListener('click', dismiss);
    toast.append(message, closeButton);
    document.body.appendChild(toast);

    return dismiss;
  };

  const initializeSeasonalMode = () => {
    if (!isInSeasonWindow()) return;
    const destroySparkles = createSparkles();
    const destroySnow = createSnowCanvas();
    const teardownCountdownRibbon = addCountdownRibbon();
    const dismissToast = addHolidayToast();

    window.addEventListener('beforeunload', () => {
      destroySparkles();
      destroySnow();
      if (typeof teardownCountdownRibbon === 'function') {
        teardownCountdownRibbon();
      }
      if (typeof dismissToast === 'function') {
        dismissToast();
      }
    });
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeSeasonalMode);
  } else {
    initializeSeasonalMode();
  }
})();

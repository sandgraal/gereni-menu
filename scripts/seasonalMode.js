(() => {
  const START_BUFFER_DAYS = 2;
  const SEASON_END_MONTH = 11; // December (0-indexed)
  const SEASON_END_DAY = 31;
  const CHRISTMAS_MONTH = 11; // December (0-indexed)
  const CHRISTMAS_DAY = 25;
  let countdownRibbon = null;

  const isFinePointer = () => {
    if (typeof window.matchMedia !== 'function') return false;
    return window.matchMedia('(pointer: fine)').matches;
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

  const getChristmasDate = year => new Date(year, CHRISTMAS_MONTH, CHRISTMAS_DAY);

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

  const normalizeLanguage = lang => {
    const code = (lang || '').toString().slice(0, 2).toLowerCase();
    if (code === 'en') return 'en';
    if (code === 'es') return 'es';
    return 'es';
  };

  const getCurrentLanguage = () => {
    if (window.GereniLang && typeof window.GereniLang.getCurrent === 'function') {
      return normalizeLanguage(window.GereniLang.getCurrent());
    }
    const langAttr = document.documentElement.getAttribute('lang');
    return normalizeLanguage(langAttr);
  };

  const getCountdownMessage = (lang = getCurrentLanguage()) => {
    const normalizedLang = normalizeLanguage(lang);
    const now = new Date();
    const christmas = getChristmasDate();
    const remaining = Math.max(0, christmas - now);
    const days = Math.ceil(remaining / (1000 * 60 * 60 * 24));
    if (days <= 0) return normalizedLang === 'en' ? 'Merry Christmas!' : '¡Feliz Navidad!';
    return normalizedLang === 'en'
      ? `${days} days left until Christmas.`
      : `Faltan ${days} días para Navidad.`;
  };

  const addCountdownRibbon = () => {
    if (countdownRibbon?.isConnected) {
      countdownRibbon.remove();
    }

    const ribbon = document.createElement('div');
    countdownRibbon = ribbon;
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

    const handleLanguageSubscription = lang => {
      const nextLang = lang || getActiveLanguage();
      updateMessage(nextLang);
    };

    let unsubscribeLanguageChange = null;
    if (window.GereniLang && typeof window.GereniLang.subscribe === 'function') {
      const maybeUnsubscribe = window.GereniLang.subscribe(handleLanguageSubscription);
      if (typeof maybeUnsubscribe === 'function') {
        unsubscribeLanguageChange = maybeUnsubscribe;
      }
    }

    document.addEventListener('gereni:languagechange', handleLanguageChange);

    return () => {
      document.removeEventListener('gereni:languagechange', handleLanguageChange);
      if (typeof unsubscribeLanguageChange === 'function') {
        unsubscribeLanguageChange();
      }
      if (ribbon.isConnected) {
        ribbon.remove();
      }
      if (countdownRibbon === ribbon) {
        countdownRibbon = null;
      }
    };
  };

  const initializeSeasonalMode = () => {
    if (!isInSeasonWindow()) return;
    const destroySparkles = createSparkles();
    const destroySnow = createSnowCanvas();
    const teardownCountdownRibbon = addCountdownRibbon();

    window.addEventListener('beforeunload', () => {
      destroySparkles();
      destroySnow();
      if (typeof teardownCountdownRibbon === 'function') {
        teardownCountdownRibbon();
      }
      if (typeof destroyRibbon === 'function') {
        destroyRibbon();
      }
      if (typeof unsubscribeLanguage === 'function') {
        unsubscribeLanguage();
      }
    });
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeSeasonalMode);
  } else {
    initializeSeasonalMode();
  }
})();

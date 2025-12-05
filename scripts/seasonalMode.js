(function() {
  'use strict';

  const OVERRIDE_KEY = 'gereni-holiday-mode';
  const START_BUFFER_DAYS = 1; // day after Thanksgiving
  const SEASON_END_MONTH = 11; // December
  const SEASON_END_DAY = 28; // turn off on Dec 28 (exclusive)
  const LIGHT_COLORS = ['#FAD643', '#F66D44', '#5BC0EB', '#9C89B8'];
  const MAX_SNOWFLAKES = 80;
  const SNOW_MIN_SIZE = 1.5;
  const SNOW_MAX_SIZE = 3.5;

  function safeLocalStorage() {
    try {
      return window.localStorage;
    } catch (error) {
      return null;
    }
  }

  function getQueryOverride() {
    try {
      const params = new URLSearchParams(window.location.search);
      const value = params.get('holidayMode');
      if (value === 'on' || value === 'off') {
        const storage = safeLocalStorage();
        if (storage) {
          storage.setItem(OVERRIDE_KEY, value);
        }
        return value;
      }
    } catch (error) {
      // ignore
    }
    return null;
  }

  function getStoredOverride() {
    const storage = safeLocalStorage();
    if (!storage) return null;
    const value = storage.getItem(OVERRIDE_KEY);
    if (value === 'on' || value === 'off') {
      return value;
    }
    return null;
  }

  function getThanksgivingDate(year) {
    const date = new Date(Date.UTC(year, 10, 1)); // November 1 in UTC to avoid TZ drift
    const dayOfWeek = date.getUTCDay();
    const firstThursdayOffset = (4 - dayOfWeek + 7) % 7; // Thursday is 4
    const thanksgivingUtc = 1 + firstThursdayOffset + 21; // fourth Thursday
    return new Date(Date.UTC(year, 10, thanksgivingUtc));
  }

  function getSeasonWindow() {
    const now = new Date();
    const year = now.getFullYear();
    const thanksgiving = getThanksgivingDate(year);
    const start = new Date(thanksgiving.getTime());
    start.setUTCDate(start.getUTCDate() + START_BUFFER_DAYS);
    const end = new Date(Date.UTC(year, SEASON_END_MONTH, SEASON_END_DAY));
    return { start, end };
  }

  function isSeasonActive() {
    const queryOverride = getQueryOverride();
    if (queryOverride === 'on') return true;
    if (queryOverride === 'off') return false;

    const stored = getStoredOverride();
    if (stored === 'on') return true;
    if (stored === 'off') return false;

    const now = new Date();
    const { start, end } = getSeasonWindow();
    return now >= start && now < end;
  }

  function getCurrentLanguage() {
    try {
      if (window.GereniLang && typeof window.GereniLang.getCurrent === 'function') {
        return window.GereniLang.getCurrent();
      }
    } catch (error) {
      // ignore
    }
    const lang = document.documentElement.getAttribute('lang') || 'es';
    return lang.startsWith('en') ? 'en' : 'es';
  }

  function prefersReducedMotion() {
    try {
      return window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    } catch (error) {
      return false;
    }
  }

  function applySeasonalPalette() {
    document.documentElement.setAttribute('data-seasonal-holiday', 'true');
  }

  function createLightString() {
    const lights = document.createElement('div');
    lights.className = 'holiday-lights';
    lights.setAttribute('aria-hidden', 'true');

    for (let i = 0; i < 28; i++) {
      const bulb = document.createElement('span');
      bulb.className = 'holiday-lights__bulb';
      bulb.style.setProperty('--bulb-color', LIGHT_COLORS[i % LIGHT_COLORS.length]);
      bulb.style.animationDelay = `${(i % 8) * 120}ms`;
      lights.appendChild(bulb);
    }

    const target = document.querySelector('.home-hero') || document.body;
    target.prepend(lights);
  }

  function createSnowLayer() {
    if (prefersReducedMotion()) return;
    const canvas = document.createElement('canvas');
    canvas.className = 'holiday-snow';
    canvas.setAttribute('aria-hidden', 'true');
    document.body.appendChild(canvas);

    const ctx = canvas.getContext('2d');
    const flakes = [];

    function resize() {
      canvas.width = window.innerWidth;
      canvas.height = Math.max(window.innerHeight, document.documentElement.clientHeight || 0);
    }

    function spawnFlake() {
      return {
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        r: Math.random() * (SNOW_MAX_SIZE - SNOW_MIN_SIZE) + SNOW_MIN_SIZE,
        d: Math.random() * 0.6 + 0.3,
        drift: Math.random() * 1 - 0.5
      };
    }

    function initFlakes() {
      flakes.length = 0;
      for (let i = 0; i < MAX_SNOWFLAKES; i++) {
        flakes.push(spawnFlake());
      }
    }

    function draw() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = 'rgba(255,255,255,0.9)';
      ctx.beginPath();
      for (const flake of flakes) {
        ctx.moveTo(flake.x, flake.y);
        ctx.arc(flake.x, flake.y, flake.r, 0, Math.PI * 2, true);
      }
      ctx.fill();
      update();
      window.requestAnimationFrame(draw);
    }

    function update() {
      for (const flake of flakes) {
        flake.y += flake.d + flake.r * 0.06;
        flake.x += flake.drift * 0.6;

        if (flake.y > canvas.height) {
          flake.y = -flake.r;
          flake.x = Math.random() * canvas.width;
        }
        if (flake.x > canvas.width) {
          flake.x = 0;
        } else if (flake.x < 0) {
          flake.x = canvas.width;
        }
      }
    }

    window.addEventListener('resize', resize);
    resize();
    initFlakes();
    window.requestAnimationFrame(draw);
  }

  function createSparkles() {
    if (prefersReducedMotion()) return;
    let activeSparkles = 0;
    const MAX_SPARKLES = 14;

    function spawnSparkle(event) {
      if (activeSparkles >= MAX_SPARKLES) return;
      const sparkle = document.createElement('span');
      sparkle.className = 'holiday-sparkle';
      sparkle.style.left = `${event.clientX}px`;
      sparkle.style.top = `${event.clientY}px`;
      sparkle.style.setProperty('--sparkle-hue', Math.floor(Math.random() * 30) + 10);
      document.body.appendChild(sparkle);
      activeSparkles += 1;
      sparkle.addEventListener('animationend', () => {
        sparkle.remove();
        activeSparkles -= 1;
      });
    }

    document.addEventListener('pointermove', spawnSparkle);
  }

  function getCountdownMessage() {
    const lang = getCurrentLanguage();
    const now = new Date();
    const target = new Date(now.getFullYear(), 11, 24, 0, 0, 0, 0);
    const diffDays = Math.ceil((target - now) / (1000 * 60 * 60 * 24));
    const isBefore = diffDays > 0;

    if (isBefore) {
      return lang === 'en'
        ? `Countdown to Christmas Eve: ${diffDays} ${diffDays === 1 ? 'day' : 'days'}`
        : `Cuenta regresiva para Nochebuena: ${diffDays} ${diffDays === 1 ? 'día' : 'días'}`;
    }

    return lang === 'en'
      ? 'Happy Holidays! Seasonal treats available until Dec 27.'
      : '¡Felices fiestas! Las sorpresas continúan hasta el 27 de diciembre.';
  }

  function addCountdownRibbon() {
    const ribbon = document.createElement('div');
    ribbon.className = 'holiday-ribbon';
    ribbon.role = 'status';
    ribbon.textContent = getCountdownMessage();
    document.body.prepend(ribbon);
  }

  function addHolidayToast() {
    const toast = document.createElement('div');
    toast.className = 'holiday-toast';
    const lang = getCurrentLanguage();
    const heading = document.createElement('strong');
    heading.textContent = lang === 'en' ? 'Holiday hours' : 'Horarios festivos';
    const message = document.createElement('span');
    message.textContent = lang === 'en'
      ? 'Ask your server about special closures and seasonal dishes.'
      : 'Pregunta por cierres especiales y platillos de temporada.';
    toast.appendChild(heading);
    toast.appendChild(message);
    document.body.appendChild(toast);
  }

  function createHolidayActionItem(list) {
    const existing = list.querySelector('[data-holiday-action]');
    if (existing) return;
    const lang = getCurrentLanguage();
    const li = document.createElement('li');
    li.className = 'home-actions__item';
    li.dataset.holidayAction = 'true';

    const link = document.createElement('a');
    link.className = 'home-actions__link home-actions__link--primary holiday-action';
    link.href = 'menu.html#holiday';
    link.dataset.soundId = 'menu-cta';

    const icon = document.createElement('span');
    icon.className = 'home-actions__icon';
    icon.setAttribute('aria-hidden', 'true');
    icon.innerHTML = '<svg fill="none" height="32" viewBox="0 0 32 32" width="32" xmlns="http://www.w3.org/2000/svg">\
<path d="M16 4l2.47 7.6H26l-6.18 4.5 2.36 7.3L16 19.5l-6.18 3.9 2.36-7.3L6 11.6h7.53L16 4z" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/>\
</svg>';

    const content = document.createElement('span');
    content.className = 'home-actions__content';

    const title = document.createElement('span');
    title.className = 'home-actions__title';
    title.textContent = lang === 'en' ? 'Holiday Specials' : 'Especiales Navideños';
    title.dataset.i18nEn = 'Holiday Specials';
    title.dataset.i18nEs = 'Especiales Navideños';

    const description = document.createElement('span');
    description.className = 'home-actions__description';
    description.textContent = lang === 'en'
      ? 'Try limited-time dishes and festive drinks.'
      : 'Prueba platillos y bebidas festivas por tiempo limitado.';
    description.dataset.i18nEn = 'Try limited-time dishes and festive drinks.';
    description.dataset.i18nEs = 'Prueba platillos y bebidas festivas por tiempo limitado.';

    content.appendChild(title);
    content.appendChild(description);
    link.appendChild(icon);
    link.appendChild(content);
    li.appendChild(link);
    list.appendChild(li);
  }

  function addHolidayActionTile() {
    const list = document.querySelector('[data-home-actions]');
    if (!list) return;

    const attemptInsert = () => createHolidayActionItem(list);

    if (list.getAttribute('data-home-actions-loaded') === 'true') {
      attemptInsert();
      return;
    }

    const observer = new MutationObserver(mutations => {
      for (const mutation of mutations) {
        if (mutation.type === 'attributes' && mutation.attributeName === 'data-home-actions-loaded') {
          if (list.getAttribute('data-home-actions-loaded') === 'true') {
            attemptInsert();
            observer.disconnect();
            return;
          }
        }
      }
    });

    observer.observe(list, { attributes: true });
  }

  function initSeasonalMode() {
    if (!isSeasonActive()) {
      return;
    }

    applySeasonalPalette();
    createLightString();
    createSnowLayer();
    createSparkles();
    addCountdownRibbon();
    addHolidayToast();
    addHolidayActionTile();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initSeasonalMode);
  } else {
    initSeasonalMode();
  }
})();

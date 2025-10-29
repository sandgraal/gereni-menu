(() => {
  const SOUND_STORAGE_KEY = 'gereni-halloween-sound';
  const TOKEN_STORAGE_KEY = 'gereni-halloween-tokens';
  const HALLOWEEN_EVENT_LIGHTING = 'gereni:halloween-lighting';
  const TOKEN_TOTAL = 5;
  const SOUND_LABELS = {
    on: { es: 'Activado', en: 'On' },
    off: { es: 'Silenciado', en: 'Muted' },
    toggleOn: { es: 'Activar ambientación', en: 'Enable ambience' },
    toggleOff: { es: 'Silenciar ambientación', en: 'Mute ambience' }
  };
  const COUNTDOWN_COMPLETE_LABEL = {
    es: '¡La noche embrujada está en marcha!',
    en: 'The haunted night is underway!'
  };
  const SCHEDULES = {
    es: [
      { time: '18:00', text: 'Fogata de bienvenida y chocolate especiado.' },
      { time: '19:30', text: 'Sesión del DJ Neblina con ritmos espectrales.' },
      { time: '21:00', text: 'Taller exprés de máscaras iluminadas.' },
      { time: '22:30', text: 'Brindis de pócimas exclusivas del chef.' }
    ],
    en: [
      { time: '6:00 p.m.', text: 'Welcome bonfire with spiced chocolate.' },
      { time: '7:30 p.m.', text: 'DJ Neblina spinning spectral beats.' },
      { time: '9:00 p.m.', text: 'Quick workshop for glowing masks.' },
      { time: '10:30 p.m.', text: 'Signature potion toast with the chef.' }
    ]
  };
  const POTION_RECIPES = {
    'mandarina+romero': {
      es: {
        title: 'Citrus del Bosque',
        share: 'Brindemos con un Citrus del Bosque en el Halloween de Gereni. #GereniHalloween'
      },
      en: {
        title: 'Forest Citrus Charm',
        share: 'Sipping a Forest Citrus Charm at the Gereni Halloween takeover. #GereniHalloween'
      }
    },
    'cafe+cascara': {
      es: {
        title: 'Eclipse de Cold Brew',
        share: 'Invoco un Eclipse de Cold Brew en Gereni. ¿Quién se apunta? #GereniHalloween'
      },
      en: {
        title: 'Cold Brew Eclipse',
        share: 'Summoning a Cold Brew Eclipse at Gereni. Join the ritual! #GereniHalloween'
      }
    },
    'guayaba+mandarina+romero': {
      es: {
        title: 'Luz de Guayaba',
        share: 'Conjuré una Luz de Guayaba en Gereni. ¡Salud! #GereniHalloween'
      },
      en: {
        title: 'Guava Glow',
        share: 'I conjured a Guava Glow at Gereni. Cheers! #GereniHalloween'
      }
    }
  };
  const SPELLBOOK_PAIRINGS = {
    'dusk-embers': {
      es: 'Marida con un cabernet ahumado y notas de cassis.',
      en: 'Pair it with a smoky cabernet and cassis accents.'
    },
    'witches-breath': {
      es: 'Acompaña con sauvignon blanc frío y romero.',
      en: 'Serve alongside chilled sauvignon blanc with rosemary.'
    },
    'midnight-serenade': {
      es: 'Perfecto con licor de naranja y espuma de vainilla.',
      en: 'Perfect with orange liqueur and vanilla foam.'
    }
  };
  const SOUND_RECIPES = {
    'menu-cta': playHootCue,
    'social-hover': playBellCue,
    'token-collect': playSparkCue,
    'token-complete': playCackleCue,
    'spell-turn': playPageFlipCue,
    'potion-brew': playBubbleCue
  };

  let soundEnabled = true;
  let audioContext = null;
  let masterGain = null;
  let prefersMotionQuery = null;
  let prefersReducedMotion = false;
  let soundToggleButton = null;
  let soundValueLabel = null;
  let spectralNav = null;
  let navItems = [];
  let navObserver = null;
  let navWisp = null;
  let countdownTarget = null;
  let countdownTimer = null;
  let countdownElements = null;
  let scheduleVisible = false;
  let currentLang = 'es';
  let tokenState = new Set();
  let announcer = null;
  let potionResultKey = null;
  let potionIngredients = [];

  function getCurrentLanguage() {
    if (window.GereniLang && typeof window.GereniLang.getCurrent === 'function') {
      return window.GereniLang.getCurrent();
    }
    const langAttr = document.documentElement.getAttribute('lang');
    return langAttr && langAttr.startsWith('en') ? 'en' : 'es';
  }

  function shouldPlayAudio() {
    return soundEnabled && !prefersReducedMotion;
  }

  function ensureAudioContext() {
    if (prefersReducedMotion) {
      return null;
    }
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextClass) {
      return null;
    }
    if (!audioContext) {
      audioContext = new AudioContextClass();
      masterGain = audioContext.createGain();
      masterGain.gain.value = 0.35;
      masterGain.connect(audioContext.destination);
    }
    return audioContext;
  }

  function resumeAudioContext() {
    if (audioContext && audioContext.state === 'suspended') {
      audioContext.resume().catch(() => {});
    }
  }

  function playSound(id) {
    if (!shouldPlayAudio()) {
      return;
    }
    const ctx = ensureAudioContext();
    if (!ctx || !masterGain) {
      return;
    }
    resumeAudioContext();
    const recipe = SOUND_RECIPES[id];
    if (typeof recipe === 'function') {
      recipe(ctx, masterGain);
    }
  }

  function playHootCue(ctx, destination) {
    const start = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(520, start);
    osc.frequency.exponentialRampToValueAtTime(240, start + 0.42);
    gain.gain.setValueAtTime(0.0001, start);
    gain.gain.exponentialRampToValueAtTime(0.28, start + 0.08);
    gain.gain.exponentialRampToValueAtTime(0.0001, start + 0.7);
    osc.connect(gain).connect(destination);
    osc.start(start);
    osc.stop(start + 0.75);
  }

  function playBellCue(ctx, destination) {
    const start = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(880, start);
    osc.frequency.exponentialRampToValueAtTime(1320, start + 0.15);
    gain.gain.setValueAtTime(0.0001, start);
    gain.gain.linearRampToValueAtTime(0.18, start + 0.05);
    gain.gain.exponentialRampToValueAtTime(0.0001, start + 0.35);
    osc.connect(gain).connect(destination);
    osc.start(start);
    osc.stop(start + 0.4);
  }

  function playSparkCue(ctx, destination) {
    const start = ctx.currentTime;
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.0001, start);
    gain.gain.linearRampToValueAtTime(0.22, start + 0.04);
    gain.gain.exponentialRampToValueAtTime(0.0001, start + 0.5);
    const osc = ctx.createOscillator();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(660, start);
    osc.frequency.exponentialRampToValueAtTime(1040, start + 0.2);
    osc.frequency.exponentialRampToValueAtTime(320, start + 0.5);
    osc.connect(gain).connect(destination);
    osc.start(start);
    osc.stop(start + 0.52);
  }

  function playCackleCue(ctx, destination) {
    const start = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'square';
    osc.frequency.setValueAtTime(420, start);
    osc.frequency.linearRampToValueAtTime(280, start + 0.5);
    osc.frequency.linearRampToValueAtTime(360, start + 0.8);
    gain.gain.setValueAtTime(0.0001, start);
    gain.gain.linearRampToValueAtTime(0.3, start + 0.1);
    gain.gain.linearRampToValueAtTime(0.18, start + 0.6);
    gain.gain.exponentialRampToValueAtTime(0.0001, start + 1.2);
    osc.connect(gain).connect(destination);
    osc.start(start);
    osc.stop(start + 1.25);
  }

  function playPageFlipCue(ctx, destination) {
    const start = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(540, start);
    osc.frequency.exponentialRampToValueAtTime(220, start + 0.32);
    gain.gain.setValueAtTime(0.0001, start);
    gain.gain.linearRampToValueAtTime(0.2, start + 0.05);
    gain.gain.exponentialRampToValueAtTime(0.0001, start + 0.45);
    osc.connect(gain).connect(destination);
    osc.start(start);
    osc.stop(start + 0.48);
  }

  function playBubbleCue(ctx, destination) {
    const start = ctx.currentTime;
    for (let i = 0; i < 3; i += 1) {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const offset = start + i * 0.08;
      osc.type = 'sine';
      osc.frequency.setValueAtTime(180 + i * 40, offset);
      osc.frequency.exponentialRampToValueAtTime(120 + i * 32, offset + 0.25);
      gain.gain.setValueAtTime(0.0001, offset);
      gain.gain.linearRampToValueAtTime(0.18, offset + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.0001, offset + 0.35);
      osc.connect(gain).connect(destination);
      osc.start(offset);
      osc.stop(offset + 0.38);
    }
  }

  function initSoundPreferences() {
    try {
      const stored = window.localStorage ? window.localStorage.getItem(SOUND_STORAGE_KEY) : null;
      if (stored === 'off') {
        soundEnabled = false;
      }
    } catch (err) {
      soundEnabled = true;
    }
    prefersMotionQuery = window.matchMedia ? window.matchMedia('(prefers-reduced-motion: reduce)') : null;
    prefersReducedMotion = prefersMotionQuery ? prefersMotionQuery.matches : false;
    if (prefersReducedMotion) {
      soundEnabled = false;
    }
    if (prefersMotionQuery) {
      const handler = (event) => {
        prefersReducedMotion = event.matches;
        if (prefersReducedMotion) {
          soundEnabled = false;
          updateSoundToggleUI();
        }
      };
      if (typeof prefersMotionQuery.addEventListener === 'function') {
        prefersMotionQuery.addEventListener('change', handler);
      } else if (typeof prefersMotionQuery.addListener === 'function') {
        prefersMotionQuery.addListener(handler);
      }
    }
  }

  function persistSoundPreference() {
    try {
      if (window.localStorage) {
        window.localStorage.setItem(SOUND_STORAGE_KEY, soundEnabled ? 'on' : 'off');
      }
    } catch (err) {
      // ignore persistence errors
    }
  }

  function updateSoundToggleUI() {
    if (!soundToggleButton || !soundValueLabel) {
      return;
    }
    const lang = currentLang;
    const labelSet = soundEnabled ? SOUND_LABELS.on : SOUND_LABELS.off;
    const toggleLabel = soundEnabled ? SOUND_LABELS.toggleOff : SOUND_LABELS.toggleOn;
    soundValueLabel.textContent = labelSet[lang] || labelSet.es;
    soundToggleButton.dataset.soundState = soundEnabled ? 'on' : 'off';
    soundToggleButton.setAttribute('data-sound-state', soundEnabled ? 'on' : 'off');
    const ariaLabel = toggleLabel[lang] || toggleLabel.es;
    soundToggleButton.setAttribute('aria-pressed', soundEnabled ? 'true' : 'false');
    soundToggleButton.setAttribute('aria-label', ariaLabel);
    soundToggleButton.title = ariaLabel;
  }

  function toggleSoundPreference() {
    soundEnabled = !soundEnabled;
    persistSoundPreference();
    updateSoundToggleUI();
    if (soundEnabled) {
      ensureAudioContext();
      playSound('token-collect');
    }
  }

  function attachSoundToggle() {
    soundToggleButton = document.querySelector('[data-sound-toggle]');
    soundValueLabel = soundToggleButton ? soundToggleButton.querySelector('[data-sound-label]') : null;
    if (soundToggleButton) {
      soundToggleButton.addEventListener('click', (event) => {
        event.preventDefault();
        toggleSoundPreference();
      });
    }
    document.addEventListener('pointerdown', ensureAudioContext, { once: true });
  }

  function initSpectralNav() {
    spectralNav = document.querySelector('.spectral-nav');
    if (!spectralNav) {
      return;
    }
    navItems = Array.from(spectralNav.querySelectorAll('.spectral-nav__item'));
    navWisp = spectralNav.querySelector('.spectral-nav__wisp');
    if (navItems.length === 0) {
      return;
    }
    navItems.forEach((item) => {
      const targetSelector = item.getAttribute('data-section-target');
      const button = item.querySelector('button');
      if (!targetSelector || !button) {
        return;
      }
      const section = document.querySelector(targetSelector);
      if (!section) {
        return;
      }
      button.addEventListener('click', (event) => {
        event.preventDefault();
        section.scrollIntoView({ behavior: 'smooth', block: 'start' });
        playSound('spell-turn');
      });
      item.__section = section; // eslint-disable-line no-underscore-dangle
    });
    const observerOptions = { rootMargin: '-30% 0px -60% 0px', threshold: [0.25, 0.6] };
    navObserver = new IntersectionObserver(handleSectionIntersection, observerOptions);
    navItems.forEach((item) => {
      if (item.__section) {
        navObserver.observe(item.__section);
      }
    });
    updateNavHighlight(navItems[0]);
  }

  function handleSectionIntersection(entries) {
    entries.forEach((entry) => {
      const item = navItems.find((navItem) => navItem.__section === entry.target);
      if (!item) {
        return;
      }
      if (entry.isIntersecting && entry.intersectionRatio >= 0.25) {
        updateNavHighlight(item);
      }
    });
  }

  function updateNavHighlight(item) {
    if (!item) {
      return;
    }
    navItems.forEach((navItem) => {
      navItem.dataset.active = navItem === item ? 'true' : 'false';
    });
    if (!navWisp || !spectralNav) {
      return;
    }
    const listEl = spectralNav.querySelector('.spectral-nav__list');
    if (!listEl) {
      return;
    }
    const { left: listLeft, width: listWidth } = listEl.getBoundingClientRect();
    const button = item.querySelector('button');
    if (!button) {
      return;
    }
    const { left, width } = button.getBoundingClientRect();
    const center = ((left - listLeft) + width / 2) / listWidth;
    navWisp.style.setProperty('--wisp-left', `${Math.max(0, Math.min(1, center)) * 100}%`);
  }

  function getUpcomingHalloweenStart() {
    const now = new Date();
    const year = now.getMonth() > 9 ? now.getFullYear() + 1 : now.getFullYear();
    return new Date(year, 9, 31, 18, 0, 0, 0);
  }

  function initCountdown() {
    const countdownRoot = document.querySelector('[data-countdown-display]');
    if (!countdownRoot) {
      return;
    }
    countdownElements = {
      root: countdownRoot,
      time: countdownRoot.querySelector('[data-countdown-time]'),
      scheduleWrapper: document.querySelector('[data-countdown-schedule]'),
      scheduleList: document.querySelector('[data-countdown-schedule-list]'),
      label: countdownRoot.querySelector('.countdown__label')
    };
    countdownTarget = getUpcomingHalloweenStart();
    updateCountdown();
    countdownTimer = window.setInterval(updateCountdown, 1000);
  }

  function updateCountdown() {
    if (!countdownElements || !countdownTarget) {
      return;
    }
    const now = Date.now();
    const diff = countdownTarget.getTime() - now;
    if (diff <= 0) {
      showCountdownSchedule();
      return;
    }
    const totalSeconds = Math.floor(diff / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    const formatted = [hours, minutes, seconds]
      .map((value) => String(value).padStart(2, '0'))
      .join(':');
    if (countdownElements.time) {
      countdownElements.time.textContent = formatted;
    }
  }

  function showCountdownSchedule() {
    if (!countdownElements) {
      return;
    }
    if (countdownTimer) {
      window.clearInterval(countdownTimer);
      countdownTimer = null;
    }
    if (countdownElements.label) {
      const message = COUNTDOWN_COMPLETE_LABEL[currentLang] || COUNTDOWN_COMPLETE_LABEL.es;
      countdownElements.label.textContent = message;
    }
    if (countdownElements.time) {
      countdownElements.time.textContent = '00:00:00';
    }
    if (countdownElements.scheduleWrapper) {
      countdownElements.scheduleWrapper.hidden = false;
    }
    renderSchedule();
    scheduleVisible = true;
  }

  function renderSchedule() {
    if (!countdownElements || !countdownElements.scheduleList) {
      return;
    }
    const entries = SCHEDULES[currentLang] || SCHEDULES.es;
    countdownElements.scheduleList.innerHTML = '';
    entries.forEach(({ time, text }) => {
      const li = document.createElement('li');
      const timeEl = document.createElement('time');
      timeEl.textContent = time;
      const matches = time.match(/\d+/g);
      let datetimeValue = time;
      if (matches && matches.length >= 2) {
        datetimeValue = `${matches[0].padStart(2, '0')}:${matches[1].padStart(2, '0')}`;
      } else if (matches && matches.length === 1) {
        datetimeValue = matches[0].padStart(2, '0');
      }
      timeEl.setAttribute('datetime', datetimeValue);
      const span = document.createElement('span');
      span.textContent = text;
      li.appendChild(timeEl);
      li.appendChild(span);
      countdownElements.scheduleList.appendChild(li);
    });
  }

  function initSpellbook() {
    const spellbook = document.querySelector('[data-spellbook]');
    if (!spellbook) {
      return;
    }
    const pages = Array.from(spellbook.querySelectorAll('.spellbook__page'));
    if (pages.length === 0) {
      return;
    }
    let currentIndex = pages.findIndex((page) => page.classList.contains('is-active'));
    if (currentIndex < 0) {
      currentIndex = 0;
      pages[0].classList.add('is-active');
    }
    const prevButton = document.querySelector('[data-spellbook-prev]');
    const nextButton = document.querySelector('[data-spellbook-next]');
    const bookmarks = spellbook.querySelectorAll('.spellbook__bookmark');

    function goToPage(nextIndex) {
      if (nextIndex === currentIndex || nextIndex < 0 || nextIndex >= pages.length) {
        return;
      }
      const currentPage = pages[currentIndex];
      const nextPage = pages[nextIndex];
      currentPage.classList.remove('is-active');
      currentPage.classList.add('is-leaving');
      window.setTimeout(() => {
        currentPage.classList.remove('is-leaving');
      }, 680);
      nextPage.classList.add('is-active');
      currentIndex = nextIndex;
      playSound('spell-turn');
    }

    if (prevButton) {
      prevButton.addEventListener('click', () => {
        goToPage((currentIndex - 1 + pages.length) % pages.length);
      });
    }
    if (nextButton) {
      nextButton.addEventListener('click', () => {
        goToPage((currentIndex + 1) % pages.length);
      });
    }
    bookmarks.forEach((bookmark) => {
      bookmark.addEventListener('click', () => {
        const page = bookmark.closest('.spellbook__page');
        if (!page) {
          return;
        }
        const id = page.getAttribute('data-spell');
        const pairing = (id && SPELLBOOK_PAIRINGS[id]) ? SPELLBOOK_PAIRINGS[id][currentLang] || SPELLBOOK_PAIRINGS[id].es : null;
        if (pairing) {
          announce(pairing);
        }
        playSound('token-collect');
      });
    });
  }

  function initPotionMixer() {
    const lab = document.querySelector('[data-potion-lab]');
    if (!lab) {
      return;
    }
    const ingredients = Array.from(lab.querySelectorAll('[data-ingredient]'));
    const cauldron = lab.querySelector('[data-cauldron]');
    const result = lab.querySelector('[data-potion-result]');
    const shareButton = lab.querySelector('[data-potion-share]');
    if (!cauldron || !result || !shareButton) {
      return;
    }

    function commitPotionResult(key, data) {
      potionResultKey = key;
      result.textContent = data.title;
      shareButton.hidden = false;
      shareButton.dataset.shareMessage = data.share;
      announce(data.title);
      playSound('potion-brew');
    }

    function evaluatePotion() {
      const unique = [...new Set(potionIngredients.slice(-3))];
      if (unique.length === 0) {
        result.textContent = '';
        shareButton.hidden = true;
        shareButton.dataset.shareMessage = '';
        return;
      }
      const key = unique.slice().sort().join('+');
      const recipe = POTION_RECIPES[key];
      if (recipe) {
        commitPotionResult(key, recipe[currentLang] || recipe.es);
        return;
      }
      const fallback = {
        es: {
          title: `Brebaje misterioso (${unique.join(' + ')})`,
          share: 'Descubrí un brebaje misterioso en el caldero de Gereni. #GereniHalloween'
        },
        en: {
          title: `Mysterious brew (${unique.join(' + ')})`,
          share: 'I unlocked a mysterious brew at the Gereni cauldron. #GereniHalloween'
        }
      };
      commitPotionResult(key, fallback[currentLang]);
    }

    ingredients.forEach((item) => {
      item.addEventListener('dragstart', (event) => {
        event.dataTransfer.setData('text/plain', item.getAttribute('data-ingredient'));
        event.dataTransfer.effectAllowed = 'copy';
      });
      item.addEventListener('keydown', (event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          potionIngredients.push(item.getAttribute('data-ingredient'));
          evaluatePotion();
        }
      });
      item.addEventListener('click', () => {
        potionIngredients.push(item.getAttribute('data-ingredient'));
        evaluatePotion();
      });
    });

    cauldron.addEventListener('dragover', (event) => {
      event.preventDefault();
      event.dataTransfer.dropEffect = 'copy';
    });

    cauldron.addEventListener('drop', (event) => {
      event.preventDefault();
      const ingredient = event.dataTransfer.getData('text/plain');
      if (ingredient) {
        potionIngredients.push(ingredient);
        evaluatePotion();
      }
    });

    shareButton.addEventListener('click', async () => {
      const shareMessage = shareButton.dataset.shareMessage;
      if (!shareMessage) {
        return;
      }
      if (navigator.share && typeof navigator.share === 'function') {
        try {
          await navigator.share({ text: shareMessage });
          playSound('social-hover');
          return;
        } catch (err) {
          // fall back to clipboard
        }
      }
      if (navigator.clipboard && typeof navigator.clipboard.writeText === 'function') {
        try {
          await navigator.clipboard.writeText(shareMessage);
          announce(currentLang === 'en' ? 'Copied potion share message.' : 'Mensaje de poción copiado.');
          playSound('social-hover');
          return;
        } catch (err) {
          // ignore clipboard failure
        }
      }
      window.prompt(currentLang === 'en' ? 'Copy this potion message:' : 'Copia este mensaje de poción:', shareMessage); // eslint-disable-line no-alert
    });
  }

  function loadTokenState() {
    try {
      const stored = window.localStorage ? window.localStorage.getItem(TOKEN_STORAGE_KEY) : null;
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          tokenState = new Set(parsed);
        }
      }
    } catch (err) {
      tokenState = new Set();
    }
  }

  function saveTokenState() {
    try {
      if (window.localStorage) {
        window.localStorage.setItem(TOKEN_STORAGE_KEY, JSON.stringify(Array.from(tokenState)));
      }
    } catch (err) {
      // ignore
    }
  }

  function initTokens() {
    const tokenButtons = Array.from(document.querySelectorAll('[data-token-id]'));
    if (tokenButtons.length === 0) {
      return;
    }
    loadTokenState();
    tokenButtons.forEach((button) => {
      const id = button.getAttribute('data-token-id');
      if (!id) {
        return;
      }
      if (tokenState.has(id)) {
        markTokenCollected(button);
      }
      button.addEventListener('click', () => {
        if (tokenState.has(id)) {
          return;
        }
        tokenState.add(id);
        markTokenCollected(button);
        saveTokenState();
        playSound('token-collect');
        if (tokenState.size >= TOKEN_TOTAL) {
          showTokenCelebration();
          playSound('token-complete');
        }
      });
    });
  }

  function markTokenCollected(button) {
    button.classList.add('is-collected');
    button.setAttribute('aria-pressed', 'true');
    button.disabled = true;
  }

  function showTokenCelebration() {
    if (document.querySelector('[data-token-popup]')) {
      return;
    }
    const overlay = document.createElement('div');
    overlay.className = 'token-popup';
    overlay.setAttribute('data-token-popup', '');
    overlay.setAttribute('role', 'dialog');
    overlay.setAttribute('aria-modal', 'true');
    const content = document.createElement('div');
    content.className = 'token-popup__content';
    const title = document.createElement('h2');
    title.className = 'token-popup__title';
    title.textContent = currentLang === 'en' ? 'You found every spirit token!' : '¡Encontraste todas las fichas espirituales!';
    const message = document.createElement('p');
    message.className = 'token-popup__message';
    message.textContent = currentLang === 'en'
      ? 'Enjoy your exclusive witch laugh and show off your findings on social media.'
      : 'Disfruta la risa embrujada exclusiva y presume tus hallazgos en redes.';
    const close = document.createElement('button');
    close.className = 'token-popup__close';
    close.type = 'button';
    close.textContent = currentLang === 'en' ? 'Close portal' : 'Cerrar portal';
    close.addEventListener('click', () => {
      overlay.remove();
    });
    overlay.addEventListener('click', (event) => {
      if (event.target === overlay) {
        overlay.remove();
      }
    });
    document.addEventListener('keydown', function escListener(event) {
      if (event.key === 'Escape') {
        overlay.remove();
        document.removeEventListener('keydown', escListener);
      }
    });
    content.appendChild(title);
    content.appendChild(message);
    content.appendChild(close);
    overlay.appendChild(content);
    document.body.appendChild(overlay);
    close.focus();
  }

  function announce(message) {
    if (!announcer) {
      announcer = document.createElement('div');
      announcer.className = 'sr-only';
      announcer.setAttribute('aria-live', 'polite');
      document.body.appendChild(announcer);
    }
    announcer.textContent = message;
  }

  function attachSoundCues() {
    const cueElements = document.querySelectorAll('[data-sound-id]');
    cueElements.forEach((element) => {
      const id = element.getAttribute('data-sound-id');
      if (!id) {
        return;
      }
      element.addEventListener('pointerenter', () => playSound(id));
      element.addEventListener('focus', () => playSound(id));
    });
  }

  function updateLanguageDependentUI() {
    currentLang = getCurrentLanguage();
    updateSoundToggleUI();
    if (scheduleVisible) {
      renderSchedule();
      if (countdownElements && countdownElements.label) {
        countdownElements.label.textContent = COUNTDOWN_COMPLETE_LABEL[currentLang] || COUNTDOWN_COMPLETE_LABEL.es;
      }
    }
    if (potionResultKey && POTION_RECIPES[potionResultKey]) {
      const recipe = POTION_RECIPES[potionResultKey];
      const data = recipe[currentLang] || recipe.es;
      const shareButton = document.querySelector('[data-potion-share]');
      const result = document.querySelector('[data-potion-result]');
      if (result && data) {
        result.textContent = data.title;
      }
      if (shareButton && data) {
        shareButton.dataset.shareMessage = data.share;
      }
    }
  }

  function initLightingListener() {
    document.addEventListener(HALLOWEEN_EVENT_LIGHTING, (event) => {
      if (!spectralNav) {
        return;
      }
      const detail = event.detail || {};
      const state = detail.state || {};
      if (typeof state.wispOpacity !== 'number') {
        return;
      }
      spectralNav.style.setProperty('--halloween-wisp-opacity', state.wispOpacity.toFixed(3));
    });
  }

  function init() {
    currentLang = getCurrentLanguage();
    initSoundPreferences();
    attachSoundToggle();
    updateSoundToggleUI();
    attachSoundCues();
    initSpectralNav();
    initCountdown();
    initSpellbook();
    initPotionMixer();
    initTokens();
    initLightingListener();
    updateLanguageDependentUI();
    document.addEventListener('gereni:languagechange', updateLanguageDependentUI);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();

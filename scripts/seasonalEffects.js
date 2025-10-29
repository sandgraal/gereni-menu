(() => {
  const PANEL_SELECTOR = '.home-panel';
  const EFFECT_ATTRIBUTE = 'data-seasonal-effect';
  const HALLOWEEN_VALUE = 'halloween';
  const BODY_CLASS = 'holiday--halloween';
  const OVERLAY_CLASS = 'seasonal-overlay';
  const OVERLAY_ENTER_CLASS = 'seasonal-overlay--enter';
  const SPIDER_LAYER_CLASS = 'seasonal-overlay__spider-layer';
  const SPIDER_CLASS = 'seasonal-overlay__spider';
  const SPIDER_BODY_CLASS = 'seasonal-overlay__spider-body';
  const SPIDER_EYES_CLASS = 'seasonal-overlay__spider-eyes';
  const SPIDER_WEB_CLASS = 'seasonal-overlay__spider-web';
  const SPIDER_ANIMATION_CLASS = 'seasonal-overlay__spider--animating';
  const MIN_SPIDER_INTERVAL = 4500;
  const MAX_SPIDER_INTERVAL = 9000;
  const MAX_ACTIVE_SPIDERS = 4;
  const FOG_CLASS = 'seasonal-overlay__fog';
  const HALLOWEEN_EVENT_ACTIVE = 'gereni:halloween-active';
  const HALLOWEEN_EVENT_INACTIVE = 'gereni:halloween-inactive';
  const HALLOWEEN_EVENT_LIGHTING = 'gereni:halloween-lighting';
  const LIGHTING_UPDATE_INTERVAL = 60 * 1000;
  const DUSK_START_HOUR = 17;
  const MIDNIGHT_END_HOUR = 24;
  const FOG_THRESHOLD_HOUR = 20;

  const GRADIENT_START_DUSK = [255, 120, 48, 0.32];
  const GRADIENT_START_MIDNIGHT = [98, 68, 180, 0.52];
  const GRADIENT_END_DUSK = [88, 42, 156, 0.34];
  const GRADIENT_END_MIDNIGHT = [32, 16, 68, 0.52];
  const AMBIENT_GLOW_A_DUSK = [255, 188, 102, 0.4];
  const AMBIENT_GLOW_A_MIDNIGHT = [168, 112, 255, 0.48];
  const AMBIENT_GLOW_B_DUSK = [147, 103, 255, 0.42];
  const AMBIENT_GLOW_B_MIDNIGHT = [96, 134, 255, 0.55];
  const AMBIENT_RIBBON_DUSK = [16, 8, 26, 0.15];
  const AMBIENT_RIBBON_MIDNIGHT = [8, 12, 40, 0.32];
  const NIGHT_VEIL_DUSK = [14, 14, 14, 0.7];
  const NIGHT_VEIL_MIDNIGHT = [4, 4, 12, 0.86];

  let observer = null;
  let overlay = null;
  let spiderLayer = null;
  let fogLayer = null;
  let spiderTimeout = null;
  let lightingTimer = null;
  let lastLightingPayload = null;
  let isActive = false;
  const activeSpiders = new Set();
  let lastSpiderAnalyticsAt = 0;

  const motionQuery = typeof window !== 'undefined' && typeof window.matchMedia === 'function'
    ? window.matchMedia('(prefers-reduced-motion: reduce)')
    : null;

  function isMotionReduced() {
    return motionQuery ? motionQuery.matches : false;
  }

  function clamp(value, min, max) {
    return Math.min(Math.max(value, min), max);
  }

  function lerp(start, end, t) {
    return start + (end - start) * t;
  }

  function formatColor([r, g, b, a]) {
    return `rgba(${Math.round(r)}, ${Math.round(g)}, ${Math.round(b)}, ${a.toFixed(3)})`;
  }

  function mixColor(colorA, colorB, progress) {
    const t = clamp(progress, 0, 1);
    return formatColor([
      lerp(colorA[0], colorB[0], t),
      lerp(colorA[1], colorB[1], t),
      lerp(colorA[2], colorB[2], t),
      lerp(colorA[3], colorB[3], t)
    ]);
  }

  function computeLightingState(now = new Date()) {
    const hours = now.getHours() + now.getMinutes() / 60;
    const rawProgress = (hours - DUSK_START_HOUR) / (MIDNIGHT_END_HOUR - DUSK_START_HOUR);
    const progress = clamp(rawProgress, 0, 1);
    const fogBoost = hours >= FOG_THRESHOLD_HOUR ? 0.12 : 0;
    return {
      progress,
      gradientStart: mixColor(GRADIENT_START_DUSK, GRADIENT_START_MIDNIGHT, progress),
      gradientEnd: mixColor(GRADIENT_END_DUSK, GRADIENT_END_MIDNIGHT, progress),
      ambientGlowA: mixColor(AMBIENT_GLOW_A_DUSK, AMBIENT_GLOW_A_MIDNIGHT, progress),
      ambientGlowB: mixColor(AMBIENT_GLOW_B_DUSK, AMBIENT_GLOW_B_MIDNIGHT, progress),
      ambientRibbon: mixColor(AMBIENT_RIBBON_DUSK, AMBIENT_RIBBON_MIDNIGHT, progress),
      nightVeil: mixColor(NIGHT_VEIL_DUSK, NIGHT_VEIL_MIDNIGHT, progress),
      brightness: (progress < 0.35 ? lerp(1.1, 1, progress / 0.35) : lerp(1, 0.82, (progress - 0.35) / 0.65)).toFixed(3),
      fogDensity: clamp(0.22 + progress * 0.35 + fogBoost, 0.22, 0.62),
      shadowStrength: clamp(0.26 + progress * 0.32, 0.26, 0.58),
      wispOpacity: clamp(0.45 + progress * 0.3, 0.45, 0.75)
    };
  }

  function applyLightingState(state) {
    if (!document.body) {
      return;
    }
    document.body.style.setProperty('--halloween-gradient-start', state.gradientStart);
    document.body.style.setProperty('--halloween-gradient-end', state.gradientEnd);
    document.body.style.setProperty('--halloween-ambient-glow-a', state.ambientGlowA);
    document.body.style.setProperty('--halloween-ambient-glow-b', state.ambientGlowB);
    document.body.style.setProperty('--halloween-ambient-ribbon', state.ambientRibbon);
    document.body.style.setProperty('--halloween-night-veil', state.nightVeil);
    document.body.style.setProperty('--halloween-brightness', state.brightness);
    document.body.style.setProperty('--halloween-fog-density', state.fogDensity.toFixed(3));
    document.body.style.setProperty('--halloween-shadow-strength', state.shadowStrength.toFixed(3));
    document.body.style.setProperty('--halloween-wisp-opacity', state.wispOpacity.toFixed(3));
  }

  function clearLightingState() {
    if (!document.body) {
      return;
    }
    const props = [
      '--halloween-gradient-start',
      '--halloween-gradient-end',
      '--halloween-ambient-glow-a',
      '--halloween-ambient-glow-b',
      '--halloween-ambient-ribbon',
      '--halloween-night-veil',
      '--halloween-brightness',
      '--halloween-fog-density',
      '--halloween-shadow-strength',
      '--halloween-wisp-opacity'
    ];
    props.forEach(prop => {
      document.body.style.removeProperty(prop);
    });
    lastLightingPayload = null;
  }

  function emitEvent(name, detail) {
    document.dispatchEvent(new CustomEvent(name, { detail }));
  }

  function updateActiveState(active, detail) {
    if (isActive === active) {
      return;
    }
    isActive = active;
    emitEvent(active ? HALLOWEEN_EVENT_ACTIVE : HALLOWEEN_EVENT_INACTIVE, Object.assign({ active }, detail));
  }

  function updateLighting() {
    const state = computeLightingState();
    applyLightingState(state);
    const payload = {
      progress: state.progress,
      fogDensity: state.fogDensity,
      shadowStrength: state.shadowStrength,
      timestamp: Date.now()
    };
    if (!lastLightingPayload || Math.abs(lastLightingPayload.progress - state.progress) > 0.01) {
      emitEvent(HALLOWEEN_EVENT_LIGHTING, Object.assign({ state }, payload));
    }
    lastLightingPayload = payload;
  }

  function startLightingLoop() {
    if (lightingTimer) {
      return;
    }
    updateLighting();
    lightingTimer = window.setInterval(updateLighting, LIGHTING_UPDATE_INTERVAL);
  }

  function stopLightingLoop() {
    if (lightingTimer) {
      window.clearInterval(lightingTimer);
      lightingTimer = null;
    }
    clearLightingState();
  }

  function ensureOverlay() {
    if (overlay) {
      return overlay;
    }
    const container = document.createElement('div');
    container.className = OVERLAY_CLASS;
    container.setAttribute('aria-hidden', 'true');
    container.innerHTML = [
      '<div class="seasonal-overlay__glow"></div>',
      '<div class="seasonal-overlay__bats" aria-hidden="true">',
      '  <span class="seasonal-overlay__bat seasonal-overlay__bat--left"></span>',
      '  <span class="seasonal-overlay__bat seasonal-overlay__bat--right"></span>',
      '</div>',
      '<div class="seasonal-overlay__lanterns" aria-hidden="true">',
      '  <span class="seasonal-overlay__lantern seasonal-overlay__lantern--front"></span>',
      '  <span class="seasonal-overlay__lantern seasonal-overlay__lantern--rear"></span>',
      '</div>',
      `<div class="${FOG_CLASS}" aria-hidden="true"></div>`
    ].join('');
    overlay = container;
    fogLayer = overlay.querySelector(`.${FOG_CLASS}`) || null;
    spiderLayer = document.createElement('div');
    spiderLayer.className = SPIDER_LAYER_CLASS;
    spiderLayer.setAttribute('aria-hidden', 'true');
    overlay.appendChild(spiderLayer);
    return overlay;
  }

  function playOverlayEntrance(element) {
    if (!element) {
      return;
    }
    element.classList.remove(OVERLAY_ENTER_CLASS);
    // Force a reflow so the animation can replay when the overlay is reattached.
    void element.offsetWidth;
    element.classList.add(OVERLAY_ENTER_CLASS);
  }

  function removeOverlay() {
    if (overlay && overlay.isConnected) {
      overlay.remove();
      overlay.classList.remove(OVERLAY_ENTER_CLASS);
      overlay = null;
      spiderLayer = null;
      fogLayer = null;
    }
  }

  function disableEffect(reason) {
    if (isActive) {
      updateActiveState(false, { reason: reason || 'disabled' });
    }
    stopSpiders();
    stopLightingLoop();
    removeOverlay();
    if (document.body) {
      document.body.classList.remove(BODY_CLASS);
    }
  }

  function hasHalloweenCard(panel) {
    if (!panel) {
      return false;
    }
    return Boolean(panel.querySelector(`[${EFFECT_ATTRIBUTE}="${HALLOWEEN_VALUE}"]`));
  }

  function updateEffect() {
    const body = document.body;
    if (!body || !body.classList.contains('inicio')) {
      disableEffect('not-home');
      return;
    }

    const panel = document.querySelector(PANEL_SELECTOR);
    const shouldEnable = hasHalloweenCard(panel) && !isMotionReduced();

    if (!shouldEnable) {
      disableEffect('conditions-not-met');
      return;
    }

    body.classList.add(BODY_CLASS);
    const overlayElement = ensureOverlay();
    if (overlayElement && !overlayElement.isConnected) {
      body.appendChild(overlayElement);
    }
    if (overlayElement) {
      playOverlayEntrance(overlayElement);
    }
    if (!isActive) {
      updateActiveState(true, { reason: 'seasonal-card' });
    }
    startLightingLoop();
    if (spiderLayer) {
      startSpiders();
    }
  }

  function handleMutation() {
    updateEffect();
  }

  function observePanel(panel) {
    if (!panel) {
      return;
    }
    if (observer) {
      observer.disconnect();
    }
    observer = new MutationObserver(handleMutation);
    observer.observe(panel, {
      subtree: true,
      childList: true,
      attributes: true,
      attributeFilter: [EFFECT_ATTRIBUTE]
    });
    updateEffect();
  }

  function init() {
    if (!document.body || !document.body.classList.contains('inicio')) {
      return;
    }
    const panel = document.querySelector(PANEL_SELECTOR);
    if (panel) {
      observePanel(panel);
    } else {
      updateEffect();
    }
  }

  // Store reference to handler for cleanup
  const motionQueryHandler = updateEffect;
  let motionQueryCleanup = null;
  if (motionQuery) {
    if (typeof motionQuery.addEventListener === 'function') {
      motionQuery.addEventListener('change', motionQueryHandler);
      motionQueryCleanup = () => {
        motionQuery.removeEventListener('change', motionQueryHandler);
      };
    } else if (typeof motionQuery.addListener === 'function') {
      motionQuery.addListener(motionQueryHandler);
      motionQueryCleanup = () => {
        motionQuery.removeListener(motionQueryHandler);
      };
    }
  }
  // Remove event listener on unload to prevent memory leaks
  if (motionQueryCleanup) {
    window.addEventListener('unload', motionQueryCleanup);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init, { once: true });
  } else {
    init();
  }

  function createSpiderElement() {
    if (!spiderLayer) {
      return null;
    }
    const spider = document.createElement('div');
    spider.className = `${SPIDER_CLASS} ${SPIDER_ANIMATION_CLASS}`;
    const body = document.createElement('span');
    body.className = SPIDER_BODY_CLASS;
    const eyes = document.createElement('span');
    eyes.className = SPIDER_EYES_CLASS;
    const thread = document.createElement('span');
    thread.className = SPIDER_WEB_CLASS;
    spider.appendChild(body);
    spider.appendChild(eyes);
    spider.appendChild(thread);

    const offset = Math.random();
    const horizontalPosition = Math.round(offset * 100);
    spider.style.setProperty('--spider-left', `${horizontalPosition}%`);
    const scale = 0.85 + Math.random() * 0.5;
    const scaleRounded = Number(scale.toFixed(2));
    spider.style.setProperty('--spider-scale', String(scale));
    const duration = 4 + Math.random() * 3;
    const durationSeconds = Number(duration.toFixed(2));
    spider.style.setProperty('--spider-duration', `${durationSeconds}s`);
    const swayDirection = Math.random() > 0.5 ? '1' : '-1';
    spider.style.setProperty('--spider-sway-direction', swayDirection);

    const spiderId = `spider-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
    spider.dataset.analyticsId = spiderId;

    spider.addEventListener('animationend', () => {
      activeSpiders.delete(spider);
      spider.remove();
    }, { once: true });

    activeSpiders.add(spider);
    spiderLayer.appendChild(spider);

    const metadata = {
      spiderId,
      activeSpiders: activeSpiders.size,
      offset: horizontalPosition,
      duration: durationSeconds,
      overlayAttached: Boolean(overlay && overlay.isConnected),
      reducedMotion: isMotionReduced(),
      scale: scaleRounded
    };
    queueSpiderAnalytics(metadata);
    return spider;
  }

  function scheduleNextSpider() {
    if (spiderTimeout) {
      clearTimeout(spiderTimeout);
    }
    const delay = Math.round(
      MIN_SPIDER_INTERVAL + Math.random() * (MAX_SPIDER_INTERVAL - MIN_SPIDER_INTERVAL)
    );
    spiderTimeout = window.setTimeout(() => {
      spiderTimeout = null;
      if (activeSpiders.size < MAX_ACTIVE_SPIDERS) {
        createSpiderElement();
      }
      scheduleNextSpider();
    }, delay);
  }

  function startSpiders() {
    if (!spiderLayer || spiderTimeout) {
      return;
    }
    // Warm up with an immediate spider to reinforce the Halloween mood.
    if (activeSpiders.size === 0) {
      createSpiderElement();
    }
    scheduleNextSpider();
  }

  function stopSpiders() {
    if (spiderTimeout) {
      clearTimeout(spiderTimeout);
      spiderTimeout = null;
    }
    if (activeSpiders.size > 0) {
      activeSpiders.forEach((spider) => {
        if (spider && spider.isConnected) {
          spider.remove();
        }
      });
      activeSpiders.clear();
    }
  }
})();

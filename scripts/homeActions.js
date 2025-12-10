(function() {
  'use strict';

  const list = document.querySelector('[data-home-actions]');
  if (!list) {
    return;
  }

  const sourceUrl = list.getAttribute('data-home-actions-source') || 'data/home-actions.json';
  const wifiSection = document.querySelector('[data-wifi-section]');
  const wifiElements = wifiSection ? {
    instructions: wifiSection.querySelector('[data-wifi-instructions]'),
    copyButton: wifiSection.querySelector('[data-wifi-copy]'),
    feedback: wifiSection.querySelector('[data-wifi-feedback]'),
    launchLink: wifiSection.querySelector('[data-wifi-launch]'),
    qrPlaceholder: wifiSection.querySelector('[data-wifi-qr]')
  } : {};
  let wifiCopyHandlerAttached = false;
  let wifiFeedbackTimeout = null;
  const wifiFallbackCopy = wifiSection && wifiSection.dataset ? (wifiSection.dataset.wifiCopy || '').trim() : '';
  const wifiFallbackPortalHref = wifiElements.launchLink ? wifiElements.launchLink.getAttribute('href') : '';

  function getCurrentLanguage() {
    if (window.GereniLang && typeof window.GereniLang.getCurrent === 'function') {
      return window.GereniLang.getCurrent();
    }
    const langAttr = document.documentElement.getAttribute('lang') || 'es';
    return langAttr.toLowerCase().startsWith('en') ? 'en' : 'es';
  }

  function resolveLocalizedValue(value) {
    if (!value) {
      return '';
    }
    if (typeof value === 'string') {
      return value;
    }
    if (typeof value === 'object') {
      const lang = getCurrentLanguage();
      if (typeof value[lang] === 'string' && value[lang].trim()) {
        return value[lang];
      }
      if (typeof value.es === 'string' && value.es.trim()) {
        return value.es;
      }
      if (typeof value.en === 'string' && value.en.trim()) {
        return value.en;
      }
    }
    return '';
  }

  function applyTranslationsToElement(el, translations) {
    if (!el || !translations || typeof translations !== 'object') {
      return;
    }
    if (typeof translations.es === 'string') {
      el.dataset.i18nEs = translations.es;
    }
    if (typeof translations.en === 'string') {
      el.dataset.i18nEn = translations.en;
    }
  }

  function setElementText(el, value, fallback) {
    if (!el) {
      return;
    }
    const resolved = typeof value === 'string' && value.trim() ? value : fallback;
    if (typeof resolved === 'string' && resolved.trim()) {
      el.textContent = resolved;
    }
  }

  function fallbackCopyText(text) {
    try {
      const textarea = document.createElement('textarea');
      textarea.value = text;
      textarea.setAttribute('readonly', '');
      textarea.style.position = 'absolute';
      textarea.style.left = '-9999px';
      document.body.appendChild(textarea);
      textarea.select();
      const result = document.execCommand('copy');
      document.body.removeChild(textarea);
      return result;
    } catch (error) {
      return false;
    }
  }

  function escapeWifiValue(value) {
    return String(value || '').replace(/([\\;,:"])/g, '\\$1');
  }

  function resetWifiQr() {
    if (!wifiElements.qrPlaceholder) {
      return;
    }

    wifiElements.qrPlaceholder.hidden = true;
    wifiElements.qrPlaceholder.setAttribute('aria-hidden', 'true');
    wifiElements.qrPlaceholder.removeAttribute('aria-label');

    if (wifiElements.qrPlaceholder.tagName === 'CANVAS') {
      const context = wifiElements.qrPlaceholder.getContext('2d');
      if (context) {
        const width = wifiElements.qrPlaceholder.width || wifiElements.qrPlaceholder.clientWidth;
        const height = wifiElements.qrPlaceholder.height || wifiElements.qrPlaceholder.clientHeight;
        context.clearRect(0, 0, width, height);
      }
    } else if (wifiElements.qrPlaceholder.tagName === 'IMG') {
      wifiElements.qrPlaceholder.removeAttribute('src');
    }
  }

  function showWifiFeedback(type) {
    if (!wifiElements.feedback) {
      return;
    }
    const lang = getCurrentLanguage();
    const dataset = wifiElements.feedback.dataset;
    let message = '';
    if (type === 'error') {
      message = lang === 'en'
        ? (dataset.wifiFeedbackErrorEn || dataset.i18nEn || wifiElements.feedback.textContent)
        : (dataset.wifiFeedbackErrorEs || dataset.i18nEs || wifiElements.feedback.textContent);
    } else {
      message = lang === 'en'
        ? (dataset.i18nEn || wifiElements.feedback.textContent)
        : (dataset.i18nEs || wifiElements.feedback.textContent);
    }
    if (!message) {
      return;
    }
    wifiElements.feedback.textContent = message;
    wifiElements.feedback.hidden = false;
    if (wifiFeedbackTimeout) {
      window.clearTimeout(wifiFeedbackTimeout);
    }
    wifiFeedbackTimeout = window.setTimeout(() => {
      wifiElements.feedback.hidden = true;
    }, 3000);
  }

  function ensureWifiCopyHandler() {
    if (!wifiElements.copyButton || wifiCopyHandlerAttached) {
      return;
    }

    wifiElements.copyButton.addEventListener('click', () => {
      const copyValue = wifiElements.copyButton.dataset.wifiCopy || (wifiSection && wifiSection.dataset && wifiSection.dataset.wifiCopy) || '';
      if (!copyValue) {
        showWifiFeedback('error');
        return;
      }

      const handleSuccess = () => {
        showWifiFeedback('success');
      };

      const handleFailure = () => {
        showWifiFeedback('error');
      };

      if (navigator.clipboard && typeof navigator.clipboard.writeText === 'function') {
        navigator.clipboard.writeText(copyValue).then(handleSuccess).catch(() => {
          if (fallbackCopyText(copyValue)) {
            handleSuccess();
          } else {
            handleFailure();
          }
        });
      } else if (fallbackCopyText(copyValue)) {
        handleSuccess();
      } else {
        handleFailure();
      }
    });

    wifiCopyHandlerAttached = true;
  }

  function primeWifiDefaults() {
    if (!wifiSection) {
      return;
    }
    if (wifiSection.dataset && wifiFallbackCopy) {
      wifiSection.dataset.wifiCopy = wifiFallbackCopy;
    }
    if (wifiElements.copyButton) {
      if (wifiFallbackCopy) {
        wifiElements.copyButton.hidden = false;
        wifiElements.copyButton.dataset.wifiCopy = wifiFallbackCopy;
      } else {
        wifiElements.copyButton.hidden = true;
      }
    }
    ensureWifiCopyHandler();
  }

  function renderWifiQr(ssidValue, passwordValue, securityValue) {
    if (!wifiElements.qrPlaceholder) {
      return;
    }

    if (!ssidValue || !passwordValue || !window.QrCreator) {
      resetWifiQr();
      return;
    }

    const qrSecurity = securityValue || 'WPA';
    const wifiPayload = `WIFI:S:${escapeWifiValue(ssidValue)};T:${escapeWifiValue(qrSecurity)};P:${escapeWifiValue(passwordValue)};H:false;`;
    const size = Math.max(140, Math.min(220, Math.round(wifiElements.qrPlaceholder.clientWidth || 180)));
    const qrLabel = getCurrentLanguage() === 'en'
      ? `Wi-Fi QR for network ${ssidValue}`
      : `Código QR para la red ${ssidValue}`;

    window.QrCreator.render({
      text: wifiPayload,
      radius: 0,
      ecLevel: 'M',
      fill: '#231c15',
      background: '#ffffff',
      size
    }, wifiElements.qrPlaceholder);

    wifiElements.qrPlaceholder.hidden = false;
    wifiElements.qrPlaceholder.removeAttribute('aria-hidden');
    wifiElements.qrPlaceholder.setAttribute('aria-label', qrLabel);
  }

  function resolveActions(payload) {
    if (!payload) {
      return [];
    }

    if (Array.isArray(payload)) {
      return payload;
    }

    if (Array.isArray(payload.actions)) {
      return payload.actions;
    }

    return [];
  }

  const ICON_MARKUP = {
    menu: '<svg fill="none" height="32" viewBox="0 0 32 32" width="32" xmlns="http://www.w3.org/2000/svg">\
<path d="M7 10H25" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"/>\
<path d="M7 16H19" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"/>\
<path d="M7 22H21" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"/>\
<rect height="20" rx="3" stroke="currentColor" stroke-width="2" width="20" x="6" y="6"/>\
</svg>',
    download: '<svg fill="none" height="32" viewBox="0 0 32 32" width="32" xmlns="http://www.w3.org/2000/svg">\
<path d="M16 7V21" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"/>\
<path d="M11 16L16 21L21 16" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"/>\
<path d="M9 24H23" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"/>\
</svg>',
    wifi: '<svg fill="none" height="32" viewBox="0 0 32 32" width="32" xmlns="http://www.w3.org/2000/svg">\
<path d="M5 12.5C8.7 9.5 12.3 8 16 8s7.3 1.5 11 4.5" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"/>\
<path d="M9 17c2.1-1.7 4.1-2.5 7-2.5s4.9.8 7 2.5" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"/>\
<path d="M13.5 21.5c.9-.7 1.8-1 2.5-1s1.6.3 2.5 1" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"/>\
<circle cx="16" cy="24" fill="currentColor" r="2"/>\
</svg>'
  };

  function createIconSpan(iconKey) {
    const span = document.createElement('span');
    span.className = 'home-actions__icon';
    span.setAttribute('aria-hidden', 'true');
    const markup = ICON_MARKUP[String(iconKey).toLowerCase()];
    if (markup) {
      span.innerHTML = markup;
    }
    return span;
  }

  function createTextSpan(className, translations) {
    const span = document.createElement('span');
    span.className = className;
    if (translations && typeof translations === 'object') {
      if (translations.es) {
        span.dataset.i18nEs = translations.es;
      }
      if (translations.en) {
        span.dataset.i18nEn = translations.en;
      }
    }
    span.textContent = (translations && (translations.es || translations.en)) || '';
    return span;
  }

  function getSafeVariant(variant) {
    const base = String(variant || '').trim();
    if (!base) {
      return 'primary';
    }

    if (!/^[-a-zA-Z0-9_]+$/.test(base)) {
      return 'primary';
    }

    return base;
  }

  function applyLinkAttributes(link, action) {
    const classes = Array.isArray(action.classes) ? action.classes : [];
    classes.forEach(cls => {
      if (typeof cls === 'string' && cls.trim()) {
        link.classList.add(cls.trim());
      }
    });

    const soundId = typeof action.soundId === 'string' ? action.soundId.trim() : 'menu-cta';
    if (soundId) {
      link.dataset.soundId = soundId;
    }

    if (action.newTab) {
      link.target = '_blank';
      link.rel = action.rel || 'noopener';
    } else if (action.rel) {
      link.rel = String(action.rel);
    }
  }

  function createActionItem(action) {
    const item = document.createElement('li');
    item.className = 'home-actions__item';

    const link = document.createElement('a');
    const variant = getSafeVariant(action.variant);
    link.className = 'home-actions__link home-actions__link--' + variant;

    const href = typeof action.href === 'string' ? action.href.trim() : '';
    if (href) {
      link.href = href;
    } else {
      link.href = '#';
    }

    if (action.id) {
      link.dataset.homeActionId = String(action.id);
    }

    applyLinkAttributes(link, action);

    link.appendChild(createIconSpan(action.icon));

    const content = document.createElement('span');
    content.className = 'home-actions__content';

    content.appendChild(
      createTextSpan('home-actions__title', action.title)
    );

    content.appendChild(
      createTextSpan('home-actions__description', action.description)
    );

    link.appendChild(content);
    item.appendChild(link);
    return item;
  }

  function renderActions(actions) {
    if (!Array.isArray(actions) || actions.length === 0) {
      return;
    }

    const fragment = document.createDocumentFragment();
    actions.forEach(action => {
      fragment.appendChild(createActionItem(action));
    });

    list.innerHTML = '';
    list.appendChild(fragment);
    list.setAttribute('data-home-actions-loaded', 'true');

    if (window.GereniLang && typeof window.GereniLang.translateRoot === 'function') {
      window.GereniLang.translateRoot();
    }
  }

  function resolveWifi(payload, actions) {
    if (payload && typeof payload === 'object' && payload.wifi && typeof payload.wifi === 'object') {
      return payload.wifi;
    }
    if (Array.isArray(actions)) {
      const wifiAction = actions.find(item => item && item.id === 'connect-wifi');
      if (wifiAction && wifiAction.wifi && typeof wifiAction.wifi === 'object') {
        return wifiAction.wifi;
      }
    }
    return null;
  }

  function renderWifiDetails(wifiConfig) {
    if (!wifiSection) {
      return;
    }

    if (!wifiConfig || typeof wifiConfig !== 'object') {
      resetWifiQr();
      if (wifiElements.launchLink) {
        wifiElements.launchLink.hidden = !wifiElements.launchLink.href;
      }
      ensureWifiCopyHandler();
      return;
    }

    const instructionsValue = resolveLocalizedValue(wifiConfig.instructions);
    if (wifiElements.instructions) {
      setElementText(wifiElements.instructions, instructionsValue, wifiElements.instructions.textContent);
      applyTranslationsToElement(wifiElements.instructions, wifiConfig.instructions);
    }

    const ssidValue = resolveLocalizedValue(wifiConfig.ssid)
      || resolveLocalizedValue(wifiConfig.networkName)
      || resolveLocalizedValue(wifiConfig.network);
    const passwordValue = typeof wifiConfig.password === 'string' ? wifiConfig.password.trim() : '';
    const securityValue = typeof wifiConfig.security === 'string' ? wifiConfig.security.trim() : '';
    const lang = getCurrentLanguage();
    const labelMap = {
      es: { ssid: 'Red', password: 'Contraseña', security: 'Seguridad' },
      en: { ssid: 'Network', password: 'Password', security: 'Security' }
    };
    const labels = labelMap[lang] || labelMap.es;
    const copyLines = [];
    if (ssidValue) {
      copyLines.push(`${labels.ssid}: ${ssidValue}`);
    }
    if (passwordValue) {
      copyLines.push(`${labels.password}: ${passwordValue}`);
    }
    if (securityValue) {
      copyLines.push(`${labels.security}: ${securityValue}`);
    }
    const copyValue = copyLines.join('\n');

    if (wifiSection.dataset) {
      if (copyValue) {
        wifiSection.dataset.wifiCopy = copyValue;
      } else if (wifiFallbackCopy) {
        wifiSection.dataset.wifiCopy = wifiFallbackCopy;
      } else {
        delete wifiSection.dataset.wifiCopy;
      }
    }
    if (wifiElements.copyButton) {
      if (copyValue) {
        wifiElements.copyButton.hidden = false;
        wifiElements.copyButton.dataset.wifiCopy = copyValue;
      } else {
        wifiElements.copyButton.hidden = true;
        delete wifiElements.copyButton.dataset.wifiCopy;
      }
    }

    if (wifiElements.launchLink) {
      const portalUrl = typeof wifiConfig.portalUrl === 'string' ? wifiConfig.portalUrl.trim() : '';
      if (portalUrl) {
        wifiElements.launchLink.href = portalUrl;
        wifiElements.launchLink.hidden = false;
        applyTranslationsToElement(wifiElements.launchLink, wifiConfig.portalLabel);
        const portalLabel = resolveLocalizedValue(wifiConfig.portalLabel);
        setElementText(wifiElements.launchLink, portalLabel, wifiElements.launchLink.textContent);
      } else {
        wifiElements.launchLink.hidden = true;
        if (wifiFallbackPortalHref) {
          wifiElements.launchLink.href = wifiFallbackPortalHref;
        }
      }
    }

    renderWifiQr(ssidValue, passwordValue, securityValue);

    ensureWifiCopyHandler();
  }

  primeWifiDefaults();

  fetch(sourceUrl, { cache: 'no-cache' })
    .then(response => {
      if (!response.ok) {
        throw new Error('Failed to load home actions');
      }

      return response.json();
    })
    .then(payload => {
      const actions = resolveActions(payload);
      renderActions(actions);
      const wifiConfig = resolveWifi(payload, actions);
      renderWifiDetails(wifiConfig);
    })
    .catch(() => {
      renderWifiDetails(null);
      // Keep fallback markup if fetch fails
    });
})();

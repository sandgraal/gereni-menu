(function() {
  'use strict';

  const list = document.querySelector('[data-home-actions]');
  if (!list) {
    return;
  }

  const sourceUrl = list.getAttribute('data-home-actions-source') || 'data/home-actions.json';

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

  function createTextSpan(className, text, translations) {
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
    span.textContent = (translations && (translations.es || translations.en)) || text || '';
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
      if (!action.rel) {
        link.rel = 'noopener';
      }
    }

    if (action.rel) {
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
      createTextSpan('home-actions__title', '', action.title)
    );

    content.appendChild(
      createTextSpan('home-actions__description', '', action.description)
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
  }

  fetch(sourceUrl, { cache: 'no-store' })
    .then(response => {
      if (!response.ok) {
        throw new Error('Failed to load home actions');
      }

      return response.json();
    })
    .then(resolveActions)
    .then(renderActions)
    .catch(() => {
      // Keep fallback markup if fetch fails
    });
})();

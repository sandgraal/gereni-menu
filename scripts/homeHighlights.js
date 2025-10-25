(function() {
  const DATA_URL = 'data/home-highlights.json';
  const MESSAGE_COPY = {
    specials: {
      empty: {
        es: 'No hay especiales disponibles por ahora.',
        en: 'No specials available right now.'
      }
    },
    social: {
      empty: {
        es: 'Pronto compartiremos novedades desde nuestras redes.',
        en: 'We will share fresh updates from our social feeds soon.'
      }
    },
    error: {
      es: 'No se pudieron cargar las novedades. Intenta de nuevo más tarde.',
      en: 'Highlights could not be loaded. Please try again later.'
    },
    loading: {
      es: 'Cargando destacados…',
      en: 'Loading highlights…'
    },
    fallbackCta: {
      es: 'Ver detalles',
      en: 'View details'
    }
  };

  const sections = {
    specials: document.querySelector('[data-highlights-list="specials"]'),
    social: document.querySelector('[data-highlights-list="social"]')
  };

  const card = document.querySelector('[data-home-highlights]');
  if (!card || !sections.specials || !sections.social) {
    return;
  }

  let highlightData = null;
  let hasError = false;

  function getCurrentLang() {
    const langFromApi = window.GereniLang && typeof window.GereniLang.getCurrent === 'function'
      ? window.GereniLang.getCurrent()
      : null;
    if (langFromApi) return langFromApi;
    const docLang = document.documentElement.getAttribute('lang');
    return docLang === 'en' ? 'en' : 'es';
  }

  function createMessageItem(type, lang, listKey) {
    const item = document.createElement('li');
    item.className = `home-highlights__${type}`;
    let text;
    if (type === 'error') {
      text = MESSAGE_COPY.error[lang] || MESSAGE_COPY.error.es;
    } else if (type === 'empty') {
      text = MESSAGE_COPY[listKey].empty[lang] || MESSAGE_COPY[listKey].empty.es;
    } else {
      text = MESSAGE_COPY.loading[lang] || MESSAGE_COPY.loading.es;
    }
    item.textContent = text;
    return item;
  }

  function renderList(listKey, lang) {
    const listEl = sections[listKey];
    if (!listEl) return;
    listEl.innerHTML = '';

    if (hasError) {
      listEl.appendChild(createMessageItem('error', lang, listKey));
      return;
    }

    const entries = Array.isArray(highlightData?.[listKey === 'specials' ? 'specialMenus' : 'socialUpdates'])
      ? highlightData[listKey === 'specials' ? 'specialMenus' : 'socialUpdates']
      : [];

    if (!entries.length) {
      listEl.appendChild(createMessageItem('empty', lang, listKey));
      return;
    }

    entries.forEach(entry => {
      const title = entry?.title?.[lang] || entry?.title?.es || '';
      const description = entry?.description?.[lang] || entry?.description?.es || '';
      const url = typeof entry?.url === 'string' ? entry.url : '#';
      const cta = entry?.ctaLabel?.[lang] || entry?.ctaLabel?.es || MESSAGE_COPY.fallbackCta[lang] || MESSAGE_COPY.fallbackCta.es;
      const price = entry?.price;

      const item = document.createElement('li');
      item.className = 'home-highlights__item';

      const titleEl = document.createElement('div');
      titleEl.className = 'home-highlights__title';
      titleEl.textContent = title || cta;
      item.appendChild(titleEl);

      if (description) {
        const descriptionEl = document.createElement('p');
        descriptionEl.className = 'home-highlights__description';
        descriptionEl.textContent = description;
        item.appendChild(descriptionEl);
      }

      if (price) {
        const priceEl = document.createElement('span');
        priceEl.className = 'home-highlights__meta';
        priceEl.textContent = price;
        item.appendChild(priceEl);
      }

      if (url && url !== '#') {
        const linkEl = document.createElement('a');
        linkEl.className = 'home-highlights__link';
        linkEl.href = url;
        linkEl.rel = 'noopener';
        linkEl.target = '_blank';
        linkEl.textContent = cta;
        item.appendChild(linkEl);
      }

      listEl.appendChild(item);
    });
  }

  function renderAll(lang) {
    const targetLang = lang || getCurrentLang();
    renderList('specials', targetLang);
    renderList('social', targetLang);
  }

  function setLoadingState() {
    const lang = getCurrentLang();
    Object.keys(sections).forEach(key => {
      const listEl = sections[key];
      if (!listEl) return;
      listEl.innerHTML = '';
      listEl.appendChild(createMessageItem('loading', lang, key));
    });
  }

  async function loadHighlights() {
    setLoadingState();
    try {
      const response = await fetch(DATA_URL, { cache: 'no-store' });
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      const data = await response.json();
      highlightData = data;
      hasError = false;
    } catch (error) {
      console.error('Error loading home highlights', error);
      hasError = true;
    }
    renderAll();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', loadHighlights);
  } else {
    loadHighlights();
  }

  if (window.GereniLang && typeof window.GereniLang.subscribe === 'function') {
    window.GereniLang.subscribe(renderAll);
  } else {
    document.addEventListener('gereni:languagechange', event => {
      renderAll(event?.detail?.lang);
    });
  }
})();

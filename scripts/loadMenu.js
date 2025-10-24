(() => {
  const localeMap = {
    es: 'es-CR',
    en: 'en-US'
  };

  const updatedLabelStrings = {
    es: 'Actualizado el',
    en: 'Updated on'
  };

  const emptyStateMessages = {
    es: query => `No se encontraron platillos que coincidan con “${query}”.`,
    en: query => `No menu items match “${query}”.`
  };

  const emptyStateFallback = {
    es: 'No se encontraron platillos disponibles en este momento.',
    en: 'No menu items are available right now.'
  };

  const SEARCH_STORAGE_KEY = 'gereni-menu-search';

  const schemaConfig = {
    menuUrl: 'https://sandgraal.github.io/gereni-menu/menu.html',
    restaurantId: 'https://sandgraal.github.io/gereni-menu/#restaurant'
  };

  let menuData = null;
  let container = null;
  let updatedLabel = null;
  let searchInput = null;
  let clearButton = null;
  let emptyState = null;
  let searchQuery = '';
  let currentLang = 'es';

  function resolveText(entry, lang) {
    if (!entry || typeof entry !== 'object') return '';
    return entry[lang] || entry.es || entry.en || '';
  }

  function formatUpdatedAt(dateIso, lang) {
    if (!dateIso) return '';
    const parsed = new Date(dateIso);
    if (Number.isNaN(parsed.valueOf())) return '';
    const locale = localeMap[lang] || localeMap.es;
    return parsed.toLocaleDateString(locale, {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  function normalizeForSearch(value) {
    if (value === null || value === undefined) {
      return '';
    }
    try {
      return String(value)
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase();
    } catch (error) {
      return String(value).toLowerCase();
    }
  }

  function matchesQuery(item, normalizedQuery) {
    if (!item || typeof item !== 'object') {
      return false;
    }

    const texts = [];
    ['es', 'en'].forEach(lang => {
      const name = resolveText(item.name, lang);
      if (name) {
        texts.push(name);
      }
      const description = resolveText(item.description, lang);
      if (description) {
        texts.push(description);
      }
    });

    if (typeof item.price === 'string') {
      texts.push(item.price);
      const numericPrice = item.price.replace(/[^0-9]/g, '');
      if (numericPrice) {
        texts.push(numericPrice);
      }
    }

    return texts.some(text => normalizeForSearch(text).includes(normalizedQuery));
  }

  function getRenderableSections(data, query) {
    const sections = data && Array.isArray(data.sections) ? data.sections : [];
    if (sections.length === 0) {
      return sections;
    }

    if (typeof query !== 'string') {
      return sections;
    }

    const trimmed = query.trim();
    if (!trimmed) {
      return sections;
    }

    const normalizedQuery = normalizeForSearch(trimmed);
    if (!normalizedQuery) {
      return sections;
    }

    return sections
      .map(section => {
        if (!section || typeof section !== 'object') {
          return null;
        }
        const items = Array.isArray(section.items)
          ? section.items.filter(item => matchesQuery(item, normalizedQuery))
          : [];
        if (items.length === 0) {
          return null;
        }
        return { ...section, items };
      })
      .filter(Boolean);
  }

  function readStoredSearch() {
    try {
      if (window.sessionStorage) {
        const stored = window.sessionStorage.getItem(SEARCH_STORAGE_KEY);
        return typeof stored === 'string' ? stored : '';
      }
    } catch (error) {
      return '';
    }
    return '';
  }

  function writeStoredSearch(value) {
    try {
      if (window.sessionStorage) {
        if (value && value.trim()) {
          window.sessionStorage.setItem(SEARCH_STORAGE_KEY, value);
        } else {
          window.sessionStorage.removeItem(SEARCH_STORAGE_KEY);
        }
      }
    } catch (error) {
      // Ignorar intentos fallidos de acceso a sessionStorage (p. ej. en modo privado).
    }
  }

  function updateSearchClearVisibility() {
    if (!clearButton) {
      return;
    }
    const hasQuery = typeof searchQuery === 'string' && searchQuery.trim().length > 0;
    if (hasQuery) {
      clearButton.hidden = false;
    } else {
      clearButton.hidden = true;
    }
  }

  function updateEmptyState(hasResults, lang) {
    if (!emptyState) {
      return;
    }

    if (hasResults) {
      emptyState.hidden = true;
      emptyState.textContent = '';
      return;
    }

    const trimmed = typeof searchQuery === 'string' ? searchQuery.trim() : '';
    const messageBuilder = emptyStateMessages[lang] || emptyStateMessages.es;
    const fallbackMessage = emptyStateFallback[lang] || emptyStateFallback.es;
    emptyState.textContent = trimmed ? messageBuilder(trimmed) : fallbackMessage;
    emptyState.hidden = false;
  }

  function handleSearchInput(event) {
    const value = typeof event.target.value === 'string' ? event.target.value.slice(0, 160) : '';
    searchQuery = value;
    writeStoredSearch(searchQuery);
    updateSearchClearVisibility();
    renderMenu(currentLang);
  }

  function handleSearchClear() {
    searchQuery = '';
    writeStoredSearch(searchQuery);
    if (searchInput) {
      searchInput.value = '';
      searchInput.focus();
    }
    updateSearchClearVisibility();
    renderMenu(currentLang);
  }

  function sanitizePriceForSchema(price) {
    if (typeof price !== 'string') return null;
    const digits = price.replace(/[^0-9]/g, '');
    return digits.length > 0 ? digits : null;
  }

  function buildMenuItemSchema(item) {
    if (!item || typeof item !== 'object') return null;

    const nameEs = resolveText(item.name, 'es');
    const nameEn = resolveText(item.name, 'en');
    const descriptionEs = resolveText(item.description, 'es');
    const descriptionEn = resolveText(item.description, 'en');
    const priceValue = sanitizePriceForSchema(item.price);

    const baseName = nameEs || nameEn || '';
    if (!baseName) {
      return null;
    }

    const menuItem = {
      '@type': 'MenuItem',
      name: baseName
    };

    if (nameEn && nameEn !== baseName) {
      menuItem.alternateName = nameEn;
    }

    if (descriptionEs) {
      menuItem.description = descriptionEs;
    }

    if (descriptionEn && descriptionEn !== descriptionEs) {
      menuItem.disambiguatingDescription = descriptionEn;
    }

    if (item.image) {
      menuItem.image = item.image;
    }

    if (priceValue) {
      menuItem.offers = {
        '@type': 'Offer',
        price: priceValue,
        priceCurrency: 'CRC',
        availability: 'https://schema.org/InStock'
      };
    }

    return menuItem;
  }

  function buildMenuSchema(data) {
    if (!data || typeof data !== 'object') {
      return null;
    }

    const sections = Array.isArray(data.sections) ? data.sections : [];
    const schemaSections = sections
      .map(section => {
        if (!section || !Array.isArray(section.items) || section.items.length === 0) {
          return null;
        }

        const nameEs = resolveText(section.title, 'es');
        const nameEn = resolveText(section.title, 'en');
        const baseName = nameEs || nameEn || '';
        if (!baseName) {
          return null;
        }

        const items = section.items
          .map(buildMenuItemSchema)
          .filter(Boolean);

        if (items.length === 0) {
          return null;
        }

        const schemaSection = {
          '@type': 'MenuSection',
          name: baseName,
          hasMenuItem: items
        };

        if (nameEn && nameEn !== baseName) {
          schemaSection.alternateName = nameEn;
        }

        return schemaSection;
      })
      .filter(Boolean);

    const schema = {
      '@context': 'https://schema.org',
      '@type': 'Menu',
      '@id': `${schemaConfig.menuUrl}#menu`,
      name: 'Menú principal',
      inLanguage: 'es-CR',
      url: schemaConfig.menuUrl,
      isPartOf: {
        '@id': schemaConfig.restaurantId
      }
    };

    if (schemaSections.length > 0) {
      schema.hasMenuSection = schemaSections;
    }

    if (typeof data.updatedAt === 'string' && data.updatedAt.trim()) {
      schema.dateModified = data.updatedAt;
    }

    return schema;
  }

  function updateStructuredData(data) {
    const schemaElement = document.getElementById('menu-schema');
    if (!schemaElement) {
      return;
    }

    try {
      const schema = buildMenuSchema(data);
      if (!schema) {
        return;
      }
      schemaElement.textContent = JSON.stringify(schema, null, 2);
    } catch (error) {
      console.error('No se pudo actualizar los datos estructurados del menú:', error);
    }
  }

  function clearElement(el) {
    while (el.firstChild) {
      el.removeChild(el.firstChild);
    }
  }

  function createSectionTitle(section, primaryLang, secondaryLang) {
    const title = document.createElement('h2');
    title.classList.add('menu-section__title');

    const primaryText = resolveText(section.title, primaryLang);
    const fallback = resolveText(section.title, secondaryLang);
    const mainText = primaryText || fallback;

    const primarySpan = document.createElement('span');
    primarySpan.classList.add('menu-section__title-primary');
    primarySpan.textContent = mainText;
    title.appendChild(primarySpan);

    const secondaryText = secondaryLang && resolveText(section.title, secondaryLang);
    if (secondaryText && secondaryText !== mainText) {
      const secondarySpan = document.createElement('span');
      secondarySpan.classList.add('menu-section__title-secondary');
      secondarySpan.textContent = secondaryText;
      title.appendChild(secondarySpan);
    }

    return title;
  }

  function createDish(item, primaryLang, secondaryLang) {
    const dish = document.createElement('article');
    dish.classList.add('dish');

    let media = null;
    if (item.image) {
      media = document.createElement('figure');
      media.classList.add('dish-media');

      const img = document.createElement('img');
      img.src = item.image;
      img.alt = resolveText(item.name, primaryLang) || resolveText(item.name, secondaryLang) || '';
      img.loading = 'lazy';

      media.appendChild(img);
      dish.classList.add('dish--with-image');
      dish.appendChild(media);
    }

    const textWrapper = document.createElement('div');
    textWrapper.classList.add('dish-content');

    const header = document.createElement('div');
    header.classList.add('dish-header');

    const primaryName = resolveText(item.name, primaryLang);
    const fallbackName = resolveText(item.name, secondaryLang);
    const displayName = primaryName || fallbackName;

    const nameSpan = document.createElement('span');
    nameSpan.classList.add('dish-name');
    nameSpan.textContent = displayName;
    header.appendChild(nameSpan);

    if (item.price) {
      const leader = document.createElement('span');
      leader.classList.add('dish-leader');
      leader.setAttribute('aria-hidden', 'true');
      header.appendChild(leader);

      const priceSpan = document.createElement('span');
      priceSpan.classList.add('dish-price');
      priceSpan.textContent = item.price;
      header.appendChild(priceSpan);
    }

    textWrapper.appendChild(header);

    const secondaryName = secondaryLang && resolveText(item.name, secondaryLang);
    if (secondaryName && secondaryName !== displayName) {
      const secondaryNameSpan = document.createElement('span');
      secondaryNameSpan.classList.add('dish-name-alt');
      secondaryNameSpan.textContent = secondaryName;
      textWrapper.appendChild(secondaryNameSpan);
    }

    const primaryDescription = resolveText(item.description, primaryLang);
    const fallbackDescription = resolveText(item.description, secondaryLang);
    const descriptionText = primaryDescription || fallbackDescription;

    if (descriptionText) {
      const desc = document.createElement('p');
      desc.classList.add('dish-description');
      desc.textContent = descriptionText;
      textWrapper.appendChild(desc);
    }

    if (secondaryLang) {
      const secondaryDescription = resolveText(item.description, secondaryLang);
      if (secondaryDescription && secondaryDescription !== descriptionText) {
        const descAlt = document.createElement('p');
        descAlt.classList.add('dish-description', 'dish-description--alt');
        descAlt.textContent = secondaryDescription;
        textWrapper.appendChild(descAlt);
      }
    }

    dish.appendChild(textWrapper);
    return dish;
  }

  function renderMenu(lang) {
    if (!container || !menuData) return;

    updateSearchClearVisibility();

    const sections = getRenderableSections(menuData, searchQuery);
    const hasResults = sections.some(section => Array.isArray(section.items) && section.items.length > 0);

    updateEmptyState(hasResults, lang);

    clearElement(container);

    if (hasResults) {
      container.hidden = false;
      const columns = [
        document.createElement('div'),
        document.createElement('div')
      ];
      columns[0].classList.add('menu-column', 'menu-column--left');
      columns[1].classList.add('menu-column', 'menu-column--right');

      const splitIndex = Math.ceil(sections.length / 2);
      const secondaryLang = lang === 'es' ? 'en' : 'es';

      sections.forEach((section, sectionIndex) => {
        const sectionEl = document.createElement('section');
        sectionEl.classList.add('menu-section');
        sectionEl.appendChild(createSectionTitle(section, lang, secondaryLang));

        (section.items || []).forEach(item => {
          const dish = createDish(item, lang, secondaryLang);
          sectionEl.appendChild(dish);
        });

        const columnIndex = sectionIndex < splitIndex ? 0 : 1;
        columns[columnIndex].appendChild(sectionEl);
      });

      columns.forEach(col => container.appendChild(col));
    } else {
      container.hidden = true;
    }

    if (!updatedLabel) {
      updatedLabel = document.getElementById('menu-updated');
    }

    if (updatedLabel) {
      const formattedDate = formatUpdatedAt(menuData.updatedAt, lang);
      if (formattedDate) {
        const prefix = updatedLabelStrings[lang] || updatedLabelStrings.es;
        updatedLabel.textContent = `${prefix} ${formattedDate}`;
        updatedLabel.hidden = false;
      } else {
        updatedLabel.hidden = true;
      }
    }

    updateStructuredData(menuData);
  }

  function handleLanguageChange(lang) {
    currentLang = lang || currentLang;
    renderMenu(currentLang);
  }

  function init() {
    container = document.getElementById('menu-container');
    if (!container) {
      console.error('No se encontró el contenedor del menú.');
      return;
    }

    searchInput = document.getElementById('menu-search-input');
    clearButton = document.querySelector('.menu-search__clear');
    emptyState = document.getElementById('menu-empty');

    searchQuery = readStoredSearch().slice(0, 160);

    if (searchInput) {
      if (searchQuery) {
        searchInput.value = searchQuery;
      }
      searchInput.addEventListener('input', handleSearchInput);
      searchInput.addEventListener('search', handleSearchInput);
    }

    if (clearButton) {
      clearButton.addEventListener('click', handleSearchClear);
    }

    updateSearchClearVisibility();

    const initialLang = window.GereniLang && typeof window.GereniLang.getCurrent === 'function'
      ? window.GereniLang.getCurrent()
      : 'es';
    currentLang = initialLang;

    fetch('data/menu.json')
      .then(response => response.json())
      .then(data => {
        menuData = data;
        renderMenu(currentLang);

        if (window.GereniLang && typeof window.GereniLang.subscribe === 'function') {
          window.GereniLang.subscribe(handleLanguageChange);
        } else {
          document.addEventListener('gereni:languagechange', event => {
            handleLanguageChange(event.detail && event.detail.lang);
          });
        }
      })
      .catch(err => console.error('Error al cargar el menú:', err));
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();

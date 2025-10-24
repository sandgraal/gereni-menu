(() => {
  const localeMap = {
    es: 'es-CR',
    en: 'en-US'
  };

  const updatedLabelStrings = {
    es: 'Actualizado el',
    en: 'Updated on'
  };

  const schemaConfig = {
    menuUrl: 'https://sandgraal.github.io/gereni-menu/menu.html',
    restaurantId: 'https://sandgraal.github.io/gereni-menu/#restaurant'
  };

  let menuData = null;
  let container = null;
  let updatedLabel = null;
  let currentLang = 'es';
  let searchInput = null;
  let searchStatus = null;
  let emptyState = null;
  let currentFilter = '';

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

  function normalizeSearchValue(value) {
    if (typeof value !== 'string') {
      return '';
    }
    return value
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase();
  }

  function collectEntryTexts(entry, list) {
    if (!entry) {
      return;
    }
    if (Array.isArray(entry)) {
      entry.forEach(value => collectEntryTexts(value, list));
      return;
    }
    if (typeof entry === 'string') {
      const trimmed = entry.trim();
      if (trimmed) {
        list.push(trimmed);
      }
      return;
    }
    if (typeof entry === 'object') {
      Object.values(entry).forEach(value => collectEntryTexts(value, list));
    }
  }

  function entryMatchesQuery(entry, normalizedQuery) {
    if (!normalizedQuery) {
      return false;
    }
    const texts = [];
    collectEntryTexts(entry, texts);
    return texts.some(text => normalizeSearchValue(text).includes(normalizedQuery));
  }

  function itemMatchesQuery(item, normalizedQuery) {
    if (!item || typeof item !== 'object' || !normalizedQuery) {
      return false;
    }
    const texts = [];
    collectEntryTexts(item.name, texts);
    collectEntryTexts(item.description, texts);
    return texts.some(text => normalizeSearchValue(text).includes(normalizedQuery));
  }

  function filterSectionsByQuery(sections, query) {
    const trimmed = typeof query === 'string' ? query.trim() : '';
    if (!trimmed) {
      return sections;
    }

    const normalizedQuery = normalizeSearchValue(trimmed);
    if (!normalizedQuery) {
      return sections;
    }

    return sections
      .map(section => {
        if (!section || !Array.isArray(section.items)) {
          return null;
        }

        const sectionMatches = entryMatchesQuery(section.title, normalizedQuery);
        const filteredItems = sectionMatches
          ? section.items.slice()
          : section.items.filter(item => itemMatchesQuery(item, normalizedQuery));

        if (filteredItems.length === 0) {
          return null;
        }

        return {
          ...section,
          items: filteredItems
        };
      })
      .filter(Boolean);
  }

  function getDatasetMessage(element, prefix, lang) {
    if (!element) {
      return '';
    }
    const suffix = lang === 'en' ? 'En' : 'Es';
    const key = `${prefix}${suffix}`;
    return element.dataset[key] || '';
  }

  function formatStatusMessage(template, matchCount, totalCount) {
    if (!template) {
      return '';
    }
    return template
      .replace(/\{count\}/g, String(matchCount))
      .replace(/\{total\}/g, String(totalCount));
  }

  function setSearchLoading(lang) {
    if (!searchStatus) {
      return;
    }
    const template = getDatasetMessage(searchStatus, 'statusLoading', lang);
    if (template) {
      searchStatus.textContent = formatStatusMessage(template, 0, 0);
    }
  }

  function updateSearchStatus(lang, matchCount, totalCount) {
    if (!searchStatus) {
      return;
    }

    const activeFilter = typeof currentFilter === 'string' ? currentFilter.trim() : '';
    let template;

    if (!menuData) {
      template = getDatasetMessage(searchStatus, 'statusLoading', lang);
    } else if (!activeFilter) {
      template = getDatasetMessage(searchStatus, 'statusAll', lang);
    } else if (matchCount === 0) {
      template = getDatasetMessage(searchStatus, 'statusEmpty', lang);
    } else {
      template = getDatasetMessage(searchStatus, 'statusCount', lang);
    }

    const message = formatStatusMessage(template, matchCount, totalCount);
    searchStatus.textContent = message || '';
  }

  function updateEmptyState(lang, shouldShow) {
    if (!emptyState) {
      return;
    }

    if (!shouldShow) {
      emptyState.hidden = true;
      emptyState.textContent = '';
      return;
    }

    const message = getDatasetMessage(emptyState, 'empty', lang);
    emptyState.textContent = message || '';
    emptyState.hidden = false;
  }

  function handleSearchInput(event) {
    const value = event.target ? event.target.value : '';
    const sanitized = typeof value === 'string' ? value.replace(/\s+/g, ' ').trim() : '';
    if (sanitized === currentFilter) {
      if (menuData) {
        renderMenu(currentLang);
      }
      return;
    }
    currentFilter = sanitized;
    if (menuData) {
      renderMenu(currentLang);
    }
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
    clearElement(container);

    const sections = Array.isArray(menuData.sections) ? menuData.sections : [];
    const filteredSections = filterSectionsByQuery(sections, currentFilter);
    const totalItems = sections.reduce((acc, section) => {
      if (!section || !Array.isArray(section.items)) {
        return acc;
      }
      return acc + section.items.length;
    }, 0);
    const matchedItems = filteredSections.reduce((acc, section) => {
      if (!section || !Array.isArray(section.items)) {
        return acc;
      }
      return acc + section.items.length;
    }, 0);

    updateSearchStatus(lang, matchedItems, totalItems);
    updateEmptyState(lang, filteredSections.length === 0);

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

    if (filteredSections.length === 0) {
      updateStructuredData(menuData);
      return;
    }

    const columns = [
      document.createElement('div'),
      document.createElement('div')
    ];
    columns[0].classList.add('menu-column', 'menu-column--left');
    columns[1].classList.add('menu-column', 'menu-column--right');

    const splitIndex = Math.ceil(filteredSections.length / 2);
    const secondaryLang = lang === 'es' ? 'en' : 'es';

    filteredSections.forEach((section, sectionIndex) => {
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

    updateStructuredData(menuData);
  }

  function handleLanguageChange(lang) {
    currentLang = lang || currentLang;
    if (menuData) {
      renderMenu(currentLang);
    } else {
      setSearchLoading(currentLang);
    }
  }

  function init() {
    container = document.getElementById('menu-container');
    if (!container) {
      console.error('No se encontró el contenedor del menú.');
      return;
    }

    searchInput = document.getElementById('menu-search-input');
    searchStatus = document.getElementById('menu-search-status');
    emptyState = document.getElementById('menu-empty-state');

    if (searchInput) {
      searchInput.addEventListener('input', handleSearchInput);
      searchInput.addEventListener('search', handleSearchInput);
    }

    const initialLang = window.GereniLang && typeof window.GereniLang.getCurrent === 'function'
      ? window.GereniLang.getCurrent()
      : 'es';
    currentLang = initialLang;

    setSearchLoading(currentLang);

    fetch('data/menu.json')
      .then(response => response.json())
      .then(data => {
        menuData = data;
        if (searchInput) {
          searchInput.removeAttribute('disabled');
        }
        renderMenu(currentLang);

        if (window.GereniLang && typeof window.GereniLang.subscribe === 'function') {
          window.GereniLang.subscribe(handleLanguageChange);
        } else {
          document.addEventListener('gereni:languagechange', event => {
            handleLanguageChange(event.detail && event.detail.lang);
          });
        }
      })
      .catch(err => {
        console.error('Error al cargar el menú:', err);
        const errorMessage = getDatasetMessage(searchStatus, 'statusError', currentLang);
        if (errorMessage) {
          searchStatus.textContent = errorMessage;
        }
        updateEmptyState(currentLang, false);
      });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();

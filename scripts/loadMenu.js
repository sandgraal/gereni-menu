(() => {
  const localeMap = {
    es: 'es-CR',
    en: 'en-US'
  };

  const updatedLabelStrings = {
    es: 'Actualizado el',
    en: 'Updated on'
  };

  let menuData = null;
  let container = null;
  let updatedLabel = null;
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

  function clearElement(el) {
    while (el.firstChild) {
      el.removeChild(el.firstChild);
    }
  }

  function renderMenu(lang) {
    if (!container || !menuData) return;
    clearElement(container);

    const sections = Array.isArray(menuData.sections) ? menuData.sections : [];
    sections.forEach(section => {
      const sectionEl = document.createElement('section');
      const title = document.createElement('h2');
      title.textContent = resolveText(section.title, lang);
      sectionEl.appendChild(title);

      (section.items || []).forEach(item => {
        const dish = document.createElement('div');
        dish.classList.add('dish');

        const nameSpan = document.createElement('span');
        nameSpan.classList.add('dish-name');
        nameSpan.textContent = resolveText(item.name, lang);

        const priceSpan = document.createElement('span');
        priceSpan.classList.add('dish-price');
        priceSpan.textContent = item.price;

        dish.appendChild(nameSpan);
        dish.appendChild(priceSpan);
        sectionEl.appendChild(dish);

        const descriptionText = resolveText(item.description, lang);
        if (descriptionText) {
          const desc = document.createElement('div');
          desc.classList.add('description');
          desc.textContent = descriptionText;
          sectionEl.appendChild(desc);
        }
      });

      container.appendChild(sectionEl);
    });

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

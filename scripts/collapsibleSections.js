(() => {
  const STORAGE_KEY = 'gereni-menu-collapsed';
  // Mirror the main menu layout breakpoint to collapse sections on small screens.
  const MOBILE_COLLAPSE_QUERY = '(max-width: 720px)';
  const enhancedSections = new WeakSet();
  let storedState = readStoredState();
  let autoId = 0;

  const mobileQuery = typeof window !== 'undefined' && typeof window.matchMedia === 'function'
    ? window.matchMedia(MOBILE_COLLAPSE_QUERY)
    : null;

  function shouldCollapseByDefault() {
    return Boolean(mobileQuery?.matches);
  }

  function readStoredState() {
    try {
      const raw = window.localStorage ? window.localStorage.getItem(STORAGE_KEY) : null;
      if (!raw) {
        return {};
      }
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === 'object') {
        return parsed;
      }
    } catch (error) {
      console.warn('No se pudo leer el estado de secciones plegables:', error);
    }
    return {};
  }

  function writeStoredState() {
    try {
      if (window.localStorage) {
        const cleaned = Object.fromEntries(
          Object.entries(storedState).filter(([, value]) => value === 'collapsed')
        );
        if (Object.keys(cleaned).length === 0) {
          window.localStorage.removeItem(STORAGE_KEY);
        } else {
          window.localStorage.setItem(STORAGE_KEY, JSON.stringify(cleaned));
        }
      }
    } catch (error) {
      console.warn('No se pudo guardar el estado de secciones plegables:', error);
    }
  }

  function slugify(value) {
    if (!value) {
      return '';
    }
    return String(value)
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  }

  function getSectionId(section) {
    if (!section) {
      return '';
    }
    const existing = section.getAttribute('data-section-id');
    if (existing) {
      return existing;
    }
    const primary = section.querySelector('.menu-section__title-primary');
    const secondary = section.querySelector('.menu-section__title-secondary');
    const text = primary?.textContent || secondary?.textContent || '';
    const slug = slugify(text);
    if (slug) {
      section.setAttribute('data-section-id', slug);
    }
    return slug;
  }

  function getContentId(section, content, sectionId) {
    if (!content) {
      return '';
    }
    if (content.id) {
      return content.id;
    }
    const base = sectionId || `untitled-${++autoId}`;
    const id = `menu-section-content-${base}`;
    content.id = id;
    return id;
  }

  function ensureToggle(section) {
    const title = section.querySelector('.menu-section__title');
    if (!title) {
      return null;
    }

    let toggle = title.querySelector('.menu-section__toggle');
    if (toggle) {
      return toggle;
    }

    toggle = document.createElement('button');
    toggle.type = 'button';
    toggle.classList.add('menu-section__toggle');

    const label = document.createElement('span');
    label.classList.add('menu-section__label');

    while (title.firstChild) {
      label.appendChild(title.firstChild);
    }

    const chevron = document.createElement('span');
    chevron.classList.add('menu-section__chevron');
    chevron.setAttribute('aria-hidden', 'true');
    chevron.innerHTML =
      '<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" focusable="false" aria-hidden="true"><path d="M5.47 8.47a.75.75 0 0 1 1.06 0L12 13.94l5.47-5.47a.75.75 0 0 1 1.06 1.06l-6 6a.75.75 0 0 1-1.06 0l-6-6a.75.75 0 0 1 0-1.06Z" fill="currentColor"/></svg>';

    toggle.appendChild(label);
    toggle.appendChild(chevron);
    title.appendChild(toggle);

    return toggle;
  }

  function ensureContentWrapper(section) {
    let content = section.querySelector('.menu-section__content');
    if (content) {
      if (!content.hasAttribute('aria-hidden')) {
        content.setAttribute('aria-hidden', 'false');
      }
      return content;
    }

    content = document.createElement('div');
    content.classList.add('menu-section__content');

    const title = section.querySelector('.menu-section__title');
    let sibling = title ? title.nextSibling : null;
    while (sibling) {
      const next = sibling.nextSibling;
      content.appendChild(sibling);
      sibling = next;
    }

    section.appendChild(content);
    content.setAttribute('aria-hidden', 'false');
    return content;
  }

  function applyState(section, expanded) {
    const toggle = section.querySelector('.menu-section__toggle');
    const content = section.querySelector('.menu-section__content');
    section.classList.toggle('is-collapsed', !expanded);
    section.setAttribute('data-collapsed', expanded ? 'false' : 'true');
    if (toggle) {
      toggle.setAttribute('aria-expanded', expanded ? 'true' : 'false');
    }
    if (content) {
      content.setAttribute('aria-hidden', expanded ? 'false' : 'true');
    }
  }

  function updateStoredState(sectionId, expanded) {
    if (!sectionId) {
      return;
    }
    storedState[sectionId] = expanded ? 'expanded' : 'collapsed';
    writeStoredState();
  }

  function enhanceSection(section) {
    if (!section || enhancedSections.has(section)) {
      return;
    }

    const toggle = ensureToggle(section);
    const content = ensureContentWrapper(section);
    if (!toggle || !content) {
      return;
    }

    const sectionId = getSectionId(section);
    const contentId = getContentId(section, content, sectionId);
    toggle.setAttribute('aria-controls', contentId);

    const storedValue = sectionId ? storedState[sectionId] : undefined;
    const collapsedPreference = storedValue === 'collapsed';
    const expandedPreference = storedValue === 'expanded';
    let expanded = true;

    if (collapsedPreference) {
      expanded = false;
    } else if (expandedPreference) {
      expanded = true;
    } else {
      expanded = !shouldCollapseByDefault();
    }

    applyState(section, expanded);

    toggle.addEventListener('click', () => {
      const isExpanded = toggle.getAttribute('aria-expanded') !== 'false';
      const nextState = !isExpanded;
      applyState(section, nextState);
      updateStoredState(sectionId, nextState);
    });

    enhancedSections.add(section);
  }

  function enhanceAllSections(root) {
    if (!root) {
      return;
    }
    const sections = root.querySelectorAll('.menu-section');
    sections.forEach(section => enhanceSection(section));
  }

  function handleMenuRendered() {
    autoId = 0;
    const root = document.getElementById('menu-container');
    enhanceAllSections(root);
  }

  function init() {
    handleMenuRendered();
    document.addEventListener('gereni:menuRendered', handleMenuRendered);
    window.addEventListener('storage', event => {
      if (event && event.key === STORAGE_KEY) {
        storedState = readStoredState();
        handleMenuRendered();
      }
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();

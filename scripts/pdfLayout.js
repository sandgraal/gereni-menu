(() => {
  const state = {
    root: null,
    prepared: false,
    options: null
  };

  const DEFAULT_PAGE_HEIGHT_IN = 10.75;
  const DEFAULT_PAGE_WIDTH_IN = 8.5;

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

  function getContainer() {
    return document.getElementById('menu-container');
  }

  function isReady(expectedLang) {
    const container = getContainer();
    if (!container || container.hidden) {
      return false;
    }
    const sections = container.querySelectorAll('.menu-section');
    if (sections.length === 0) {
      return false;
    }
    if (expectedLang) {
      const renderedLang = container.getAttribute('data-rendered-lang');
      if (renderedLang !== expectedLang) {
        return false;
      }
    }
    return true;
  }

  function ensureRoot(container) {
    if (state.root && state.root.isConnected) {
      return state.root;
    }
    const root = document.createElement('div');
    root.classList.add('pdf-document');
    container.parentNode.insertBefore(root, container.nextSibling);
    state.root = root;
    return root;
  }

  function createPageShell() {
    const page = document.createElement('section');
    page.classList.add('pdf-page');
    const content = document.createElement('div');
    content.classList.add('pdf-page__content');
    page.appendChild(content);
    return { page, content, sections: [] };
  }

  function measureContentHeight(root, options) {
    const measurement = createPageShell();
    measurement.page.classList.add('pdf-page--measure');
    measurement.page.style.visibility = 'hidden';
    measurement.page.style.position = 'absolute';
    measurement.page.style.pointerEvents = 'none';
    if (options && options.pageWidth) {
      measurement.page.style.setProperty('--pdf-page-width', `${options.pageWidth}`);
    }
    if (options && options.pageHeight) {
      measurement.page.style.setProperty('--pdf-page-height', `${options.pageHeight}`);
    }
    root.appendChild(measurement.page);
    let height = measurement.content.getBoundingClientRect().height;
    if (!Number.isFinite(height) || height <= 0) {
      const raw = options && options.pageHeight ? String(options.pageHeight) : `${DEFAULT_PAGE_HEIGHT_IN}in`;
      const numeric = parseFloat(raw) || DEFAULT_PAGE_HEIGHT_IN;
      height = numeric * 96;
    }
    root.removeChild(measurement.page);
    return height;
  }

  function collectSections(container) {
    return Array.from(container.querySelectorAll('.menu-section'))
      .map(section => {
        const primaryTitle = section.querySelector('.menu-section__title-primary');
        const fallbackTitle = section.querySelector('h2');
        const slugSource = primaryTitle ? primaryTitle.textContent : (fallbackTitle ? fallbackTitle.textContent : '');
        const slug = slugify(slugSource);
        if (!slug) {
          return null;
        }
        const clone = section.cloneNode(true);
        clone.classList.add('pdf-page__section');
        return { slug, clone };
      })
      .filter(Boolean);
  }

  function pickPhotos(slug, availablePhotos, fallbackPhotos) {
    const pool = Array.isArray(availablePhotos) ? availablePhotos : [];
    const matches = pool.filter(photoPath => {
      const fileName = photoPath.split('/').pop() || '';
      const base = fileName.replace(/\.[^.]+$/, '');
      const normalized = slugify(base);
      return normalized.startsWith(`${slug}-`) || normalized === slug;
    });

    if (matches.length > 0) {
      return matches.slice(0, 3);
    }

    const fallbacks = Array.isArray(fallbackPhotos) ? fallbackPhotos : [];
    return fallbacks.slice(0, 3);
  }

  function createHighlight(photos) {
    if (!photos || photos.length === 0) {
      return null;
    }
    const wrapper = document.createElement('div');
    wrapper.classList.add('pdf-highlight');

    const title = document.createElement('p');
    title.classList.add('pdf-highlight__title');
    title.textContent = 'Momentos destacados';
    wrapper.appendChild(title);

    const list = document.createElement('div');
    list.classList.add('pdf-highlight__images');
    photos.slice(0, 3).forEach(src => {
      const figure = document.createElement('figure');
      figure.classList.add('pdf-highlight__figure');
      const img = document.createElement('img');
      img.classList.add('pdf-highlight__image');
      img.src = src;
      img.alt = '';
      img.loading = 'lazy';
      figure.appendChild(img);
      list.appendChild(figure);
    });
    wrapper.appendChild(list);
    return wrapper;
  }

  function applyHighlight(page, slug, options) {
    const photos = pickPhotos(slug, options?.availablePhotos, options?.fallbackPhotos);
    if (!photos || photos.length === 0) {
      return;
    }
    const highlight = createHighlight(photos);
    if (!highlight) {
      return;
    }
    page.page.classList.add('pdf-page--highlight');
    page.page.appendChild(highlight);
  }

  function prepare(options = {}) {
    const container = getContainer();
    if (!container) {
      return false;
    }
    if (!isReady(options.expectedLang)) {
      return false;
    }

    reset();

    const sections = collectSections(container);
    if (sections.length === 0) {
      return false;
    }

    const root = ensureRoot(container);
    root.innerHTML = '';

    const normalizedOptions = {
      pageWidth: options.pageWidth || `${DEFAULT_PAGE_WIDTH_IN}in`,
      pageHeight: options.pageHeight || `${DEFAULT_PAGE_HEIGHT_IN}in`,
      availablePhotos: Array.isArray(options.availablePhotos) ? options.availablePhotos : [],
      fallbackPhotos: Array.isArray(options.fallbackPhotos) ? options.fallbackPhotos : [],
      expectedLang: options.expectedLang || null
    };

    const maxContentHeight = measureContentHeight(root, normalizedOptions);

    const pages = [];
    let current = createPageShell();

    const applyDimensions = (page) => {
      page.page.style.setProperty('--pdf-page-width', normalizedOptions.pageWidth);
      page.page.style.setProperty('--pdf-page-height', normalizedOptions.pageHeight);
    };
    applyDimensions(current);

    pages.push(current);

    sections.forEach(({ slug, clone }, index) => {
      clone.setAttribute('data-pdf-slug', slug);
      current.content.appendChild(clone);
      const contentHeight = current.content.scrollHeight;
      const shouldMoveToNext = contentHeight > maxContentHeight + 2 && current.content.children.length > 1;
      if (shouldMoveToNext) {
        current.content.removeChild(clone);
        current = createPageShell();
        applyDimensions(current);
        pages.push(current);
        current.content.appendChild(clone);
      }
      current.sections.push({ slug });
    });

    // Clean root and append pages with optional highlight decoration.
    root.innerHTML = '';
    pages.forEach(page => {
      if (page.sections.length === 1) {
        applyHighlight(page, page.sections[0].slug, normalizedOptions);
      }
      root.appendChild(page.page);
    });

    document.body.classList.add('pdf-mode');
    state.prepared = true;
    state.options = normalizedOptions;
    return true;
  }

  function reset() {
    if (state.prepared && state.root && state.root.isConnected) {
      state.root.innerHTML = '';
    }
    document.body.classList.remove('pdf-mode');
    state.prepared = false;
  }

  window.GereniPdfLayout = {
    prepare,
    reset,
    isReady
  };
})();

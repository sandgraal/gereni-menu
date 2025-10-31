(function() {
  const IMAGE_SELECTOR = '.menu-page .dish-media img';
  const PROCESSED_ATTR = 'data-lightbox-bound';
  const ACTIVE_ATTR = 'data-active';
  const BODY_LOCK_ATTR = 'data-image-lightbox-open';
  const LIGHTBOX_ID = 'menu-image-lightbox';

  let lightbox = null;
  let lightboxImage = null;
  let closeButton = null;
  let lastActiveElement = null;

  function handleGlobalKeydown(event) {
    if (event.key === 'Escape') {
      closeLightbox();
    }
  }

  function ensureLightbox() {
    if (lightbox) {
      return lightbox;
    }

    lightbox = document.createElement('div');
    lightbox.id = LIGHTBOX_ID;
    lightbox.className = 'menu-image-lightbox';
    lightbox.setAttribute('role', 'dialog');
    lightbox.setAttribute('aria-modal', 'true');
    lightbox.setAttribute('aria-hidden', 'true');
    lightbox.setAttribute('aria-label', 'Imagen ampliada');
    lightbox.dataset.i18nAttr = 'aria-label';
    lightbox.dataset.i18nEs = 'Imagen ampliada';
    lightbox.dataset.i18nEn = 'Enlarged image';

    const content = document.createElement('div');
    content.className = 'menu-image-lightbox__content';

    closeButton = document.createElement('button');
    closeButton.type = 'button';
    closeButton.className = 'menu-image-lightbox__close';
    closeButton.setAttribute('aria-label', 'Cerrar imagen');
    closeButton.dataset.i18nAttr = 'aria-label';
    closeButton.dataset.i18nEs = 'Cerrar imagen';
    closeButton.dataset.i18nEn = 'Close image';
    closeButton.innerHTML = '<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false"><path d="M18 6 6 18M6 6l12 12" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"/></svg>';
    closeButton.addEventListener('click', closeLightbox);

    lightboxImage = document.createElement('img');
    lightboxImage.className = 'menu-image-lightbox__image';
    lightboxImage.alt = '';
    lightboxImage.decoding = 'async';

    content.appendChild(closeButton);
    content.appendChild(lightboxImage);
    lightbox.appendChild(content);

    lightbox.addEventListener('click', event => {
      if (event.target === lightbox) {
        closeLightbox();
      }
    });

    document.body.appendChild(lightbox);

    if (window.GereniLang && typeof window.GereniLang.translateRoot === 'function') {
      window.GereniLang.translateRoot();
    }

    return lightbox;
  }

  function openLightbox(image) {
    if (!image) {
      return;
    }

    const currentLightbox = ensureLightbox();
    const source = image.dataset.fullImage || image.currentSrc || image.src;
    lightboxImage.src = source;
    lightboxImage.alt = image.alt || '';

    lastActiveElement = document.activeElement instanceof HTMLElement ? document.activeElement : null;

    currentLightbox.setAttribute(ACTIVE_ATTR, 'true');
    currentLightbox.setAttribute('aria-hidden', 'false');
    document.body.setAttribute(BODY_LOCK_ATTR, 'true');

    requestAnimationFrame(() => {
      if (closeButton) {
        closeButton.focus({ preventScroll: true });
      }
    });

    document.addEventListener('keydown', handleGlobalKeydown);
  }

  function closeLightbox() {
    if (!lightbox) {
      return;
    }

    lightbox.removeAttribute(ACTIVE_ATTR);
    lightbox.setAttribute('aria-hidden', 'true');
    document.body.removeAttribute(BODY_LOCK_ATTR);

    if (lightboxImage) {
      lightboxImage.src = '';
      lightboxImage.alt = '';
    }

    document.removeEventListener('keydown', handleGlobalKeydown);

    if (lastActiveElement && typeof lastActiveElement.focus === 'function') {
      lastActiveElement.focus({ preventScroll: true });
    }

    lastActiveElement = null;
  }

  function handleImageClick(event) {
    const target = event.target.closest(IMAGE_SELECTOR);
    if (!target) {
      return;
    }
    event.preventDefault();
    openLightbox(target);
  }

  function enhanceImage(img) {
    if (!img || img.hasAttribute(PROCESSED_ATTR)) {
      return;
    }

    img.setAttribute(PROCESSED_ATTR, 'true');
    img.setAttribute('tabindex', '0');
    img.setAttribute('role', 'button');

    img.addEventListener('keydown', event => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        openLightbox(img);
      }
    });
  }

  function enhanceAllImages() {
    const images = document.querySelectorAll(IMAGE_SELECTOR);
    images.forEach(enhanceImage);
  }

  function observeMenu(root) {
    if (!root || typeof MutationObserver !== 'function') {
      return;
    }

    const observer = new MutationObserver(() => {
      enhanceAllImages();
    });

    observer.observe(root, { childList: true, subtree: true });
  }

  function init() {
    const menuRoot = document.querySelector('[data-menu-root]');
    if (menuRoot) {
      menuRoot.addEventListener('click', handleImageClick);
      observeMenu(menuRoot);
    }
    enhanceAllImages();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();

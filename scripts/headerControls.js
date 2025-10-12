(() => {
  const DROPDOWN_SELECTOR = '[data-controls-dropdown]';
  let openDropdown = null;

  function getElements(container) {
    return {
      trigger: container.querySelector('[data-controls-toggle]'),
      panel: container.querySelector('[data-controls-menu]')
    };
  }

  function focusFirstInteractive(panel) {
    const focusable = panel.querySelector(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    if (focusable) {
      focusable.focus();
    }
  }

  function setExpanded(container, expanded) {
    const { trigger, panel } = getElements(container);
    if (!trigger || !panel) return;

    if (expanded) {
      if (openDropdown && openDropdown !== container) {
        setExpanded(openDropdown, false);
      }
      panel.removeAttribute('hidden');
      trigger.setAttribute('aria-expanded', 'true');
      container.classList.add('is-open');
      openDropdown = container;
    } else {
      panel.setAttribute('hidden', '');
      trigger.setAttribute('aria-expanded', 'false');
      container.classList.remove('is-open');
      if (openDropdown === container) {
        openDropdown = null;
      }
    }
  }

  function toggle(container) {
    const { trigger } = getElements(container);
    if (!trigger) return;
    const isExpanded = trigger.getAttribute('aria-expanded') === 'true';
    setExpanded(container, !isExpanded);
    if (!isExpanded) {
      const { panel } = getElements(container);
      if (panel) {
        focusFirstInteractive(panel);
      }
    }
  }

  function handleDocumentClick(event) {
    if (!openDropdown) return;
    if (!openDropdown.contains(event.target)) {
      setExpanded(openDropdown, false);
    }
  }

  function handleFocusIn(event) {
    if (!openDropdown) return;
    if (!openDropdown.contains(event.target)) {
      setExpanded(openDropdown, false);
    }
  }

  function handleDocumentKeydown(event) {
    if (event.key !== 'Escape' || !openDropdown) return;
    const container = openDropdown;
    setExpanded(container, false);
    const { trigger } = getElements(container);
    if (trigger) {
      trigger.focus();
    }
  }

  function initDropdown(container) {
    const { trigger, panel } = getElements(container);
    if (!trigger || !panel) return;

    trigger.addEventListener('click', event => {
      event.preventDefault();
      event.stopPropagation();
      toggle(container);
    });

    trigger.addEventListener('keydown', event => {
      const key = event.key;
      const isOpen = trigger.getAttribute('aria-expanded') === 'true';
      if ((key === 'ArrowDown' || key === 'Enter' || key === ' ') && !isOpen) {
        event.preventDefault();
        setExpanded(container, true);
        focusFirstInteractive(panel);
      } else if (key === 'Escape' && isOpen) {
        event.preventDefault();
        setExpanded(container, false);
      }
    });

  }

  function init() {
    document.querySelectorAll(DROPDOWN_SELECTOR).forEach(initDropdown);
    document.addEventListener('click', handleDocumentClick);
    document.addEventListener('focusin', handleFocusIn);
    document.addEventListener('keydown', handleDocumentKeydown);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();

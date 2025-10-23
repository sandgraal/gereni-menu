#!/usr/bin/env node

/**
 * Genera el marcado estático de respaldo para `menu.html` a partir de `data/menu.json`.
 * Mantiene el contenido accesible cuando JavaScript está deshabilitado y reduce
 * la necesidad de editar HTML manualmente.
 */

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const DATA_PATH = path.join(ROOT, 'data', 'menu.json');
const MENU_PATH = path.join(ROOT, 'menu.html');

const START_MARKER = '<!-- FALLBACK_MENU_START -->';
const END_MARKER = '<!-- FALLBACK_MENU_END -->';
const NOTE_START = '<!-- MENU_NOTE_START -->';
const NOTE_END = '<!-- MENU_NOTE_END -->';

const INDENT_UNIT = '  ';

const MENU_URL = 'https://sandgraal.github.io/gereni-menu/menu.html';
const RESTAURANT_ID = 'https://sandgraal.github.io/gereni-menu/#restaurant';

function escapeHtml(value) {
  if (value === undefined || value === null) return '';
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function indent(level, text) {
  return `${INDENT_UNIT.repeat(level)}${text}`;
}

function resolveText(obj, lang, fallbackLang) {
  if (!obj || typeof obj !== 'object') return '';
  return obj[lang] || obj[fallbackLang] || '';
}

function sanitizePriceForSchema(price) {
  if (typeof price !== 'string') return null;
  const digits = price.replace(/[^0-9]/g, '');
  return digits.length > 0 ? digits : null;
}

function buildMenuItemSchema(item) {
  if (!item || typeof item !== 'object') {
    return null;
  }

  const nameEs = resolveText(item.name, 'es', 'en');
  const nameEn = resolveText(item.name, 'en', 'es');
  const descriptionEs = resolveText(item.description, 'es', 'en');
  const descriptionEn = resolveText(item.description, 'en', 'es');
  const priceValue = sanitizePriceForSchema(item.price);

  const baseName = nameEs || nameEn || '';
  if (!baseName) {
    return null;
  }

  const schemaItem = {
    '@type': 'MenuItem',
    name: baseName
  };

  if (nameEn && nameEn !== baseName) {
    schemaItem.alternateName = nameEn;
  }

  if (descriptionEs) {
    schemaItem.description = descriptionEs;
  }

  if (descriptionEn && descriptionEn !== descriptionEs) {
    schemaItem.disambiguatingDescription = descriptionEn;
  }

  if (item.image) {
    schemaItem.image = item.image;
  }

  if (priceValue) {
    schemaItem.offers = {
      '@type': 'Offer',
      price: priceValue,
      priceCurrency: 'CRC',
      availability: 'https://schema.org/InStock'
    };
  }

  return schemaItem;
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

      const nameEs = resolveText(section.title, 'es', 'en');
      const nameEn = resolveText(section.title, 'en', 'es');
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
    '@id': `${MENU_URL}#menu`,
    name: 'Menú principal',
    inLanguage: 'es-CR',
    url: MENU_URL,
    isPartOf: {
      '@id': RESTAURANT_ID
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

function replaceSchemaScript(source, schemaJson) {
  const scriptRegex = /<script[^>]*id="menu-schema"[^>]*>/i;
  const match = scriptRegex.exec(source);
  if (!match) {
    throw new Error('No se encontró el script JSON-LD del menú en menu.html');
  }

  const start = match.index + match[0].length;
  const end = source.indexOf('</script>', start);
  if (end === -1) {
    throw new Error('No se encontró el cierre </script> para el JSON-LD del menú');
  }

  const before = source.slice(0, start);
  const after = source.slice(end);
  return `${before}\n${schemaJson}\n${after}`;
}

function renderDish(item, primaryLang, secondaryLang) {
  const namePrimary = resolveText(item.name, primaryLang, secondaryLang);
  const nameSecondary = resolveText(item.name, secondaryLang, primaryLang);
  const hasSecondaryName = nameSecondary && nameSecondary !== namePrimary;
  const descriptionPrimary = resolveText(item.description, primaryLang, secondaryLang);
  const descriptionSecondary = resolveText(item.description, secondaryLang, primaryLang);
  const hasSecondaryDescription = descriptionSecondary && descriptionSecondary !== descriptionPrimary;
  const price = typeof item.price === 'string' ? item.price : '';
  const hasPrice = price.trim().length > 0;
  const image = item.image || '';

  const lines = [];
  const displayName = namePrimary || nameSecondary;
  const classes = ['dish'];
  if (image) {
    classes.push('dish--with-image');
  }

  lines.push(indent(3, `<article class="${classes.join(' ')}">`));
  if (image) {
    lines.push(indent(4, '<figure class="dish-media">'));
    lines.push(indent(5, `<img src="${escapeHtml(image)}" alt="${escapeHtml(displayName)}" loading="lazy"/>`));
    lines.push(indent(4, '</figure>'));
  }
  lines.push(indent(4, '<div class="dish-content">'));
  lines.push(indent(5, '<div class="dish-header">'));
  lines.push(indent(6, `<span class="dish-name">${escapeHtml(displayName)}</span>`));
  if (hasPrice) {
    lines.push(indent(6, '<span class="dish-leader" aria-hidden="true"></span>'));
    lines.push(indent(6, `<span class="dish-price">${escapeHtml(price)}</span>`));
  }
  lines.push(indent(5, '</div>'));
  if (hasSecondaryName) {
    lines.push(indent(5, `<span class="dish-name-alt">${escapeHtml(nameSecondary)}</span>`));
  }
  if (descriptionPrimary) {
    lines.push(indent(5, `<p class="dish-description">${escapeHtml(descriptionPrimary)}</p>`));
  }
  if (hasSecondaryDescription) {
    lines.push(indent(5, `<p class="dish-description dish-description--alt">${escapeHtml(descriptionSecondary)}</p>`));
  }
  lines.push(indent(4, '</div>'));
  lines.push(indent(3, '</article>'));

  return lines.join('\n');
}

function renderSection(section, primaryLang, secondaryLang) {
  const titlePrimary = resolveText(section.title, primaryLang, secondaryLang);
  const titleSecondary = resolveText(section.title, secondaryLang, primaryLang);
  const lines = [];

  lines.push(indent(2, '<section class="menu-section">'));
  lines.push(indent(3, '<h2 class="menu-section__title">'));
  lines.push(indent(4, `<span class="menu-section__title-primary">${escapeHtml(titlePrimary || titleSecondary)}</span>`));
  if (titleSecondary && titleSecondary !== titlePrimary) {
    lines.push(indent(4, `<span class="menu-section__title-secondary">${escapeHtml(titleSecondary)}</span>`));
  }
  lines.push(indent(3, '</h2>'));

  const items = Array.isArray(section.items) ? section.items : [];
  items.forEach(item => {
    lines.push(renderDish(item, primaryLang, secondaryLang));
  });

  lines.push(indent(2, '</section>'));
  return lines.join('\n');
}

function renderColumns(sections) {
  const splitIndex = Math.ceil(sections.length / 2) || 0;
  const columns = [sections.slice(0, splitIndex), sections.slice(splitIndex)];
  const columnClasses = ['menu-column menu-column--left', 'menu-column menu-column--right'];
  const primaryLang = 'es';
  const secondaryLang = 'en';

  const columnHtml = columns.map((columnSections, index) => {
    if (columnSections.length === 0) {
      return indent(1, `<div class="${columnClasses[index]}">`) + '\n' + indent(1, '</div>');
    }
    const lines = [];
    lines.push(indent(1, `<div class="${columnClasses[index]}">`));
    columnSections.forEach(section => {
      lines.push(renderSection(section, primaryLang, secondaryLang));
    });
    lines.push(indent(1, '</div>'));
    return lines.join('\n');
  });

  return columnHtml.join('\n');
}

function formatUpdatedAt(dateIso) {
  if (!dateIso) return '';
  const parsed = new Date(dateIso);
  if (Number.isNaN(parsed.valueOf())) return '';
  return parsed.toLocaleDateString('es-CR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}

function replaceBetweenMarkers(source, markerStart, markerEnd, replacementFactory) {
  const startIndex = source.indexOf(markerStart);
  if (startIndex === -1) {
    throw new Error(`No se encontró el marcador ${markerStart} en menu.html`);
  }
  const endIndex = source.indexOf(markerEnd, startIndex);
  if (endIndex === -1) {
    throw new Error(`No se encontró el marcador ${markerEnd} en menu.html`);
  }

  const indentStart = (() => {
    const lastNewline = source.lastIndexOf('\n', startIndex);
    if (lastNewline === -1) return '';
    return source.slice(lastNewline + 1, startIndex);
  })();

  const before = source.slice(0, startIndex);
  const after = source.slice(endIndex + markerEnd.length);
  const replacement = replacementFactory(indentStart);
  return before + replacement + after;
}

function main() {
  if (!fs.existsSync(DATA_PATH)) {
    throw new Error(`No se encontró ${DATA_PATH}`);
  }
  if (!fs.existsSync(MENU_PATH)) {
    throw new Error(`No se encontró ${MENU_PATH}`);
  }

  const data = JSON.parse(fs.readFileSync(DATA_PATH, 'utf8'));
  const sections = Array.isArray(data.sections) ? data.sections.filter(section => {
    const items = Array.isArray(section.items) ? section.items : [];
    return items.length > 0;
  }) : [];

  const fallbackHtml = sections.length > 0 ? renderColumns(sections) : indent(1, '<!-- No hay secciones disponibles -->');
  const updatedNote = formatUpdatedAt(data.updatedAt);
  const schemaPayload = buildMenuSchema(data);
  const schemaJson = schemaPayload ? JSON.stringify(schemaPayload, null, 2) : null;

  let html = fs.readFileSync(MENU_PATH, 'utf8');

  html = replaceBetweenMarkers(html, START_MARKER, END_MARKER, (indentStart) => {
    const lines = [];
    lines.push(`${indentStart}${START_MARKER}`);
    lines.push(fallbackHtml);
    lines.push(`${indentStart}${END_MARKER}`);
    return lines.join('\n');
  });

  if (html.indexOf(NOTE_START) === -1 || html.indexOf(NOTE_END) === -1) {
    throw new Error('No se encontraron los marcadores de nota del menú en menu.html');
  }

  html = html.replace(
    new RegExp(`${NOTE_START}[\\s\\S]*?${NOTE_END}`),
    `${NOTE_START}${updatedNote ? `Actualizado el ${updatedNote}` : ''}${NOTE_END}`
  );

  if (schemaJson) {
    html = replaceSchemaScript(html, schemaJson);
  }

  fs.writeFileSync(MENU_PATH, html);
  console.log('Marcado estático del menú actualizado.');
}

main();

#!/usr/bin/env node

/**
 * Sincroniza el contenido de `content/menu.md` hacia `data/menu.json`.
 * Permite mantener Markdown como fuente de verdad para el equipo de contenido.
 */

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const MARKDOWN_PATH = path.join(ROOT, 'content', 'menu.md');
const JSON_PATH = path.join(ROOT, 'data', 'menu.json');

const SECTION_HEADING = /^##\s+(.*)$/;
const ITEM_PATTERN = /^-\s+\*\*(.+?)\*\*\s+—\s+(.*)\s+\((₡[\d.]+)\)\s*$/;

function normalizeKey(value) {
  return typeof value === 'string' ? value.trim().toLowerCase() : '';
}

function resolvePrimaryText(entry) {
  if (!entry) {
    return '';
  }
  if (typeof entry === 'string') {
    return entry;
  }
  if (typeof entry === 'object') {
    return entry.es || entry.en || '';
  }
  return '';
}

function buildSectionKey(title) {
  return normalizeKey(resolvePrimaryText(title));
}

function buildItemKey(sectionKey, name) {
  const itemName = normalizeKey(resolvePrimaryText(name));
  if (!sectionKey || !itemName) {
    return '';
  }
  return `${sectionKey}::${itemName}`;
}

function createImageLookup(existingData) {
  const lookup = new Map();
  if (!existingData || !Array.isArray(existingData.sections)) {
    return lookup;
  }

  existingData.sections.forEach(section => {
    if (!section || !Array.isArray(section.items)) {
      return;
    }
    const sectionKey = buildSectionKey(section.title);
    if (!sectionKey) {
      return;
    }
    section.items.forEach(item => {
      if (!item || !item.image) {
        return;
      }
      const itemKey = buildItemKey(sectionKey, item.name);
      if (itemKey) {
        lookup.set(itemKey, item.image);
      }
    });
  });

  return lookup;
}

function splitBilingual(raw, fallback = '') {
  if (!raw) {
    return { es: fallback, en: fallback };
  }
  const parts = raw.split('|').map(part => part.trim()).filter(Boolean);
  if (parts.length === 0) {
    return { es: fallback, en: fallback };
  }
  if (parts.length === 1) {
    return { es: parts[0], en: parts[0] };
  }
  return {
    es: parts[0],
    en: parts.slice(1).join(' | ')
  };
}

function parseMenuMarkdown(markdown) {
  const lines = markdown.split(/\r?\n/);
  const sections = [];
  let collecting = false;
  let currentSection = null;

  for (const rawLine of lines) {
    const line = rawLine.trim();

    if (line === '---') {
      collecting = true;
      continue;
    }

    if (!collecting || line.length === 0) {
      continue;
    }

    if (line.startsWith('<!--')) {
      continue;
    }

    const sectionMatch = SECTION_HEADING.exec(line);
    if (sectionMatch) {
      const titleRaw = sectionMatch[1].trim();
      const titleKey = titleRaw.split('|')[0]?.trim().toLowerCase();
      if (titleKey === 'notas') {
        currentSection = null;
        break;
      }
      currentSection = { title: splitBilingual(titleRaw), items: [] };
      sections.push(currentSection);
      continue;
    }

    if (!currentSection) {
      continue;
    }

    const itemMatch = ITEM_PATTERN.exec(line);
    if (itemMatch) {
      const [, name, description, price] = itemMatch;
      currentSection.items.push({
        name: splitBilingual(name.trim()),
        description: splitBilingual(description.trim().replace(/\s{2,}/g, ' ')),
        price: price.trim()
      });
      continue;
    }
  }

  return sections.filter(section => section.items.length > 0);
}

function main() {
  if (!fs.existsSync(MARKDOWN_PATH)) {
    console.error(`No se encontró ${MARKDOWN_PATH}`);
    process.exit(1);
  }

  const existingData = fs.existsSync(JSON_PATH)
    ? JSON.parse(fs.readFileSync(JSON_PATH, 'utf8'))
    : null;
  const imageLookup = createImageLookup(existingData);

  const markdown = fs.readFileSync(MARKDOWN_PATH, 'utf8');
  const sections = parseMenuMarkdown(markdown);

  if (sections.length === 0) {
    console.warn('No se encontraron platillos en el Markdown. JSON no fue modificado.');
    return;
  }

  sections.forEach(section => {
    const sectionKey = buildSectionKey(section.title);
    if (!sectionKey || !Array.isArray(section.items)) {
      return;
    }
    section.items.forEach(item => {
      if (!item || item.image) {
        return;
      }
      const itemKey = buildItemKey(sectionKey, item.name);
      if (!itemKey) {
        return;
      }
      const existingImage = imageLookup.get(itemKey);
      if (existingImage) {
        item.image = existingImage;
      }
    });
  });

  const payload = {
    updatedAt: new Date().toISOString(),
    sections
  };

  fs.writeFileSync(JSON_PATH, JSON.stringify(payload, null, 2) + '\n', 'utf8');
  console.log(`Se actualizaron ${sections.length} secciones en data/menu.json`);
}

main();

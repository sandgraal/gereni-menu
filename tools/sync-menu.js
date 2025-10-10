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
      const title = sectionMatch[1].trim();
      if (title.toLowerCase() === 'notas') {
        currentSection = null;
        break;
      }
      currentSection = { title, items: [] };
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
        name: name.trim(),
        description: description.trim().replace(/\s{2,}/g, ' '),
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

  const markdown = fs.readFileSync(MARKDOWN_PATH, 'utf8');
  const sections = parseMenuMarkdown(markdown);

  if (sections.length === 0) {
    console.warn('No se encontraron platillos en el Markdown. JSON no fue modificado.');
    return;
  }

  const payload = {
    updatedAt: new Date().toISOString(),
    sections
  };

  fs.writeFileSync(JSON_PATH, JSON.stringify(payload, null, 2) + '\n', 'utf8');
  console.log(`Se actualizaron ${sections.length} secciones en data/menu.json`);
}

main();

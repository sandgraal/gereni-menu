#!/usr/bin/env node

/**
 * Verifica que todos los precios en `content/menu.md` y `data/menu.json`
 * respeten el formato `₡0.000` (separador de miles con punto, sin decimales).
 */

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const MARKDOWN_PATH = path.join(ROOT, 'content', 'menu.md');
const JSON_PATH = path.join(ROOT, 'data', 'menu.json');

const PRICE_PATTERN = /^₡\d{1,3}(?:\.\d{3})*$/;
const PRICE_CAPTURE = /₡[\d.]+/g;

function validatePrice(value, context, errors) {
  if (!PRICE_PATTERN.test(value)) {
    errors.push(`${context} → "${value}" no cumple el formato ₡0.000`);
  }
}

function checkMarkdown(errors) {
  if (!fs.existsSync(MARKDOWN_PATH)) {
    errors.push(`No se encontró ${MARKDOWN_PATH}`);
    return;
  }

  const content = fs.readFileSync(MARKDOWN_PATH, 'utf8');
  const lines = content.split(/\r?\n/);

  lines.forEach((line, index) => {
    const matches = line.match(PRICE_CAPTURE);
    if (!matches) return;
    matches.forEach(price => {
      const context = `content/menu.md:${index + 1}`;
      validatePrice(price, context, errors);
    });
  });
}

function checkJson(errors) {
  if (!fs.existsSync(JSON_PATH)) {
    errors.push(`No se encontró ${JSON_PATH}`);
    return;
  }

  const raw = fs.readFileSync(JSON_PATH, 'utf8');

  try {
    const data = JSON.parse(raw);
    (data.sections || []).forEach((section, sectionIndex) => {
      const sectionTitle = (section.title && (section.title.es || section.title.en)) || '[sin título]';
      (section.items || []).forEach((item, itemIndex) => {
        const price = item.price;
        const itemName = (item.name && (item.name.es || item.name.en)) || '[sin nombre]';
        const context = `data/menu.json → sección ${sectionIndex + 1} "${sectionTitle}", item ${itemIndex + 1} "${itemName}"`;
        if (typeof price !== 'string' || price.trim().length === 0) {
          errors.push(`${context} carece de precio en formato string.`);
          return;
        }
        validatePrice(price.trim(), context, errors);
      });
    });
  } catch (err) {
    errors.push(`Error al analizar ${JSON_PATH}: ${err.message}`);
  }
}

function main() {
  const errors = [];

  checkMarkdown(errors);
  checkJson(errors);

  if (errors.length > 0) {
    console.error('❌ Formato de precios inválido:');
    errors.forEach(err => console.error(`   - ${err}`));
    process.exitCode = 1;
    return;
  }

  console.log('✔ Todos los precios cumplen el formato ₡0.000');
}

main();

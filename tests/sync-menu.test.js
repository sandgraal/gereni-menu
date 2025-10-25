#!/usr/bin/env node

const assert = require('node:assert/strict');
const {
  normalizeKey,
  resolvePrimaryText,
  buildSectionKey,
  buildItemKey,
  createImageLookup,
  splitBilingual,
  parseMenuMarkdown
} = require('../tools/sync-menu.js');

const tests = [];

function test(name, fn) {
  tests.push({ name, fn });
}

test('splitBilingual handles bilingual content with explicit separator', () => {
  const result = splitBilingual('Bebidas | Drinks');
  assert.equal(result.es, 'Bebidas');
  assert.equal(result.en, 'Drinks');
});

test('splitBilingual mirrors single-language input for both locales', () => {
  const result = splitBilingual('Té de hierbabuena');
  assert.equal(result.es, 'Té de hierbabuena');
  assert.equal(result.en, 'Té de hierbabuena');
});

test('splitBilingual uses fallback when input is empty', () => {
  const result = splitBilingual('', 'Disponible pronto');
  assert.equal(result.es, 'Disponible pronto');
  assert.equal(result.en, 'Disponible pronto');
});

test('parseMenuMarkdown extracts sections, items and bilingual fields', () => {
  const markdown = `---
## Bebidas | Drinks
- **Café negro | Black coffee** — Taza regular | Regular cup (₡1.500)
- **Té frío** — Hierbabuena (₡1.200)

<!-- Comentario -->
## Postres | Desserts
- **Cheesecake** — Con frutas   frescas (₡3.000)
## Notas
- **No debería aparecer** — Oculto (₡0)
`;

  const sections = parseMenuMarkdown(markdown);
  assert.equal(sections.length, 2);

  const beverages = sections[0];
  assert.deepEqual(beverages.title, { es: 'Bebidas', en: 'Drinks' });
  assert.equal(beverages.items.length, 2);

  const coffee = beverages.items[0];
  assert.deepEqual(coffee.name, { es: 'Café negro', en: 'Black coffee' });
  assert.deepEqual(coffee.description, { es: 'Taza regular', en: 'Regular cup' });
  assert.equal(coffee.price, '₡1.500');

  const icedTea = beverages.items[1];
  assert.deepEqual(icedTea.name, { es: 'Té frío', en: 'Té frío' });
  assert.deepEqual(icedTea.description, { es: 'Hierbabuena', en: 'Hierbabuena' });

  const desserts = sections[1];
  assert.deepEqual(desserts.title, { es: 'Postres', en: 'Desserts' });
  assert.equal(desserts.items.length, 1);
  assert.deepEqual(desserts.items[0].description, { es: 'Con frutas frescas', en: 'Con frutas frescas' });
});

test('parseMenuMarkdown ignores sections without items', () => {
  const markdown = `---
## Vacío | Empty

## Sopas | Soups
- **Sopa azteca** — Caldo de tomate (₡3.500)
`;

  const sections = parseMenuMarkdown(markdown);
  assert.equal(sections.length, 1);
  assert.equal(sections[0].title.es, 'Sopas');
});

test('createImageLookup preserves images for matching items', () => {
  const existing = {
    sections: [
      {
        title: { es: 'Bebidas', en: 'Drinks' },
        items: [
          {
            name: { es: 'Café negro', en: 'Black coffee' },
            image: 'assets/bebidas/cafe-negro.jpg'
          }
        ]
      }
    ]
  };

  const lookup = createImageLookup(existing);
  const sectionKey = buildSectionKey({ es: 'Bebidas', en: 'Drinks' });
  const itemKey = buildItemKey(sectionKey, { es: 'Café negro', en: 'Black coffee' });
  assert.equal(lookup.get(itemKey), 'assets/bebidas/cafe-negro.jpg');
});

test('buildItemKey and helpers normalize values consistently', () => {
  const sectionKey = buildSectionKey({ es: '  Postres  ', en: 'Desserts' });
  const itemKey = buildItemKey(sectionKey, { es: 'Tres leches', en: 'Three milks' });
  assert.equal(sectionKey, 'postres');
  assert.equal(itemKey, 'postres::tres leches');
  assert.equal(normalizeKey(resolvePrimaryText({ es: '  Hola ', en: '' })), 'hola');
});

(async () => {
  let failures = 0;

  for (const { name, fn } of tests) {
    try {
      await fn();
      console.log(`✓ ${name}`);
    } catch (error) {
      failures += 1;
      console.error(`✗ ${name}`);
      console.error(error.stack);
    }
  }

  if (failures > 0) {
    console.error(`\n${failures} test(s) failed.`);
    process.exitCode = 1;
    return;
  }

  console.log(`\n${tests.length} test(s) passed.`);
})();

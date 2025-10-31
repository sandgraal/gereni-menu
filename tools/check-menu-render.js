#!/usr/bin/env node

/**
 * Valida la estructura de `menu.html` y resume el contenido de
 * `data/menu.json` para asegurar que el menú esté listo para mostrarse.
 */

const fs = require('fs');
const path = require('path');
const root = path.resolve(__dirname, '..');
const htmlPath = path.join(root, 'menu.html');
const dataPath = path.join(root, 'data', 'menu.json');
const highlightPath = path.join(root, 'data', 'highlight-fallbacks.json');

function formatUpdatedAt(dateIso) {
  if (!dateIso) {
    return '';
  }

  const parsed = new Date(dateIso);
  if (Number.isNaN(parsed.valueOf())) {
    return '';
  }

  return parsed.toLocaleDateString('es-CR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}

function extractLocalizedText(entry) {
  if (!entry || typeof entry !== 'object') {
    return { es: '', en: '' };
  }

  const es = typeof entry.es === 'string' ? entry.es : '';
  const en = typeof entry.en === 'string' ? entry.en : '';
  return { es, en };
}

async function main() {
  const html = fs.readFileSync(htmlPath, 'utf8');

  const requiredPatterns = [
    { test: /<main[\s>]/i, description: 'Elemento principal <main>' },
    { test: /id\s*=\s*["']menu-container["']/i, description: 'Contenedor del menú (#menu-container)' },
    { test: /id\s*=\s*["']menu-updated["']/i, description: 'Etiqueta de actualización (#menu-updated)' },
    { test: /id\s*=\s*["']menu-empty["']/i, description: 'Estado vacío (#menu-empty)' },
    { test: /id\s*=\s*["']menu-search-input["']/i, description: 'Campo de búsqueda (#menu-search-input)' },
    { test: /class\s*=\s*["'][^"']*menu-search__clear[^"']*["']/i, description: 'Botón para limpiar la búsqueda (.menu-search__clear)' },
    { test: /id\s*=\s*["']menu-schema["']/i, description: 'Script JSON-LD (#menu-schema)' }
  ];

  for (const { test, description } of requiredPatterns) {
    if (!test.test(html)) {
      throw new Error(`No se encontró ${description} en menu.html.`);
    }
  }

  const dataContent = fs.readFileSync(dataPath, 'utf8');
  let menuData;

  try {
    menuData = JSON.parse(dataContent);
  } catch (error) {
    throw new Error(`No se pudo parsear data/menu.json: ${error.message}`);
  }

  const sections = Array.isArray(menuData.sections) ? menuData.sections : [];
  if (sections.length === 0) {
    throw new Error('data/menu.json no contiene secciones de menú.');
  }

  const referencedImages = new Map();

  function trackImage(imagePath, context) {
    if (typeof imagePath !== 'string') {
      return;
    }

    const trimmed = imagePath.trim();
    if (!trimmed || /^https?:/i.test(trimmed) || trimmed.startsWith('data:')) {
      return;
    }

    if (!referencedImages.has(trimmed)) {
      referencedImages.set(trimmed, new Set());
    }

    referencedImages.get(trimmed).add(context);
  }

  const sectionSummaries = sections.map((section, index) => {
    const titles = extractLocalizedText(section?.title || {});
    const displayTitle =
      (titles.es && titles.es.trim()) ? titles.es.trim()
      : (titles.en && titles.en.trim()) ? titles.en.trim()
      : `Sección ${index + 1}`;
    const items = Array.isArray(section?.items) ? section.items : [];

    for (const item of items) {
      const itemNames = extractLocalizedText(item?.name || {});
      const displayName =
        (itemNames.es && itemNames.es.trim()) ? itemNames.es.trim()
        : (itemNames.en && itemNames.en.trim()) ? itemNames.en.trim()
        : 'Platillo sin nombre';

      const context = `data/menu.json → ${displayTitle} → ${displayName}`;

      if (typeof item?.image === 'string' && item.image.trim()) {
        trackImage(item.image, context);
      }

      if (Array.isArray(item?.imageSet)) {
        for (const entry of item.imageSet) {
          let src = '';

          if (typeof entry === 'string') {
            src = entry.trim();
          } else if (entry && typeof entry === 'object' && typeof entry.src === 'string') {
            src = entry.src.trim();
          }

          if (src) {
            trackImage(src, `${context} (srcset)`);
          }
        }
      }
    }

    return { title: displayTitle, count: items.length };
  });

  const formattedUpdated = formatUpdatedAt(menuData.updatedAt);
  const footerNote = formattedUpdated ? `Actualizado el ${formattedUpdated}` : '';

  let schemaSummary = 'No disponible';

  const schemaMatch = html.match(/<script[^>]*id=["']menu-schema["'][^>]*>([\s\S]*?)<\/script>/i);
  if (schemaMatch) {
    try {
      const schema = JSON.parse(schemaMatch[1] || 'null');
      if (schema && typeof schema === 'object') {
        const count = Array.isArray(schema.hasMenuSection) ? schema.hasMenuSection.length : 0;
        schemaSummary = `${count} secciones`;
      } else {
        schemaSummary = 'No válido';
      }
    } catch (error) {
      schemaSummary = `Error: ${error.message}`;
    }
  }

  console.log(`Secciones renderizadas: ${sectionSummaries.length}`);
  console.log(
    sectionSummaries
      .map(summary => `- ${summary.title} (${summary.count} platillos)`)
      .join('\n')
  );
  console.log(`Nota de actualización: ${footerNote || 'No visible'}`);
  console.log(`Schema JSON-LD: ${schemaSummary}`);

  let highlightFallbacks;

  try {
    const highlightRaw = fs.readFileSync(highlightPath, 'utf8');
    highlightFallbacks = JSON.parse(highlightRaw);
  } catch (error) {
    throw new Error(`No se pudo parsear data/highlight-fallbacks.json: ${error.message}`);
  }

  if (!Array.isArray(highlightFallbacks) || highlightFallbacks.length === 0) {
    throw new Error('data/highlight-fallbacks.json no contiene rutas de imagen.');
  }

  for (let index = 0; index < highlightFallbacks.length; index++) {
    const entry = highlightFallbacks[index];
    if (typeof entry !== 'string' || !entry.trim()) {
      throw new Error(`Entrada ${index + 1} en data/highlight-fallbacks.json no es una ruta válida.`);
    }

    trackImage(entry, `data/highlight-fallbacks.json → índice ${index}`);
  }

  const imageTagRegex = /<img\s+[^>]*src=["']([^"']+)["'][^>]*>/gi;
  let imageMatch;

  while ((imageMatch = imageTagRegex.exec(html)) !== null) {
    trackImage(imageMatch[1], 'menu.html');
  }

  const missingImages = [];

  for (const [relativePath, contexts] of referencedImages.entries()) {
    const normalized = relativePath.replace(/^\/+/, '');
    const resolved = path.resolve(root, normalized);

    if (!resolved.startsWith(root)) {
      missingImages.push(`${relativePath} (fuera del directorio del proyecto, referencias: ${Array.from(contexts).join(', ')})`);
      continue;
    }

    if (!fs.existsSync(resolved)) {
      missingImages.push(`${relativePath} (referencias: ${Array.from(contexts).join(', ')})`);
    }
  }

  if (missingImages.length > 0) {
    throw new Error(`No se encontraron las imágenes referenciadas:\n${missingImages.join('\n')}`);
  }

  console.log(`Imágenes verificadas: ${referencedImages.size}`);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});

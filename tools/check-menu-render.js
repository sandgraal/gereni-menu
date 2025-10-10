#!/usr/bin/env node

/**
 * Renderiza `menu.html` en un DOM virtual para verificar que el menú se
 * genere correctamente después de aplicar `scripts/loadMenu.js`.
 */

const fs = require('fs');
const path = require('path');
const { JSDOM } = require('jsdom');

const root = path.resolve(__dirname, '..');
const htmlPath = path.join(root, 'menu.html');
const scriptPath = path.join(root, 'scripts', 'loadMenu.js');
const dataPath = path.join(root, 'data', 'menu.json');

async function main() {
  const html = fs.readFileSync(htmlPath, 'utf8');
  const dom = new JSDOM(html, {
    url: `file://${htmlPath}`,
    runScripts: 'outside-only',
    pretendToBeVisual: true
  });

  // Mock fetch para que lea el JSON local.
  dom.window.fetch = async (url) => {
    const resolved = path.join(root, url);
    const body = fs.readFileSync(resolved, 'utf8');
    return {
      async json() {
        return JSON.parse(body);
      }
    };
  };

  const scriptContent = fs.readFileSync(scriptPath, 'utf8');
  dom.window.eval(scriptContent);

  await new Promise(resolve => {
    dom.window.addEventListener('load', () => {
      setTimeout(resolve, 50);
    });
  });

  const sections = [...dom.window.document.querySelectorAll('main section')];
  const footerNote = dom.window.document.querySelector('#menu-updated')?.textContent.trim();

  console.log(`Secciones renderizadas: ${sections.length}`);
  console.log(
    sections.map(section => `- ${section.querySelector('h2')?.textContent || 'Sin título'} (${section.querySelectorAll('.dish').length} platillos)`).join('\n')
  );
  console.log(`Nota de actualización: ${footerNote || 'No visible'}`);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});

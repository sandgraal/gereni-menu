#!/usr/bin/env node

/**
 * Genera las exportaciones PDF (digital e imprenta) a partir de `menu.html`.
 * Usa Puppeteer para renderizar la página con estilos de pantalla y de impresión.
 */

const fs = require('fs');
const path = require('path');
const http = require('http');
const puppeteer = require('puppeteer');

const ROOT = path.resolve(__dirname, '..');
const OUTPUT_DIR = path.join(ROOT, 'output');

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.ico': 'image/x-icon'
};

function createStaticServer() {
  return http.createServer((req, res) => {
    const urlPath = decodeURI(req.url.split('?')[0]);
    const safePath = urlPath === '/' ? '/menu.html' : urlPath;
    const filePath = path.join(ROOT, safePath);

    if (!filePath.startsWith(ROOT)) {
      res.writeHead(403);
      res.end('Forbidden');
      return;
    }

    fs.readFile(filePath, (err, data) => {
      if (err) {
        res.writeHead(404);
        res.end('Not found');
        return;
      }
      const ext = path.extname(filePath).toLowerCase();
      const mime = MIME_TYPES[ext] || 'application/octet-stream';
      res.writeHead(200, { 'Content-Type': mime });
      res.end(data);
    });
  });
}

async function exportMenu() {
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }

  const server = createStaticServer();
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  const { port } = server.address();
  const baseUrl = `http://127.0.0.1:${port}`;

  const browser = await puppeteer.launch({
    headless: 'new'
  });

  try {
    const page = await browser.newPage();

    // Generar PDF Digital (estilos de pantalla)
    await page.goto(`${baseUrl}/menu.html`, { waitUntil: 'networkidle0' });
    await page.emulateMediaType('screen');
    await page.pdf({
      path: path.join(OUTPUT_DIR, 'Menu_Gereni_digital.pdf'),
      format: 'Letter',
      printBackground: true,
      preferCSSPageSize: true
    });
    console.log('✔ Generado output/Menu_Gereni_digital.pdf');

    // Generar PDF Print (estilos @media print)
    await page.emulateMediaType('print');
    await page.reload({ waitUntil: 'networkidle0' });
    await page.pdf({
      path: path.join(OUTPUT_DIR, 'Menu_Gereni_print.pdf'),
      format: 'Letter',
      printBackground: true,
      preferCSSPageSize: true,
      margin: {
        top: '0.5in',
        bottom: '0.5in',
        left: '0.5in',
        right: '0.5in'
      }
    });
    console.log('✔ Generado output/Menu_Gereni_print.pdf');
  } finally {
    await browser.close();
    server.close();
  }
}

exportMenu().catch(err => {
  console.error(err);
  process.exit(1);
});

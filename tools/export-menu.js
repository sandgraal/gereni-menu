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
const PHOTOS_DIR = path.join(ROOT, 'assets', 'photos');
const HIGHLIGHT_FALLBACK_PATH = path.join(ROOT, 'data', 'highlight-fallbacks.json');
const SCREEN_VARIATIONS = [
  { lang: 'es', theme: 'dark' },
  { lang: 'es', theme: 'light' },
  { lang: 'en', theme: 'dark' },
  { lang: 'en', theme: 'light' }
];
const DEFAULT_SCREEN_VARIATION = SCREEN_VARIATIONS[0];

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

const NO_SANDBOX_FLAGS = ['--no-sandbox', '--disable-setuid-sandbox'];
const SUPPORTED_PHOTO_EXTENSIONS = new Set(['.png', '.jpg', '.jpeg', '.webp']);

function collectAvailablePhotos() {
  if (!fs.existsSync(PHOTOS_DIR)) {
    return [];
  }
  return fs
    .readdirSync(PHOTOS_DIR)
    .filter(file => SUPPORTED_PHOTO_EXTENSIONS.has(path.extname(file).toLowerCase()))
    .map(file => path.posix.join('assets/photos', file))
    .sort((a, b) => a.localeCompare(b));
}

function readHighlightFallbacks() {
  if (!fs.existsSync(HIGHLIGHT_FALLBACK_PATH)) {
    return [];
  }
  try {
    const payload = JSON.parse(fs.readFileSync(HIGHLIGHT_FALLBACK_PATH, 'utf8'));
    return Array.isArray(payload) ? payload : [];
  } catch (error) {
    console.warn('No se pudo leer data/highlight-fallbacks.json:', error.message);
    return [];
  }
}

function getHighlightResources() {
  return {
    availablePhotos: collectAvailablePhotos(),
    fallbackPhotos: readHighlightFallbacks()
  };
}

function parseEnvArgs(value) {
  if (!value) {
    return [];
  }
  return value
    .split(/\s+/)
    .map(arg => arg.trim())
    .filter(Boolean);
}

function envFlagIsTrue(value) {
  if (!value) {
    return false;
  }
  return ['1', 'true', 'yes'].includes(value.toLowerCase());
}

function isSandboxLaunchError(error) {
  if (!error || typeof error.message !== 'string') {
    return false;
  }
  return /No usable sandbox/.test(error.message) || /zygote_host_impl_linux\.cc/.test(error.message);
}

async function launchBrowser() {
  const extraArgs = parseEnvArgs(process.env.PUPPETEER_EXTRA_ARGS);
  const buildOptions = additionalArgs => {
    const args = [...extraArgs];
    if (additionalArgs && additionalArgs.length > 0) {
      args.push(...additionalArgs);
    }
    const options = { headless: 'new' };
    if (args.length > 0) {
      options.args = args;
    }
    return options;
  };

  if (envFlagIsTrue(process.env.PUPPETEER_DISABLE_SANDBOX)) {
    return puppeteer.launch(buildOptions(NO_SANDBOX_FLAGS));
  }

  try {
    return await puppeteer.launch(buildOptions());
  } catch (error) {
    if (!isSandboxLaunchError(error)) {
      throw error;
    }
    console.warn('Chromium sandbox unavailable; retrying Puppeteer launch without it.');
    console.warn('Set PUPPETEER_DISABLE_SANDBOX=true to skip the initial attempt.');
    return puppeteer.launch(buildOptions(NO_SANDBOX_FLAGS));
  }
}

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

function getDigitalFileName(lang, theme) {
  return `Menu_Gereni_digital_${lang}_${theme}.pdf`;
}

async function applyPreferences(page, { lang, theme }) {
  await page.evaluate(
    ({ lang, theme }) => {
      const safeLang = lang === 'en' ? 'en' : 'es';
      const safeTheme = theme === 'light' ? 'light' : 'dark';

      if (window.GereniTheme && typeof window.GereniTheme.set === 'function') {
        window.GereniTheme.set(safeTheme);
      } else {
        document.documentElement.setAttribute('data-theme', safeTheme);
        if (document.body) {
          document.body.setAttribute('data-theme', safeTheme);
        }
      }

      if (window.GereniLang && typeof window.GereniLang.set === 'function') {
        window.GereniLang.set(safeLang);
      } else {
        document.documentElement.setAttribute('lang', safeLang);
      }
    },
    { lang, theme }
  );

  await page.waitForFunction(
    ({ lang, theme }) => {
      const expectedLang = lang === 'en' ? 'en' : 'es';
      const expectedTheme = theme === 'light' ? 'light' : 'dark';
      const docLang = document.documentElement.getAttribute('lang');
      const bodyTheme = document.body ? document.body.getAttribute('data-theme') : null;
      return docLang === expectedLang && bodyTheme === expectedTheme;
    },
    {},
    { lang, theme }
  );
}

async function ensureMenuReady(page, lang) {
  await page.waitForFunction(
    ({ lang }) => {
      if (!window.GereniPdfLayout || typeof window.GereniPdfLayout.isReady !== 'function') {
        return false;
      }
      return window.GereniPdfLayout.isReady(lang || null);
    },
    {},
    { lang }
  );
}

async function preparePdfLayout(page, resources, lang) {
  await ensureMenuReady(page, lang);
  const prepared = await page.evaluate(({ resources, lang }) => {
    if (!window.GereniPdfLayout || typeof window.GereniPdfLayout.prepare !== 'function') {
      return false;
    }
    return window.GereniPdfLayout.prepare({
      availablePhotos: Array.isArray(resources?.availablePhotos) ? resources.availablePhotos : [],
      fallbackPhotos: Array.isArray(resources?.fallbackPhotos) ? resources.fallbackPhotos : [],
      expectedLang: lang || null
    });
  }, { resources, lang });

  if (!prepared) {
    throw new Error('No se pudo preparar el layout PDF automáticamente.');
  }

  await page.waitForTimeout(50);
}

async function resetPdfLayout(page) {
  await page.evaluate(() => {
    if (window.GereniPdfLayout && typeof window.GereniPdfLayout.reset === 'function') {
      window.GereniPdfLayout.reset();
    }
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

  let browser;

  try {
    browser = await launchBrowser();
    const page = await browser.newPage();

    const highlightResources = getHighlightResources();

    // Generar PDFs digitales en todas las combinaciones de idioma/tema
    await page.goto(`${baseUrl}/menu.html`, { waitUntil: 'networkidle0' });
    await page.emulateMediaType('screen');
    for (const variant of SCREEN_VARIATIONS) {
      await applyPreferences(page, variant);
      await preparePdfLayout(page, highlightResources, variant.lang);
      const fileName = getDigitalFileName(variant.lang, variant.theme);
      await page.pdf({
        path: path.join(OUTPUT_DIR, fileName),
        format: 'Letter',
        printBackground: true,
        preferCSSPageSize: true
      });
      await resetPdfLayout(page);
      console.log(`✔ Generado output/${fileName}`);
    }

    const defaultFileName = getDigitalFileName(
      DEFAULT_SCREEN_VARIATION.lang,
      DEFAULT_SCREEN_VARIATION.theme
    );
    const defaultFilePath = path.join(OUTPUT_DIR, defaultFileName);
    const legacyFilePath = path.join(OUTPUT_DIR, 'Menu_Gereni_digital.pdf');
    if (fs.existsSync(defaultFilePath)) {
      fs.copyFileSync(defaultFilePath, legacyFilePath);
      console.log('Copied output/Menu_Gereni_digital.pdf for compatibility');
    }

    // Generar PDF Print (estilos @media print)
    await page.emulateMediaType('print');
    await page.reload({ waitUntil: 'networkidle0' });
    await applyPreferences(page, DEFAULT_SCREEN_VARIATION);
    await preparePdfLayout(page, highlightResources, DEFAULT_SCREEN_VARIATION.lang);
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
    await resetPdfLayout(page);
    console.log('✔ Generado output/Menu_Gereni_print.pdf');
  } finally {
    if (browser) {
      await browser.close();
    }
    server.close();
  }
}

exportMenu().catch(err => {
  console.error(err);
  process.exit(1);
});

#!/usr/bin/env node

/**
 * Valida que los enlaces sociales en `index.html` y `data/home-highlights.json`
 * apunten a URLs absolutas accesibles. Permite omitir la verificación de red
 * estableciendo la variable de entorno `SKIP_SOCIAL_LINK_CHECK=1`.
 */

const fs = require('fs');
const path = require('path');
const http = require('http');
const https = require('https');
const { JSDOM } = require('jsdom');

const ROOT = path.resolve(__dirname, '..');
const INDEX_PATH = path.join(ROOT, 'index.html');
const HIGHLIGHTS_PATH = path.join(ROOT, 'data', 'home-highlights.json');

const NETWORK_TIMEOUT_MS = 5000;
const MAX_REDIRECTS = 5;
const SUCCESS_STATUS_CODES = new Set([401, 403, 429]);

const skipNetworkCheck = /^1|true$/i.test(process.env.SKIP_SOCIAL_LINK_CHECK || '');

function formatNetworkError(error) {
  if (!error) {
    return 'error desconocido';
  }

  if (error instanceof AggregateError) {
    const baseMessage = (typeof error.message === 'string' && error.message.trim())
      ? error.message.trim()
      : (error.code ? `código ${error.code}` : 'error de red');
    const nested = Array.isArray(error.errors)
      ? error.errors.map(inner => formatNetworkError(inner)).filter(Boolean)
      : [];
    if (nested.length > 0) {
      return `${baseMessage} (${nested.join('; ')})`;
    }
    return baseMessage;
  }

  if (typeof error.message === 'string' && error.message.trim()) {
    return error.message.trim();
  }
  if (error.code) {
    return `código ${error.code}`;
  }
  return String(error);
}

function readFileSafe(filePath, errors) {
  try {
    return fs.readFileSync(filePath, 'utf8');
  } catch (error) {
    errors.push(`No se pudo leer ${filePath}: ${error.message}`);
    return null;
  }
}

function collectIndexLinks(html, errors) {
  if (!html) {
    return [];
  }
  const dom = new JSDOM(html);
  const { document } = dom.window;
  const entries = [];

  const selectors = [
    { selector: '.facebook-link', attr: 'href', label: 'Botón de Facebook' },
    { selector: '.instagram-link', attr: 'href', label: 'Botón de Instagram' }
  ];

  selectors.forEach(({ selector, attr, label }) => {
    document.querySelectorAll(selector).forEach(element => {
      const url = element.getAttribute(attr);
      entries.push({ url, context: `index.html → ${label}` });
    });
  });

  document.querySelectorAll('[data-href]').forEach(element => {
    const url = element.getAttribute('data-href');
    const tag = element.tagName ? element.tagName.toLowerCase() : 'elemento';
    entries.push({ url, context: `index.html → ${tag}[data-href]` });
  });

  return entries;
}

function collectHighlightLinks(jsonContent, errors) {
  if (!jsonContent) {
    return [];
  }
  try {
    const data = JSON.parse(jsonContent);
    const entries = [];

    const specials = Array.isArray(data.specialMenus) ? data.specialMenus : [];
    specials.forEach((item, index) => {
      entries.push({
        url: item?.url,
        context: `data/home-highlights.json → specialMenus[${index}].url`
      });
    });

    const updates = Array.isArray(data.socialUpdates) ? data.socialUpdates : [];
    updates.forEach((item, index) => {
      entries.push({
        url: item?.url,
        context: `data/home-highlights.json → socialUpdates[${index}].url`
      });
    });

    return entries;
  } catch (error) {
    errors.push(`No se pudo analizar data/home-highlights.json: ${error.message}`);
    return [];
  }
}

function validateUrlFormat(url) {
  if (typeof url !== 'string' || url.trim().length === 0) {
    return 'falta una URL';
  }
  const trimmed = url.trim();
  if (!/^https?:\/\//i.test(trimmed)) {
    return 'debe comenzar con http:// o https://';
  }
  try {
    // Validar que el URL sea parseable.
    new URL(trimmed);
  } catch (error) {
    return `no es una URL válida (${error.message})`;
  }
  return null;
}

function httpRequest(url, method, redirectCount = 0) {
  return new Promise((resolve, reject) => {
    if (redirectCount > MAX_REDIRECTS) {
      reject(new Error('demasiadas redirecciones'));
      return;
    }

    const parsed = new URL(url);
    const client = parsed.protocol === 'https:' ? https : http;

    const request = client.request(
      {
        method,
        protocol: parsed.protocol,
        hostname: parsed.hostname,
        port: parsed.port,
        path: parsed.pathname + parsed.search,
        timeout: NETWORK_TIMEOUT_MS,
        headers: {
          'User-Agent': 'gereni-menu-link-check/1.0',
          'Accept': 'text/html,application/json;q=0.9,*/*;q=0.8'
        }
      },
      response => {
        const { statusCode, headers } = response;
        response.resume();

        if (statusCode === undefined) {
          reject(new Error('respuesta sin código de estado'));
          return;
        }

        if (statusCode >= 200 && statusCode < 400) {
          resolve();
          return;
        }

        if (SUCCESS_STATUS_CODES.has(statusCode)) {
          resolve();
          return;
        }

        if (
          statusCode >= 300 &&
          statusCode < 400 &&
          headers.location
        ) {
          const nextUrl = new URL(headers.location, parsed).toString();
          httpRequest(nextUrl, method, redirectCount + 1).then(resolve).catch(reject);
          return;
        }

        if ((statusCode === 405 || statusCode === 501) && method === 'HEAD') {
          httpRequest(url, 'GET', redirectCount).then(resolve).catch(reject);
          return;
        }

        reject(new Error(`HTTP ${statusCode}`));
      }
    );

    request.on('timeout', () => {
      request.destroy(new Error('tiempo de espera agotado'));
    });

    request.on('error', reject);
    request.end();
  });
}

async function verifyUrlReachable(url) {
  try {
    await httpRequest(url, 'HEAD');
  } catch (error) {
    throw error;
  }
}

async function main() {
  const formatErrors = [];
  const networkErrors = [];

  const indexHtml = readFileSafe(INDEX_PATH, formatErrors);
  const highlightsJson = readFileSafe(HIGHLIGHTS_PATH, formatErrors);

  const entries = [
    ...collectIndexLinks(indexHtml, formatErrors),
    ...collectHighlightLinks(highlightsJson, formatErrors)
  ];

  const urlMap = new Map();

  entries.forEach(({ url, context }) => {
    const formatError = validateUrlFormat(url);
    if (formatError) {
      formatErrors.push(`${context}: ${formatError}`);
      return;
    }
    const normalized = url.trim();
    if (!urlMap.has(normalized)) {
      urlMap.set(normalized, new Set());
    }
    urlMap.get(normalized).add(context);
  });

  if (!skipNetworkCheck) {
    for (const [url, contexts] of urlMap.entries()) {
      try {
        await verifyUrlReachable(url);
      } catch (error) {
        networkErrors.push(`${[...contexts].join(', ')}: ${formatNetworkError(error)}`);
      }
    }
  }

  if (formatErrors.length > 0 || networkErrors.length > 0) {
    console.error('❌ Validación de enlaces sociales falló.');
    if (formatErrors.length > 0) {
      console.error('\nProblemas de formato:');
      formatErrors.forEach(message => console.error(`  - ${message}`));
    }
    if (networkErrors.length > 0) {
      console.error('\nProblemas de red o accesibilidad:');
      networkErrors.forEach(message => console.error(`  - ${message}`));
    }
    process.exitCode = 1;
    return;
  }

  if (skipNetworkCheck) {
    console.log('⚠️ Validación de enlaces sociales completada (verificación de red omitida).');
    return;
  }

  console.log(`✔ Validación de ${urlMap.size} enlace(s) sociales completada.`);
}

main().catch(error => {
  console.error('❌ Error inesperado en la validación de enlaces sociales:', error);
  process.exitCode = 1;
});

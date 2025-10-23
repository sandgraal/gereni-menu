// ai/scripts/analytics.mjs
import { existsSync, mkdirSync, appendFileSync, readFileSync } from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const MENU_JSON = path.join(ROOT, 'data', 'menu.json');
const LOG_DIR = path.join(ROOT, 'ai', 'logs');
const LOG_FILE = path.join(LOG_DIR, 'menu-analytics.jsonl');

function parsePrice(value) {
  if (typeof value !== 'string') return null;
  const numeric = value.replace(/[^\d]/g, '');
  if (!numeric) return null;
  return Number.parseInt(numeric, 10);
}

function collectMetrics() {
  if (!existsSync(MENU_JSON)) {
    return {
      sections: 0,
      items: 0,
      price_min: null,
      price_max: null,
      price_avg: null,
      updated_at: null
    };
  }

  const data = JSON.parse(readFileSync(MENU_JSON, 'utf8'));
  const sections = Array.isArray(data.sections) ? data.sections : [];
  let items = 0;
  const prices = [];

  sections.forEach(section => {
    if (!section || !Array.isArray(section.items)) return;
    section.items.forEach(item => {
      items += 1;
      const price = parsePrice(item?.price);
      if (Number.isFinite(price)) {
        prices.push(price);
      }
    });
  });

  prices.sort((a, b) => a - b);
  const priceMin = prices.length > 0 ? prices[0] : null;
  const priceMax = prices.length > 0 ? prices[prices.length - 1] : null;
  const priceAvg = prices.length > 0 ? Math.round(prices.reduce((sum, value) => sum + value, 0) / prices.length) : null;

  return {
    sections: sections.length,
    items,
    price_min: priceMin,
    price_max: priceMax,
    price_avg: priceAvg,
    updated_at: data.updatedAt || null
  };
}

function appendLog(entry) {
  if (!existsSync(LOG_DIR)) {
    mkdirSync(LOG_DIR, { recursive: true });
  }
  appendFileSync(LOG_FILE, JSON.stringify(entry) + '\n', 'utf8');
}

function main() {
  const startedAt = Date.now();
  let status = 'ok';
  let metrics;
  let errorMessage = null;

  try {
    metrics = collectMetrics();
  } catch (error) {
    status = 'error';
    errorMessage = error.message;
    metrics = {
      sections: 0,
      items: 0,
      price_min: null,
      price_max: null,
      price_avg: null,
      updated_at: null
    };
  }

  const logEntry = {
    ts: new Date().toISOString(),
    ai_generated: true,
    agent: 'menu-analytics',
    status,
    duration_ms: Date.now() - startedAt,
    metrics,
    error: errorMessage
  };

  appendLog(logEntry);

  if (status === 'ok') {
    console.log('[analytics] Métricas registradas:', JSON.stringify(metrics));
    process.exit(0);
  } else {
    console.error('[analytics] Error al recopilar métricas:', errorMessage);
    process.exit(1);
  }
}

main();

// ai/scripts/data-sync.mjs
import { execFile } from 'node:child_process';
import { existsSync, appendFileSync, mkdirSync, readFileSync } from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const LOG_DIR = path.join(ROOT, 'ai', 'logs');
const LOG_FILE = path.join(LOG_DIR, 'menu-data.jsonl');
const MENU_JSON = path.join(ROOT, 'data', 'menu.json');

function runSyncMenu() {
  return new Promise((resolve, reject) => {
    const child = execFile('node', ['tools/sync-menu.js'], { stdio: 'inherit' });
    child.on('error', reject);
    child.on('exit', code => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`sync-menu.js exited with code ${code}`));
      }
    });
  });
}

function readMenuStats() {
  if (!existsSync(MENU_JSON)) {
    return { sections: 0, items: 0, updatedAt: null };
  }
  const raw = readFileSync(MENU_JSON, 'utf8');
  const data = JSON.parse(raw);
  const sections = Array.isArray(data.sections) ? data.sections : [];
  let itemCount = 0;
  sections.forEach(section => {
    if (section && Array.isArray(section.items)) {
      itemCount += section.items.length;
    }
  });
  return {
    sections: sections.length,
    items: itemCount,
    updatedAt: data.updatedAt || null
  };
}

function appendLog(entry) {
  if (!existsSync(LOG_DIR)) {
    mkdirSync(LOG_DIR, { recursive: true });
  }
  appendFileSync(LOG_FILE, JSON.stringify(entry) + '\n', 'utf8');
}

async function main() {
  const startedAt = Date.now();
  let status = 'ok';
  let errorMessage = null;

  try {
    await runSyncMenu();
  } catch (error) {
    status = 'error';
    errorMessage = error.message;
  }

  const durationMs = Date.now() - startedAt;
  const stats = readMenuStats();

  const logEntry = {
    ts: new Date().toISOString(),
    ai_generated: true,
    agent: 'menu-data',
    status,
    duration_ms: durationMs,
    sections: stats.sections,
    items: stats.items,
    updated_at: stats.updatedAt,
    error: errorMessage
  };

  appendLog(logEntry);

  if (status === 'ok') {
    console.log('[data] menu.json actualizado:', JSON.stringify(stats));
    process.exit(0);
  } else {
    console.error('[data] fallo al sincronizar el menú:', errorMessage);
    process.exit(1);
  }
}

main();

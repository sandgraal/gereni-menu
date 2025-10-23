// ai/scripts/package-render.mjs
import { execFile } from 'node:child_process';
import { existsSync, mkdirSync, appendFileSync, statSync, readdirSync } from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const OUTPUT_DIR = path.join(ROOT, 'output');
const LOG_DIR = path.join(ROOT, 'ai', 'logs');
const LOG_FILE = path.join(LOG_DIR, 'menu-packaging.jsonl');

function runExportMenu() {
  return new Promise((resolve, reject) => {
    const child = execFile('node', ['tools/export-menu.js'], { stdio: 'inherit' });
    child.on('error', reject);
    child.on('exit', code => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`export-menu.js exited with code ${code}`));
      }
    });
  });
}

function collectArtifacts() {
  if (!existsSync(OUTPUT_DIR)) {
    return [];
  }
  const entries = readdirSync(OUTPUT_DIR)
    .filter(name => name.toLowerCase().endsWith('.pdf'))
    .map(name => {
      const fullPath = path.join(OUTPUT_DIR, name);
      const stats = statSync(fullPath);
      return {
        file: name,
        bytes: stats.size,
        mtime: stats.mtime.toISOString()
      };
    });
  return entries.sort((a, b) => a.file.localeCompare(b.file));
}

function appendLog(entry) {
  if (!existsSync(LOG_DIR)) {
    mkdirSync(LOG_DIR, { recursive: true });
  }
  appendFileSync(LOG_FILE, JSON.stringify(entry) + '\n', 'utf8');
}

async function main() {
  const start = Date.now();
  let status = 'ok';
  let errorMessage = null;

  try {
    await runExportMenu();
  } catch (error) {
    status = 'error';
    errorMessage = error.message;
  }

  const artifacts = collectArtifacts();
  const logEntry = {
    ts: new Date().toISOString(),
    ai_generated: true,
    agent: 'menu-packaging',
    status,
    duration_ms: Date.now() - start,
    artifacts,
    error: errorMessage
  };

  appendLog(logEntry);

  if (status === 'ok') {
    console.log(`[packaging] Export completado. ${artifacts.length} PDFs listados.`);
    process.exit(0);
  } else {
    console.error('[packaging] Error al exportar el menú:', errorMessage);
    process.exit(1);
  }
}

main();

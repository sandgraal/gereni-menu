// ai/scripts/bootstrap.mjs
import { existsSync, writeFileSync, mkdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { execSync } from 'node:child_process';

function hasFile(path) { return existsSync(path); }
function readJSON(path, fallback = {}) {
  try { return JSON.parse(readFileSync(path, 'utf8')); } catch { return fallback; }
}

function ensureDir(dir) { if (!existsSync(dir)) mkdirSync(dir, { recursive: true }); }

function main() {
  console.log('[bootstrap] Node version:', process.version);
  if (!hasFile('package.json')) {
    console.warn('[bootstrap] package.json missing. Skipping npm install.');
  } else {
    console.log('[bootstrap] Installing dependencies via npm ci…');
    execSync('npm ci', { stdio: 'inherit' });
  }

  ensureDir('ai/logs');
  ensureDir('ai/_state');

  const siteCfgPath = 'ai/site-config.json';
  if (!hasFile(siteCfgPath)) {
    const cfg = {
      project_name: 'Gereni Menu',
      output_dir: 'output',
      build_script: 'build:fallback',
      default_branch: 'main',
      agents: ['menu-content','menu-image','menu-data','menu-packaging','menu-analytics'],
      logs_dir: 'ai/logs'
    };
    writeFileSync(siteCfgPath, JSON.stringify(cfg, null, 2));
    console.log('[bootstrap] Created ai/site-config.json');
  }

  const pkg = readJSON('package.json');
  const hasBuild = pkg?.scripts?.build;
  const hasFallback = pkg?.scripts?.['build:fallback'];
  if (hasBuild) {
    console.log('[bootstrap] Running npm run build…');
    execSync('npm run build', { stdio: 'inherit' });
  } else if (hasFallback) {
    console.log('[bootstrap] Running npm run build:fallback…');
    execSync('npm run build:fallback', { stdio: 'inherit' });
  } else {
    console.warn('[bootstrap] No build script found. Skipping build.');
  }

  console.log('[bootstrap] Done.');
}

main();

# Context Summary

## project_summary
- Static bilingual menu site for Gereni Bar y Restaurante with PWA support, seasonal UI, and automation scripts to sync Markdown to JSON plus exports.

## dependency_graph
- Frontend: vanilla HTML/JS/CSS served statically (`index.html`, `menu.html`), optional service worker for offline cache.
- Tooling: Node.js scripts (CommonJS) for data sync/validation (`tools/*.js`), tests using Puppeteer/JS DOM.
- Assets/data: content in `content/` and `data/`, images under `assets/`.

## commands_map
- Install: `npm install`
- Validate/build: `npm run check:all` (runs fallback build, precache, validations, and tests)
- Focused scripts: `npm run check:menu`, `npm run check:prices`, `npm run check:social`
- Tests: `npm run test:*` (sync, scroll, a11y, service worker, precache, home actions, promos, markdownlint)
- Assets/build: `npm run build:promos`, `npm run build:fallback`, `npm run build:precache`, `npm run build:images`, `npm run export:menu`

## key_paths_by_feature
- Language/i18n handling: `scripts/i18n.js`
- Seasonal/holiday UI: `scripts/seasonalMode.js`, styles in `styles/`
- Menu data and rendering: `content/menu.md`, `data/menu.json`, `scripts/loadMenu.js`, `menu.html`
- PWA/offline: `service-worker.js`, precache utilities in `tools/generate-precache-urls.js`
- Automation/tests: `tools/*.js`, `tests/*.test.js`

## known_constraints and feature_flags
- Seasonal effects activate only within Thanksgiving-to-year-end window defined in `scripts/seasonalMode.js`.
- Language options limited to Spanish/English with persistence via `localStorage` (`scripts/i18n.js`).
- Automation assumes Node.js ≥18; puppeteer/sharp dependencies may require native binaries.

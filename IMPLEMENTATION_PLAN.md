# Implementation Roadmap — Gereni Menu

## 1. Snapshot of Current Feature Set
- **Editable content pipeline:** Menu text is authored in Markdown (`content/menu.md`) and synced to JSON via `tools/sync-menu.js` for web rendering.【F:README.md†L9-L18】【F:tools/sync-menu.js†L1-L104】
- **Validation & QA tooling:** Automated checks through `npm run check:all`, including price validation (`tools/validate-prices.js`) and render smoke tests (`tools/check-menu-render.js`).【F:README.md†L24-L31】【F:tools†L1-L1】
- **PDF export automation:** `npm run export:menu` and GitHub Actions workflow generate print and digital variants in `output/`.【F:README.md†L33-L40】
- **Design assets & licensing:** Canva templates and license tracking housed under `design/canva/`.【F:README.md†L16-L18】
- **Operational workflow:** Roles, branching strategy, and publication checklist defined in `workflow.md` and supporting reminders in `workflow/`.【F:workflow.md†L1-L43】

## 2. Completed Work
| Capability | Status | Owner | Acceptance Evidence |
| --- | --- | --- | --- |
| Markdown ➝ JSON synchronization (`tools/sync-menu.js`) | ✅ Complete | Soporte técnico | Menu content renders via `menu.html` using generated `data/menu.json`; script handles bilingual text and image mapping.【F:README.md†L12-L18】【F:tools/sync-menu.js†L1-L115】 |
| Price format validation (`tools/validate-prices.js`) | ✅ Complete | Soporte técnico | `npm run check:all` passes for current dataset with currency format `₡0.000`. Reference: `tools/validate-prices.js` implementation and usage notes in README.【F:README.md†L12-L18】【F:README.md†L24-L31】 |
| PDF export workflow (`npm run export:menu`, GitHub Actions) | ✅ Complete | Diseño/Maquetación + Soporte técnico | Print and digital PDFs exported to `output/`; automation described in README and workflow guidelines.【F:README.md†L33-L40】【F:workflow.md†L21-L28】 |
| Canva template governance | ✅ Complete | Diseño/Maquetación | Template access and licensing documented under `design/canva/`.【F:README.md†L16-L18】 |
| Operational playbook | ✅ Complete | Soporte técnico | Roles, branching strategy, emergency playbook captured in `workflow.md`.【F:workflow.md†L1-L43】 |
| Contributor onboarding checklist | ✅ Complete | Soporte técnico | `docs/contributor-onboarding.md` published and linked from README for new collaborators.【F:docs/contributor-onboarding.md†L1-L49】【F:README.md†L8-L33】 |

## 3. Outstanding Work & Roadmap

### 3.1 Content & Localization
| Task | Owner | Priority | Acceptance Criteria | References |
| --- | --- | --- | --- | --- |
| Expand bilingual coverage for any remaining single-language entries in `content/menu.md`. | Contenido | High | All menu items contain both Spanish and English variants before sync. | `content/menu.md`, `tools/sync-menu.js` parsing rules. |
| Establish routine for updating seasonal items and syncing Canva assets. | Contenido + Diseño/Maquetación | Medium | Seasonal changes captured in Markdown, mirrored in Canva, and noted in `workflow/reminders.md`. | `workflow/reminders.md`, `design/canva/template-link.md`. |

### 3.2 Automation & QA
| Task | Owner | Priority | Acceptance Criteria | References |
| --- | --- | --- | --- | --- |
| Add automated regression tests for `tools/sync-menu.js` (unit tests for parsing edge cases). | Soporte técnico | High | CI pipeline runs Node-based tests covering bilingual parsing, image retention, and error handling. | `tools/sync-menu.js`, potential test harness under `scripts/` or new `tests/`. |
| Extend `npm run check:all` to include link validation for social embeds (`index.html`). | Soporte técnico | Medium | Command fails if `data-href` URLs are invalid or unreachable; document override process in README. | `index.html`, `scripts/`, `README.md`. |
| Automate QR asset refresh via `tools/qr/generate.py` with documented schedule. | Soporte técnico | Low | Script runnable with documented parameters; QR codes stored in `assets/qr/` and logged in `workflow/reminders.md`. | `tools/qr/generate.py`, `assets/`, `workflow/reminders.md`. |

### 3.3 Distribution & Publishing
| Task | Owner | Priority | Acceptance Criteria | References |
| --- | --- | --- | --- | --- |
| Document release cadence aligned with tag convention `vYYYY.MM.menu`. | Soporte técnico | Medium | `workflow.md` updated with calendar, `handoff.md` references release cadence, tags applied during releases. | `workflow.md`, `handoff.md`. |
| Capture print vendor specs (bleed, color profile) for PDF exports. | Diseño/Maquetación | Medium | `design/` subfolder contains vendor requirements and is referenced from `README.md` and export instructions. | `design/`, `output/`. |

## 4. Dependencies & Cross-Team Touchpoints
- **Workflow alignment:** Keep `workflow/reminders.md` in sync with operational checklists and automation schedules.【F:workflow.md†L21-L43】
- **Design assets:** Coordinate with design team via `design/canva/` docs before modifying visual treatments or licensing.【F:README.md†L16-L18】
- **Deployment artifacts:** Ensure GitHub Actions pipeline remains aligned with export scripts (`tools/export-menu.js`) and storage in `output/`.

## 5. Next Steps
1. Prioritize high-impact automation tasks, starting with unit tests for `tools/sync-menu.js`.
2. Schedule cross-functional review covering seasonal content updates and export cadence.
3. Track progress using issue templates tied to roadmap sections and update `IMPLEMENTATION_PLAN.md` as milestones close, calling out dependencies like release cadence documentation and print vendor specs.

> For deeper context, consult `workflow/` for operational reminders, `design/` for visual assets, and `docs/` for technical guides.

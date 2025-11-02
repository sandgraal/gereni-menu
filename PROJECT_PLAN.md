# Overview

This document tracks all milestones and tasks for the standalone Gereni Menu site.  
Progress is managed through checkboxes. Each item should be marked `[x]` when complete.

To update progress:

1. Open this file.
2. Locate the relevant section.
3. Change `[ ]` to `[x]` once done.
4. Commit the update with message:  
   `git commit -am "Update project progress"`

---

## Phase 1: Stabilization (Week 1)

**Goal:** Ensure automations, exports, and content sync function end-to-end.

- [ ] Fix Puppeteer dependency (`libatk-1.0.so.0`)
- [ ] Re-run `npm run check:all` and `npm run export:menu`
- [ ] Verify generated PDFs under `output/`
- [ ] Validate QR link and image cache via `service-worker.js`

**Deliverables:**

- Working static build with verified data exports

---

## Phase 2: Design & Content Sync (Weeks 2–3)

**Goal:** Unify Canva template, design system, and menu data.

- [ ] Sync Canva template with latest text and palette
- [ ] Embed same fonts/colors into `menu.html`
- [ ] Verify QR block (60 × 60 mm, correct caption and link)
- [ ] Update `design/canva/licenses/README.md`

**Deliverables:**

- Updated design assets in `assets/`
- Complete license documentation

---

## Phase 3: Feature Enhancement (Weeks 4–5)

**Goal:** Add interactivity and analytics.

- [ ] Activate analytics via `ai/scripts/analytics.mjs`
- [ ] Extend `service-worker.js` to cache menu JSON and images

**Deliverables:**

- Analytics event logging operational

---

## Phase 4: Deployment & QA (Weeks 6–7)

**Goal:** Ship production-ready version.

- [ ] Add `.github/workflows/deploy.yml` for Netlify/Vercel
- [ ] Run Lighthouse audit for accessibility and SEO
- [ ] Test responsiveness across devices
- [ ] Publish v1.0 release with CHANGELOG and version tag

**Deliverables:**

- Live production deployment
- Verified accessibility and performance compliance

---

## Phase 5: Maintenance (Ongoing)

**Goal:** Keep content and automations stable post-launch.

- [ ] Schedule weekly JSON sync (`data/menu.json`)
- [ ] Review `workflow/reminders.md` and `handoff.md` after each update
- [ ] Maintain PDF export automation (`npm run export:menu`)
- [ ] Record changes in CHANGELOG.md

**Deliverables:**

- Sustainable update workflow with automated menu builds

---

## Agent Maintenance Backlog

**Goal:** Track follow-ups from the AI agent system review.

- [ ] Cleanup unused `join` import in `ai/scripts/bootstrap.mjs`
- [ ] Add `ai_generated: true` flag to `ai/scripts/log-agent-run.mjs`
- [ ] Guard missing `assets/photos` directory in `ai/scripts/image-optimize.mjs`
- [ ] Document optional queue structure in `ai/_state/` (add README or template)
- [ ] Improve currency parsing in `ai/scripts/analytics.mjs` to handle decimals

**Deliverables:**

- Consistent agent tooling that matches documentation guidance

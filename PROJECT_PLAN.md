# Project Plan — Gereni Menu

This file replaces `IMPLEMENTATION_PLAN.md` and `BACKLOG.md`.

## Overview
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

- [ ] Implement bilingual toggle (ES/EN) in `menu.html`
- [ ] Activate analytics via `ai/scripts/analytics.mjs`
- [ ] Extend `service-worker.js` to cache menu JSON and images
- [ ] Add collapsible sections for menu categories

**Deliverables:**
- Interactive bilingual PWA
- Analytics event logging operational

---

## Seasonal Activation: Halloween Takeover (Oct Sprint)
**Goal:** Ship an immersive Halloween experience for the hero panel before tomorrow's event.

- [x] Inject random spider scare overlay (`scripts/seasonalEffects.js`, `styles/main.css`)
- [x] Wire analytics event `halloween_spider_drop_seen`
- [ ] Prepare ambient audio toggle + asset handoff
- [ ] QA across Chrome, Safari, Android (see `content/halloween-experience-plan.md`)

**Deliverables:**
- Seasonal overlay with scalable scare factor
- QA checklist complete with fallback strategy

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

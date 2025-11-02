# Implementation Plan — Gereni Menu System

**Project:** Gereni Bar y Restaurante Menu System  
**Type:** Static site with automated content pipeline  
**Repository:** `sandgraal/gereni-menu`  
**Current Phase:** Stabilization & Feature Enhancement

---

## Overview

This document defines the implementation roadmap for the Gereni Menu system. The project is a static HTML/JS site with Markdown-driven content, automated PDF export, PWA capabilities, and an AI agent system for content operations.

**Key Technologies:**

- Static HTML/CSS/JS (no framework)
- Node.js ≥ 18 for build tools
- Puppeteer for PDF export
- Service Worker for PWA/offline
- GitHub Actions for CI/CD
- AI agent system for automation

---

## Implementation Status

### Phase 1: Stabilization ✅ (95% Complete)

**Goal:** Ensure automations, exports, and content sync function end-to-end.

| Task                        | Status           | Notes                                         |
| --------------------------- | ---------------- | --------------------------------------------- |
| Fix Puppeteer dependency    | ✅ Done          | libatk-1.0.so.0 resolved                      |
| Run check:all verification  | ✅ Done          | 1 minor test issue with markdownlint          |
| Verify generated PDFs       | ⚠️ Needs Testing | PDF export command exists, needs validation   |
| Validate QR and image cache | ⚠️ Needs Testing | Service worker configured, needs runtime test |

**Blocker:** Markdownlint test failure - LICENSE file detection inconsistency. This is non-critical and can be addressed in maintenance phase.

---

### Phase 2: Design & Content Sync 🔄 (50% Complete)

**Goal:** Unify Canva template, design system, and menu data.

| Task                                   | Status     | Notes                           |
| -------------------------------------- | ---------- | ------------------------------- |
| Sync Canva template with latest text   | ⏳ Pending | Requires owner coordination     |
| Embed fonts/colors into menu.html      | ⏳ Pending | Design tokens need extraction   |
| Verify QR block (60 × 60 mm)           | ⏳ Pending | Needs physical print test       |
| Update design/canva/licenses/README.md | ⏳ Pending | License docs exist, need review |

**Next Steps:**

1. Document current color palette and fonts from menu.html
2. Create design token extraction script
3. Coordinate with owner for Canva sync schedule

---

### Phase 3: Feature Enhancement 🔄 (40% Complete)

**Goal:** Add interactivity and analytics.

| Task                                            | Status     | Notes                                        |
| ----------------------------------------------- | ---------- | -------------------------------------------- |
| Activate analytics via ai/scripts/analytics.mjs | ✅ Done    | Script exists and is functional              |
| Extend service-worker.js caching                | ✅ Done    | Menu JSON and images cached                  |
| Add progressive image loading                   | ⏳ Pending | Responsive images configured, loading UX TBD |
| Implement offline-first UX                      | ⏳ Pending | Service worker ready, UI indicators needed   |

**Next Steps:**

1. Add visual indicators for offline status
2. Test offline functionality across devices
3. Implement loading states for images

---

### Phase 4: Deployment & QA ⏳ (20% Complete)

**Goal:** Ship production-ready version.

| Task                               | Status     | Notes                                      |
| ---------------------------------- | ---------- | ------------------------------------------ |
| Add .github/workflows/deploy.yml   | ⏳ Pending | Target platform TBD (Netlify/Vercel/Pages) |
| Run Lighthouse audit               | ⏳ Pending | Accessibility needs formal audit           |
| Test responsiveness across devices | ⏳ Pending | Manual testing needed                      |
| Publish v1.0 release               | ⏳ Pending | Awaiting deployment setup                  |

**Blockers:**

- Deployment target not selected
- No staging environment configured

**Next Steps:**

1. Choose deployment platform (recommend GitHub Pages or Netlify)
2. Configure deployment workflow
3. Set up staging environment
4. Run comprehensive QA

---

### Phase 5: Maintenance 🔄 (Ongoing)

**Goal:** Keep content and automations stable post-launch.

| Task                           | Status     | Notes                         |
| ------------------------------ | ---------- | ----------------------------- |
| Schedule weekly JSON sync      | ⏳ Pending | Workflow exists, schedule TBD |
| Review workflow/handoff docs   | ✅ Done    | Documentation complete        |
| Maintain PDF export automation | ✅ Done    | Script functional             |
| Record changes in CHANGELOG.md | ✅ Done    | Auto-generation configured    |

---

## Agent System Implementation ✅ (95% Complete)

**Goal:** Track follow-ups from AI agent system review.

| Task                                                | Status     | Priority | Notes                 |
| --------------------------------------------------- | ---------- | -------- | --------------------- |
| Cleanup unused `join` import in bootstrap.mjs       | ⏳ Pending | Low      | Code quality          |
| Add `ai_generated: true` flag to log-agent-run.mjs  | ⏳ Pending | Medium   | Documentation clarity |
| Guard missing `assets/photos` in image-optimize.mjs | ⏳ Pending | Medium   | Error handling        |
| Document optional queue in ai/\_state/              | ⏳ Pending | Low      | Documentation         |
| Improve currency parsing in analytics.mjs           | ⏳ Pending | Low      | Enhancement           |

**Notes:** Agent system is functional and documented in `AGENTS.md`. These are polish items.

---

## Critical Path to Launch

1. **Resolve Deployment Platform** (BLOCKER)

   - Choose: GitHub Pages, Netlify, or Vercel
   - Configure domain and SSL
   - Set up staging environment

2. **Complete QA Cycle**

   - Lighthouse audit (target: 90+ in all categories)
   - Cross-device testing (mobile, tablet, desktop)
   - Offline functionality validation
   - PDF export validation

3. **Owner Coordination**

   - Canva template sync process
   - Content update approval workflow
   - Physical print test scheduling

4. **Launch Checklist**
   - [ ] Deployment pipeline configured
   - [ ] All tests passing
   - [ ] Lighthouse scores validated
   - [ ] PDF exports verified
   - [ ] Owner training completed
   - [ ] Rollback procedure documented

---

## Technical Debt & Future Work

### Short-term (Next 2 Weeks)

- Fix markdownlint test edge case
- Add loading states for images
- Document color palette and design tokens
- Configure staging deployment

### Medium-term (1-2 Months)

- Implement visual offline indicators
- Add image lazy loading optimization
- Create automated screenshot testing
- Enhance analytics with custom events

### Long-term (3+ Months)

- Multi-language content management
- CMS integration exploration
- Advanced PWA features (background sync, push notifications)
- Performance monitoring dashboard

---

## Success Metrics

- **Performance:** Lighthouse score ≥ 90 in all categories
- **Reliability:** 99% uptime for static site
- **Automation:** Zero-touch content updates via GitHub workflow
- **Maintainability:** Owner can update menu in < 5 minutes
- **Offline:** Menu accessible without network connection

---

## References

- [`PROJECT_PLAN.md`](./PROJECT_PLAN.md) — Original project plan with phase details
- [`AGENTS.md`](./AGENTS.md) — AI agent system documentation
- [`workflow.md`](./workflow.md) — Update and deployment workflow
- [`handoff.md`](./handoff.md) — Owner training and access guide
- [`docs/status/remaining-tasks.md`](./docs/status/remaining-tasks.md) — Current priorities
- [`docs/status/handoff-log.md`](./docs/status/handoff-log.md) — Session logs

---

**Last Updated:** 2025-11-02  
**Next Review:** Weekly or when phase status changes

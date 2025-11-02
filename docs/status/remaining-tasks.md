# Remaining Tasks — Gereni Menu

**Last Updated:** 2025-11-02  
**Agent Session:** Initial check-in  
**Status:** Stabilization phase, preparing for deployment

---

## 🔴 Critical Blockers

### 1. Deployment Platform Not Selected
**Priority:** HIGH  
**Impact:** Blocks Phase 4 (Deployment & QA)  
**Estimated Effort:** 2-4 hours research + setup

**Context:**  
The project needs a production deployment target. Current options:
- **GitHub Pages** (free, simple, fits static site model)
- **Netlify** (free tier, excellent DX, better build logs)
- **Vercel** (free tier, optimized for performance)

**Decision Needed:**
- Which platform aligns with owner's technical comfort level?
- Domain configuration requirements (custom domain or subdomain?)
- SSL certificate handling

**Next Actions:**
- [ ] Research platform costs and limitations
- [ ] Compare deployment complexity
- [ ] Draft `.github/workflows/deploy.yml` for chosen platform
- [ ] Document deployment process in `workflow.md`

**Can I Resolve This?** Partially - I can create draft workflows for all three platforms and document trade-offs, but final selection requires owner input.

---

### 2. PDF Export Validation
**Priority:** MEDIUM-HIGH  
**Impact:** Core feature untested in current environment  
**Estimated Effort:** 1-2 hours

**Context:**  
The `npm run export:menu` command exists and Puppeteer dependencies are resolved, but we haven't validated:
- PDF output quality and formatting
- Page breaks and layout
- Print color accuracy vs screen
- File size optimization

**Next Actions:**
- [ ] Run `npm run export:menu` and inspect output
- [ ] Compare PDF to Canva template for consistency
- [ ] Test print output on physical printer (requires owner)
- [ ] Document any layout or quality issues

**Can I Resolve This?** Yes - I can validate digital PDF output and identify issues. Physical print testing requires owner coordination.

---

### 3. Markdownlint Test Failure
**Priority:** LOW (non-blocking)  
**Impact:** CI test suite shows 1 failure  
**Estimated Effort:** 30 minutes

**Context:**  
Test `LICENSE file is ignored by markdownlint` fails intermittently. The LICENSE file is properly ignored in `.markdownlintignore`, but the test's validation logic has an edge case.

**Diagnosis:**  
The test creates a temporary ignore file to verify LICENSE would fail without ignoring, but `npx markdownlint` may not process LICENSE as markdown by default.

**Next Actions:**
- [ ] Review test logic in `tests/markdownlint-config.test.js`
- [ ] Adjust test to properly detect LICENSE file exclusion
- [ ] Consider simplifying test or adding explicit file extension check

**Can I Resolve This?** Yes - This is purely a test logic issue.

---

## 🟡 High Priority (Next Sprint)

### 4. Owner Coordination for Canva Sync
**Priority:** HIGH (Phase 2 dependency)  
**Impact:** Design consistency between digital and print  
**Estimated Effort:** 30 minutes setup + owner time

**Context:**  
The Canva template needs to be synchronized with the latest menu content. This requires:
- Owner access to Canva template
- Understanding of which elements to update
- Process for exporting updated assets

**Next Actions:**
- [ ] Review `design/canva/guide.md` for current process
- [ ] Create checklist for Canva update workflow
- [ ] Identify which menu changes require Canva updates
- [ ] Document color palette and typography specifications

**Can I Resolve This?** Partially - I can document the process and create checklists, but execution requires owner action.

---

### 5. Design Token Extraction
**Priority:** MEDIUM  
**Impact:** Enables programmatic design consistency  
**Estimated Effort:** 2-3 hours

**Context:**  
Current colors, fonts, and spacing are hardcoded in CSS. Extracting to design tokens would:
- Enable consistent styling across web and print
- Simplify theme customization
- Support future design system evolution

**Next Actions:**
- [ ] Audit `styles/main.css` for color variables
- [ ] Document current typography scale
- [ ] Create `design/tokens.json` with extracted values
- [ ] Update CSS to reference token values
- [ ] Add script to sync tokens to Canva documentation

**Can I Resolve This?** Yes - This is purely technical work.

---

### 6. Lighthouse Audit Baseline
**Priority:** MEDIUM  
**Impact:** Establishes performance and accessibility baseline  
**Estimated Effort:** 1 hour

**Context:**  
We need a baseline Lighthouse audit to:
- Identify performance bottlenecks
- Find accessibility issues
- Establish SEO score
- Track improvement over time

**Next Actions:**
- [ ] Run Lighthouse on `menu.html` in development
- [ ] Document scores in `docs/operations/performance-reports/`
- [ ] Create GitHub issue for each score below 90
- [ ] Prioritize fixes by impact

**Can I Resolve This?** Yes - I can run the audit and document findings.

---

## 🟢 Medium Priority (Future Sprints)

### 7. Offline UI Indicators
**Priority:** MEDIUM  
**Impact:** User experience enhancement  
**Estimated Effort:** 2-3 hours

**Context:**  
Service worker provides offline functionality, but users have no visual feedback about:
- Current online/offline status
- When content was last updated
- Whether cached version is being served

**Next Actions:**
- [ ] Design simple status indicator UI
- [ ] Add connection status detection
- [ ] Show cache timestamp
- [ ] Add "Update available" notification

**Can I Resolve This?** Yes - Pure frontend work.

---

### 8. Responsive Image Loading States
**Priority:** MEDIUM  
**Impact:** Perceived performance improvement  
**Estimated Effort:** 2 hours

**Context:**  
Images load without visual feedback. Adding loading states would:
- Improve perceived performance
- Reduce layout shift
- Provide better UX on slow connections

**Next Actions:**
- [ ] Add skeleton loaders for images
- [ ] Implement progressive image loading
- [ ] Add blur-up technique for hero images
- [ ] Test on throttled connection

**Can I Resolve This?** Yes - Frontend implementation.

---

### 9. Agent System Polish Items
**Priority:** LOW  
**Impact:** Code quality and documentation  
**Estimated Effort:** 1-2 hours total

**Context:**  
Agent system backlog from `PROJECT_PLAN.md`:

**Next Actions:**
- [ ] Remove unused `join` import in `ai/scripts/bootstrap.mjs`
- [ ] Add `ai_generated: true` flag to `ai/scripts/log-agent-run.mjs` outputs
- [ ] Add guard for missing `assets/photos` in `ai/scripts/image-optimize.mjs`
- [ ] Create `ai/_state/README.md` documenting queue structure
- [ ] Enhance currency parsing in `ai/scripts/analytics.mjs`

**Can I Resolve This?** Yes - All technical, no blockers.

---

## 📋 Quick Wins (Can Complete This Session)

### A. Fix Markdownlint Test
- **Time:** 30 min
- **Files:** `tests/markdownlint-config.test.js`
- **Value:** Clean test suite, eliminates CI noise

### B. Run and Document PDF Export
- **Time:** 1 hour
- **Commands:** `npm run export:menu`
- **Value:** Validates core feature, identifies issues

### C. Initial Lighthouse Audit
- **Time:** 1 hour
- **Output:** `docs/operations/performance-reports/baseline-2025-11-02.md`
- **Value:** Establishes performance baseline

### D. Clean Agent System Code
- **Time:** 1 hour
- **Files:** `ai/scripts/*.mjs`
- **Value:** Improved code quality, better error handling

---

## 🎯 Recommended Session Focus

**If I have 2-4 hours, prioritize:**

1. **Fix markdownlint test** (30 min) - Quick win, clean build
2. **Validate PDF export** (1 hour) - Core feature validation
3. **Run Lighthouse audit** (1 hour) - Establish baseline
4. **Draft deployment workflows** (1 hour) - Unblock Phase 4

**If I have 1-2 hours, prioritize:**

1. **Fix markdownlint test** (30 min)
2. **Validate PDF export** (1 hour)
3. **Document findings** (30 min)

---

## 📝 Notes for Next Session

- Test suite is mostly healthy (1 minor failure)
- All build tools are functional
- Service worker and PWA features are configured
- Main blocker is deployment platform selection
- Owner coordination needed for Canva sync and print testing

---

## 🔗 Related Documents

- [`implementation_plan.md`](../../implementation_plan.md) — Full roadmap
- [`PROJECT_PLAN.md`](../../PROJECT_PLAN.md) — Original project plan
- [`docs/status/handoff-log.md`](./handoff-log.md) — Session history
- [`workflow.md`](../../workflow.md) — Update procedures

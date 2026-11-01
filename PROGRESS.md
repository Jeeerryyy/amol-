# AMOL VEG RESTO - Audit & Handover Progress

## Overall Status: IN PROGRESS
**Branch:** `chore/audit-and-handover`  
**Baseline Git Tag:** `pre-handover-baseline`  
**Testing Target:** Zero defects, evidence-backed verification, frozen public design, handover documentation.

---

### Phase 0: Baseline & Reference Capture
- [x] Record environment baseline (Node v26.7.0, npm 11.19.0, Vite 6.4.5, Express 5.3.0, React 18.3.1)
- [x] Tag baseline commit `pre-handover-baseline`
- [x] Create branch `chore/audit-and-handover`
- [x] Capture visual baseline across 10 pages x 4 viewports (40 screenshots stored in `baseline-screenshots/`)
- [x] Run baseline test suite (`node scripts/test-admin-suite.js` - 25 passed, 0 failed)

### Phase 1: Complete Inventory
- [x] Inventory all routes and pages (`/`, `#/about`, `#/gallery`, `#/contact`, `#/privacy-policy`, `#/terms-and-conditions`, `#/review`, `/menu/`, `/special-menu`, `/q/:code`, `/admin`)
- [x] Inventory all API endpoints (11 public/operational, 3 auth, 24 admin management)
- [x] Inventory database schema (18 tables, indexes, dual Postgres/SQLite support)
- [x] Inventory environment variables and third-party services
- [x] Report hardcoded values that look dynamic (`3.9 on Google, 253 reviews`, static testimonial cards, hero title, our story narrative)
- [x] Documented in `docs/INVENTORY.md`

### Phase 2: Static Checks
- [ ] TypeScript typecheck (`npx tsc -b`) - zero errors
- [ ] ESLint / linting check
- [ ] Production build verification
- [ ] Dependency security audit (`npm audit`)
- [ ] Unused dependencies, dead code, circular imports audit
- [ ] Check robots.txt, sitemap/favicon, assets integrity

### Phase 3: Runtime Audit with Playwright
- [ ] End-to-end audit of public home page (all links, buttons, carousels, modals)
- [ ] End-to-end audit of `/menu/` and `/special-menu` (tabs, search, modal variants, tags, video, reviews)
- [ ] Dynamic QR redirect engine audit (`/q/:code`, scan logging, rate limits, 503 disabled state)
- [ ] Review system audit (stars, chips, instant draft, AI streaming, clipboard copy, Google link)
- [ ] Full Admin panel audit (Login, Dashboard, QR Codes, Menus, Website, Reviews, Settings)
- [ ] Edge cases, security checks, and input sanitization

### Phase 4: Triage & Fix
- [ ] Classify all findings (Blocker, Critical, Major, Minor, Cosmetic)
- [ ] Implement targeted fixes for all Blockers, Critical, and Major issues
- [ ] Re-verify with automated tests
- [ ] Maintain lean permanent smoke test suite in `tests/smoke.spec.js`

### Phase 5: Cleanup & Restructure
- [ ] Clean up redundant/unreferenced backup files and scripts
- [ ] Organize design reference assets into `docs/design-reference/`
- [ ] Ensure single package manager and pristine `package.json`

### Phase 6: Documentation
- [ ] Professional GitHub showcase `README.md` (<120 lines, tech stack, Mermaid diagram, screenshots)
- [ ] Technical guide `docs/HANDOVER.md`
- [ ] Restaurant owner manual `docs/ADMIN_GUIDE.md`
- [ ] Exhaustive audit report `docs/AUDIT_REPORT.md`

### Phase 7: Final Verification & Handover
- [ ] Final smoke tests and visual regression verification against baseline
- [ ] Present 6-point handover report to user

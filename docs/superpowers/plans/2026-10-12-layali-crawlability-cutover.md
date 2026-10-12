# Layali Al Zahra Homepage Crawlability and Content Cutover Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make published database-backed homepage review text available in crawlable HTML and migrate public services, offers, packages, FAQs and reviews only after safe staging acceptance.

**Architecture:** First run a focused rendering feasibility spike against the existing Vite SPA and Vercel rewrites. Select the least invasive approach only after verifying it preserves routes, security headers and current page output. Keep a fallback to existing static snapshots and do not cut over public pages without owner approval.

**Tech Stack:** Existing Vite/React app, Vercel serverless/runtime configuration, MongoDB-backed public APIs; any SSR/prerender dependency requires a separate justification and build test.

**Spec:** `docs/superpowers/specs/2026-10-12-layali-cms-expansion-design.md`

## Global Constraints

- Depends on approved core CMS plan and review sync/publishing acceptance.
- Published review text must be crawlable; unpublished records must never appear in public HTML or APIs.
- Do not promise rankings or review-star rich results.
- Preserve page layout, routes, canonical/meta behavior, booking URLs and current content.
- Keep a safe fallback until the owner explicitly approves cutover.
- No production cutover or deployment claim without direct verification.

## Review Focus

1. Unpublished reviews must not leak through SSR HTML, cached responses or public API.
2. A database/network failure must fall back to the existing reviewed static snapshot instead of a blank homepage.
3. The Vercel SPA rewrites must not shadow or break any new SSR/HTML handler.
4. Canonical URLs and page metadata must remain stable after rendering changes.
5. A migration must be repeatable and must not duplicate, reorder or alter existing public content.

---

### Task 1: Validate crawlable rendering options before choosing an implementation

**Files:**
- Inspect: `vite.config.*`, `src/main.tsx`, `src/App.tsx`, `index.html`, `vercel.json`, Vercel project build/runtime settings
- Create: `docs/superpowers/research/2026-10-12-homepage-crawlability-spike.md`
- Test: `tests/rendering/homepage-crawlability.test.*` (selected after approach is chosen)

- [ ] **Step 1: Capture current baseline**
  - Record homepage response headers/status, initial HTML, current review section output, route behavior and metadata on the intended staging project.
- [ ] **Step 2: Compare compatible approaches**
  - Evaluate minimal SSR for homepage only, a Vercel serverless homepage handler with React rendering, or an established prerender approach compatible with this repository.
  - Include build/runtime impact, dynamic data freshness, caching, fallback and route/CSP interactions.
- [ ] **Step 3: Run a small proof of concept**
  - Demonstrate the selected candidate can render one published review into returned HTML while omitting one unpublished review.
  - Do not connect production review data or change the public route.
- [ ] **Step 4: Record recommendation and owner gate**
  - Document measured result, required dependencies and rollback behavior.
  - If the least invasive solution cannot preserve current behavior, stop and return the trade-off for approval before expanding scope.

### Task 2: Implement and verify the approved crawlable rendering path

**Files:**
- Exact file list is selected only after Task 1 proves the rendering approach.
- Test: `tests/rendering/homepage-crawlability.test.*`

- [ ] **Step 1: Write failing rendered-output tests**
  - Assert published review text and author are present in initial HTML; unpublished review text is absent; HTML escapes review content; public response handles empty results and provider/database failure.
- [ ] **Step 2: Run tests and confirm failure**
  - Use the selected renderer's test command; expected FAIL until the server-rendered/prerendered path exists.
- [ ] **Step 3: Implement the narrowest route/rendering change**
  - Avoid converting the whole site to SSR unless the spike proves that is the only safe option and the owner approves the scope.
- [ ] **Step 4: Run tests, build and route regression checks**
  - Run `npm test && npm run build`, then check homepage HTML and every route currently listed in `vercel.json`.
- [ ] **Step 5: Verify crawler-facing output**
  - Fetch the staging homepage as HTML and verify published review text is present and unpublished data is absent. A browser DOM alone is not sufficient evidence.

### Task 3: Migrate and switch public page data one module at a time

**Files:**
- Modify: `src/components/ServicesPage.tsx`, `src/components/OffersPage.tsx`, `src/components/PackagesPage.tsx`, `src/components/HomePage.tsx`
- Modify only after approval: `vercel.json` and renderer files selected in Task 1
- Test: `tests/public/managed-content-rendering.test.tsx`

- [ ] **Step 1: Write regression tests against current display**
  - Verify services/subservices, offer cards and recurring validity labels, package category filters, FAQs, homepage showcase cards, booking URLs and published review ordering.
- [ ] **Step 2: Switch one data family at a time**
  - Add a narrowly scoped feature switch or fallback: use published database data only after a successful, validated read; otherwise retain the source snapshot.
- [ ] **Step 3: Run tests and build after each family**
  - Run: `npm test && npm run build`.
  - Expected: tests pass with no public visual/content differences beyond explicitly approved database edits.
- [ ] **Step 4: Verify staging routes and crawler HTML**
  - Check desktop/mobile, source HTML, API responses, metadata, CSP/security headers and booking destinations.
- [ ] **Step 5: Stop for owner acceptance**
  - Do not change production domain or switch final live source until the owner explicitly approves the verified staging result.

### Task 4: Release and rollback readiness

- [ ] **Step 1:** Confirm current Vercel project/branch and repository visibility; do not assume Git branch equals production domain.
- [ ] **Step 2:** Record pre-release commit, migration counts, test/build output and fallback method.
- [ ] **Step 3:** Obtain explicit release approval before any production cutover.
- [ ] **Step 4:** After release, verify public routes and actual returned HTML/API behavior in the target environment.
- [ ] **Step 5:** Update BRD and Notion log with verified deployment details and rollback status.

---
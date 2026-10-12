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
- **Owner-confirmed release hold (2026-10-12):** Vercel is disconnected and current feature-branch changes are not deployed. Do not reconnect Vercel or trigger deployment during implementation. Use local/source-level proof of concept first; defer any staging/deployed HTML check until the final controlled release window and explicit owner approval. Preserve the daily free deployment allowance.

## Review Focus

1. Unpublished reviews must not leak through SSR HTML, cached responses or public API.
2. **Two distinct fallback cases must be tested separately:** managed-review lookup failure in managed mode intentionally returns an empty review list and does not restore legacy reviews; a generic homepage SSR render exception returns HTTP 500 with a plain-text error and `Cache-Control: no-store` (Task 19; CI passed).
3. The Vercel SPA rewrites must not shadow or break any new SSR/HTML handler.
4. Canonical URLs and page metadata must remain stable after rendering changes.
5. A migration must be repeatable and must not duplicate, reorder or alter existing public content.

---

### Task 1: Validate crawlable rendering options before choosing an implementation

**Files:**
- Inspect: `vite.config.*`, `src/main.tsx`, `src/App.tsx`, `index.html`, `vercel.json`, Vercel project build/runtime settings
- Create: `docs/superpowers/research/2026-10-12-homepage-crawlability-spike.md`
- Test: `tests/rendering/homepage-crawlability.test.*` (selected after approach is chosen)

- [x] **Step 1: Capture current baseline from source**
  - Source baseline only: index.html contains metadata and JSON-LD, while the body starts with an empty #root and React renders the visible content. A live/staging response-header or crawler fetch remains pending; do not reconnect Vercel.
- [x] **Step 2: Compare compatible approaches**
  - Evaluate minimal SSR for homepage only, a Vercel serverless homepage handler with React rendering, or an established prerender approach compatible with this repository.
  - The research note compares client-side fetch, static-fragment injection, SSR/hydration and build-time prerender, including data freshness, hydration, rewrite/CSP and fallback risks.
- [x] **Step 3: Run the homepage SSR/hydration proof of concept**
  - Implemented a route-aware React SSR entry, hydration path, server handler on the existing catch-all API function, root and /home rewrites, and a built-server smoke test. The handler renders only published reviews, excludes suppression IDs, escapes hydration data and preserves the old hard-coded review fallback while MANAGED_HOME_REVIEWS_ENABLED is false.
  - Build verification [38259645839](https://github.com/layalialzahra/layali-al-zahra-website/actions/runs/38259645839) passed tests, dependency audit, client build, SSR build and the built-server smoke test. No live DB or Vercel deployment was used.
- [x] **Step 4: Record recommendation and owner gate**
  - The research note records the component-level result and recommends continuing with a route-aware SSR/hydration proof before any public-root change. Vercel remains disconnected until the final approved release window.
  - If the least invasive solution cannot preserve current behavior, stop and return the trade-off for approval before expanding scope.

### Task 2: Implement and verify the approved crawlable rendering path

**Files:**
- Exact file list is selected only after Task 1 proves the rendering approach.
- Test: `tests/rendering/homepage-crawlability.test.*`

- [x] **Step 1: Add rendered-output regression tests**
  - Assert published review text and author are present in initial HTML; unpublished review text is absent; HTML escapes review content; public response handles empty results and provider/database failure.
- [x] **Step 2: Run rendered-output regression tests**
  - Use the selected renderer's test command; expected FAIL until the server-rendered/prerendered path exists.
- [x] **Step 3: Implement the narrowest route/rendering change**
  - Avoid converting the whole site to SSR unless the spike proves that is the only safe option and the owner approves the scope.
- [x] **Step 4: Run tests, build and local route regression checks**
  - Run `npm test && npm run build`, then check homepage HTML and every route currently listed in `vercel.json`.
- [ ] **Step 5: Verify crawler-facing output in the approved target environment**
  - During the approved final verification window, fetch the target homepage as HTML and verify published review text is present and unpublished data is absent. A browser DOM alone is not sufficient evidence. This check is pending while Vercel remains disconnected.

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

## Current acceptance status — 2026-10-12
- Source-level baseline recorded: static title/description/canonical/social metadata and JSON-LD exist in index.html, but the body content root is empty until the React app renders. That means static metadata is present; it does not prove review or CMS content is present in crawler-facing HTML.
- The strict script CSP change is implemented and passed tests/build in [run 38255367374](https://github.com/layalialzahra/layali-al-zahra-website/actions/runs/38255367374). It does not itself solve crawlability.
- **Historical status (superseded by the local SSR implementation section below):** compare SSR/prerender options and build a local proof of concept. Route-aware SSR/hydration and rendered-output assertions have since been implemented and passed CI; deployed crawler-facing HTTP acceptance remains pending. No staging or live URL was accessed.
- Vercel remains disconnected until project completion and explicit release approval. Do not deploy to test crawler output.


## Latest POC evidence — 2026-10-12
- Build/test/audit: [38256652658](https://github.com/layalialzahra/layali-al-zahra-website/actions/runs/38256652658) passed.
- Reachable-history text/binary scan: [38256652699](https://github.com/layalialzahra/layali-al-zahra-website/actions/runs/38256652699) passed with zero findings (371 commits / ~117.20 MB; 118 binary blobs / 170,446,401 bytes).
- Remaining: route-aware server entry and hydration, fetching only published reviews for initial HTML, HTML escaping/metadata/fallback regression tests, and later crawler-facing HTTP verification. Do not deploy or reconnect Vercel to perform this work.


## Local SSR implementation evidence — 2026-10-12
- Route-aware SSR/hydration is implemented on the feature branch without adding a new serverless function entrypoint. The root and legacy /home alias rewrite to the existing catch-all function.
- Tests cover published-only output, unpublished review exclusion, suppression filtering, safe hydration-data encoding, fallback behavior and fail-closed behavior when managed data is unavailable.
- The built SSR handler smoke test checks the actual built template, canonical metadata, initial homepage content and absence of hidden opacity:0 carousel content.
- Live HTTP/crawler verification remains intentionally pending until the approved final verification window. Do not reconnect or deploy Vercel early.

## Documentation reconciliation checkpoint — 2026-10-12

- Audited HEAD before this documentation commit: `046c4b7e4b5a7629fc860538b6d37b0e3b969e48`. Build/test/audit passed in [run 38259999486](https://github.com/layalialzahra/layali-al-zahra-website/actions/runs/38259999486); historical text/binary printable-string scan passed in [run 38259999483](https://github.com/layalialzahra/layali-al-zahra-website/actions/runs/38259999483).
- Route-aware SSR/hydration is implemented locally, but actual Vercel rewrite/function packaging, live database access and crawler-facing HTTP output remain unverified. Vercel remains disconnected by owner instruction.
- Confirmed gap: generic SSR render exceptions currently produce a static HTML shell with empty `#root` and HTTP 200. Main-branch comparison confirms the shell can recover client-side in a browser using the existing hard-coded homepage, but it provides no homepage content in initial HTML. The approved specification does not define generic SSR-exception behavior. See [Task 19 fallback decision](../../HOMEPAGE-SSR-FALLBACK-DECISION-2026-10-13.md). Do not implement a behavior by assumption; obtain the owner’s choice, then add regression tests. Keep this separate from the intentional managed-review lookup fail-closed behavior.
- Plan-sequence deviation: this SSR implementation preceded Core CMS Task 6 and live Google Reviews acceptance. No cutover/deployment is implied. Next approved task remains Core CMS Task 6.

## Task 01 status reconciliation (2026-10-12)

- Route-aware SSR/hydration exists on the feature branch and passed build/tests/local built-server smoke in [38259645839](https://github.com/layalialzahra/layali-al-zahra-website/actions/runs/38259645839) on the implementation checkpoint. The latest general build/audit/test and history-scan evidence [38259999486](https://github.com/layalialzahra/layali-al-zahra-website/actions/runs/38259999486) / [38259999483](https://github.com/layalialzahra/layali-al-zahra-website/actions/runs/38259999483) applies to `046c4b7e4b5a7629fc860538b6d37b0e3b969e48`, not the docs-only branch head `dbd22794c87a7f6cd80003e32c4713d1463d8b34`.
- Branch `feat/layali-managed-content-cms` was verified at `dbd22794c87a7f6cd80003e32c4713d1463d8b34` immediately before this docs update, 15 commits ahead of the audited implementation baseline with documentation-only changes. No CI runs were returned for that SHA; the Vercel failure context is not deployment evidence. Vercel remains disconnected.
- Open: generic SSR render exceptions produce an empty-root HTML shell with HTTP 200; useful fallback acceptance, live rewrites/function packaging, crawler-facing HTTP HTML, live DB/API access and owner-approved cutover remain unverified. Next ordered task is Short Task List Task 02, then Core CMS Task 6 acceptance. No deployment/cutover is authorised.


### Task 19: Generic homepage SSR render failure

- [x] Owner selected Option B: return HTTP 500 rather than an empty-root HTTP 200 or a separately maintained fallback homepage.
- [x] Renderer logs generic SSR exceptions and returns plain-text `Homepage unavailable` with `Cache-Control: no-store`; HEAD responses have no body.
- [x] Added a regression assertion for HTTP 500 and retained separate fail-closed coverage for managed-review lookup failures.
- [x] Build verification [38324220862](https://github.com/layalialzahra/layali-al-zahra-website/actions/runs/38324220862) passed dependency audit, tests and build on code/test commit `3c29eade5dd7932485ba0faab908f5ab75bdf3ac`. Deployed runtime/crawler acceptance remains deferred while Vercel is disconnected.


### Task 20: Verify local SSR and client hydration — 2026-10-13

- [x] Handler preserves the requested homepage alias (`/` or `/home`) when calling the SSR entry. Both paths render the same homepage and retain the single static canonical URL `https://www.layalialzahra.com/`.
- [x] Expanded `scripts/smoke-homepage-ssr.js` to exercise both paths against the built server bundle and assert initial homepage content, the hydration marker, canonical metadata, no hidden initial carousel content, legacy fallback when managed reviews are unavailable/disabled, and managed review publication/order/suppression filtering.
- [x] Added a jsdom hydration regression to detect React hydration mismatch warnings, plus a handler test for the `/home` alias.
- [x] Build verification [38324549630](https://github.com/layalialzahra/layali-al-zahra-website/actions/runs/38324549630) passed on code/test commit `3d6c48d932ba9fc97d1bf2163d6b60359cccd473`: dependency audit (0 vulnerabilities), 127/127 Node tests, 39 Vitest tests across 7 files, client build, SSR build and built-server smoke for both `/` and `/home`.
- [ ] Live MongoDB ordering/query behavior and deployed Vercel rewrite/crawler response remain outside this local task and are not verified while Vercel is disconnected.

Acceptance record: [Homepage SSR and Hydration Acceptance](../../HOMEPAGE-SSR-HYDRATION-ACCEPTANCE-2026-10-13.md).

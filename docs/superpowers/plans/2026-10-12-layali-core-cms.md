# Layali Al Zahra Core Content CMS Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add admin CRUD and published-only public reads for Services, Offers, Packages and FAQs using dedicated collections.

**Architecture:** Keep the existing editorial `content` model limited to Blog, Beauty Tips and News. Add purpose-specific validators and collection helpers, protected Vercel API handlers, and dedicated admin views. Extract current hard-coded records into reusable static data snapshots so the same records can be verified and migrated without changing public presentation.

**Tech Stack:** React 18, TypeScript, Vite, Vercel serverless functions, MongoDB Atlas, existing Blob upload API; Vitest and React Testing Library for focused unit/component tests if compatibility checks pass.

**Spec:** `docs/superpowers/specs/2026-10-12-layali-cms-expansion-design.md`

## Global Constraints

- Preserve current public design, routes, booking destinations and existing content.
- Do not expand `CONTENT_TYPES` to include services, offers, packages, FAQs or reviews.
- All admin writes use `requireAdmin` and `sameOrigin`; public routes return published data only.
- Preserve display strings for prices and offer validity; do not invent dates.
- Do not switch public pages to database-backed content until migration is verified and explicitly approved.
- Existing Blog/Beauty Tips/News behavior and scheduling must remain unchanged.
- Avoid unrelated dependency upgrades and tracked `node_modules/` or `build/` cleanup.

## Review Focus

1. Missing/invalid fields and duplicate slugs must produce a controlled validation response, not a server error.
2. Partial updates must not erase fields omitted from the request.
3. A failed DB read must not leave a blank public page during the migration period.
4. A recurring offer label must be preserved exactly and must not be interpreted as a date.
5. Public APIs must not return drafts or internal/admin-only fields.

---

### Task 1: Establish a minimal test harness

**Files:**
- Modify: `package.json`
- Create: `tests/setup.test.js`
- Modify: `.github/workflows/build.yml` to run tests on the implementation branch

**Interfaces:**
- Produces: `npm test` for a one-shot test run using Node.js built-in `node:test` (Node 20 in CI). No dependency or lockfile changes are needed for initial API/model unit tests.

- [x] **Step 1: Add a smoke test for the test command**
  - Create `tests/setup.test.js` with a single assertion that verifies the test runner is configured.
- [x] **Step 2: Confirm no test script existed before configuration**
  - Confirm `package.json` has no existing test script before configuration (verified by source inspection).
- [x] **Step 3: Add the smallest compatible test command/configuration**
  - The repository test command and test configuration are present in the current implementation. The current `npm test` runs Node's built-in test runner and `vitest run`; this checkbox records setup implementation, not staging acceptance.
- [x] **Step 4: Run the test command**
  - Verify `npm test` in GitHub Actions on the implementation branch. Expected: smoke test passes.
- [x] **Step 5: Run the production build**
  - Verify the existing `npm run build` step in the same GitHub Actions run. Expected: successful build with no change to production output behavior.

### Task 2: Define dedicated validation and persistence helpers

**Files:**
- Create: `api/_lib/managed-content.js`
- Test: `tests/api/managed-content.test.js`

**Interfaces:**
- Produces: `validateServiceInput(input, partial = false)`, `validateOfferInput(input, partial = false)`, `validatePackageInput(input, partial = false)`, `validateFaqInput(input, partial = false)`, `normalizeManagedSlug(value)`, and serializers for safe public output.
- Collection names: `services`, `offers`, `packages`, `faqs`.
- Common status values: `draft | published`; sort order is a finite number.

- [x] **Step 1: Write failing validation tests**
  - Test required titles, slug normalization/uniqueness inputs, partial update behavior, finite sort order, safe URL fields, optional image fields, and published/draft states.
  - Test offer validity variants preserve `validityLabel` such as “Every Monday” separately from optional ISO date values.
  - Test prices remain display strings, including “AED 99.75” and “From”.
- [x] **Step 2: Run the focused tests**
  - Run: `npm test -- tests/api/managed-content.test.js`
  - Expected: FAIL because validators are not implemented.
- [x] **Step 3: Implement the smallest purpose-specific validators and serializers**
  - Reject unknown statuses and invalid dates/URLs where applicable.
  - For partial updates, validate only supplied fields and never replace omitted fields with defaults.
  - Keep subservices and FAQ lists ordered and validate array entry shape.
- [x] **Step 4: Run focused tests**
  - Run: `npm test -- tests/api/managed-content.test.js`
  - Expected: PASS.
- [x] **Step 5: Commit the isolated model/validation change**
  - Commit message: `feat: add managed content validation`.

### Task 3: Add protected admin CRUD and public read handlers

**Files:**
- Create: `api/admin/services.js`, `api/services.js`
- Create: `api/admin/offers.js`, `api/offers.js`
- Create: `api/admin/packages.js`, `api/packages.js`
- Create: `api/admin/faqs.js`, `api/faqs.js`
- Test: `tests/api/managed-content-routes.test.js`

**Interfaces:**
- Admin handlers follow current `req, res` Vercel handler conventions and use `requireAdmin(req, res)` plus `sameOrigin(req)` for writes.
- Admin list: GET with optional `id`, `search`, `status`, `page`, `limit`, and FAQ `pageKey`.
- Admin writes: POST create, PUT update by `id`, DELETE by `id`; all payloads validated through Task 2.
- Public reads: GET returns only published records, sorted by `sortOrder` then stable creation order; FAQs require `pageKey=services|offers|packages`.

- [x] **Step 1: Write route tests for each resource**
  - Verify unauthorized admin requests stop before database mutation.
  - Verify cross-origin writes return 403.
  - Verify wrong HTTP methods return 405 with an Allow header.
  - Verify public reads exclude drafts and internal fields.
  - Verify CRUD success, 400 validation errors, 404 missing IDs and stable ordering.
- [x] **Step 2: Run focused tests and confirm failure**
  - Run: `npm test -- tests/api/managed-content-routes.test.js`
  - Expected: FAIL because routes do not exist.
- [x] **Step 3: Implement collection-specific route handlers**
  - Reuse MongoDB connection and auth helpers.
  - Create required unique slug/source IDs and ordering indexes idempotently.
  - Return consistent `{ success, item/items }` response shapes and controlled errors.
  - Do not change `api/_lib/content.js` or `api/admin/content.js` behavior.
- [x] **Step 4: Run focused route tests**
  - Run: `npm test -- tests/api/managed-content-routes.test.js`
  - Expected: PASS, including auth and cross-origin failure cases.
- [x] **Step 5: Run existing test suite and build**
  - Run: `npm test && npm run build`
  - Expected: all tests pass and build succeeds.

### Task 4: Extract existing hard-coded content into migration-safe snapshots

**Files:**
- Create: `src/data/legacy-services.js`, `src/data/legacy-offers.js`, `src/data/legacy-packages.js`, `src/data/legacy-faqs.js`
- Modify: `src/components/ServicesPage.tsx`, `src/components/OffersPage.tsx`, `src/components/PackagesPage.tsx`
- Create: `scripts/migrate-managed-content.js`
- Test: `tests/scripts/migrate-managed-content.test.js`

**Interfaces:**
- The JavaScript snapshot modules preserve current literal values and ordering exactly by moving the existing arrays without JSON conversion. They export plain data and are not runtime-editable CMS content. Leave the curated homepage showcase arrays untouched in this task; connect them to canonical managed records only during the later cutover task.
- Migration script reads `MONGODB_URI` and optional `MONGODB_DB_NAME`, is idempotent, and supports dry-run and explicit apply modes. It must not print connection strings.

- [x] **Step 1: Write snapshot/migration tests**
  - Verify expected source record counts, required fields, preserved price/validity labels, image paths, booking URLs, FAQ page keys and sort order.
  - Verify dry-run performs no writes and a second apply does not create duplicates.
- [x] **Step 2: Run tests and confirm failure**
  - Run: `npm test -- tests/scripts/migrate-managed-content.test.js`
  - Expected: FAIL until snapshots and migration helper exist.
- [x] **Step 3: Extract source data without changing rendering**
  - Move literal data arrays/FAQ content into JSON snapshots and import them back into the existing page components.
  - Keep component markup, styling, booking actions and data ordering unchanged.
- [x] **Step 4: Implement dry-run/apply migration**
  - Use stable slugs as migration keys; update/insert only records owned by this migration.
  - Require an explicit apply flag; report counts and validation failures without secret output.
- [x] **Step 5: Run migration tests and build**
  - Run: `npm test -- tests/scripts/migrate-managed-content.test.js && npm run build`
  - Expected: tests pass; public pages still render the same static data.

### Task 5: Add dedicated admin management UI

**Files:**
- Modify: `package.json`, `package-lock.json`, `src/components/AdminPage.tsx`
- Create: `vitest.config.ts`, `tests/setup-dom.ts`, `src/components/admin/ManagedContentManager.tsx`, `src/components/admin/ServicesManager.tsx`, `src/components/admin/OffersManager.tsx`, `src/components/admin/PackagesManager.tsx`, `src/components/admin/FaqManager.tsx`, `src/components/admin/managed-content.css`
- Test: `tests/admin/ManagedContentManager.test.tsx`

**Interfaces:**
- Extend authenticated navigation with Services, Offers, Packages and FAQs without replacing the current Content Library.
- Use a shared editor with resource-specific field configurations and thin wrappers to avoid duplicating validation, upload, publication and delete workflows.

- [x] **Step 1: Write UI tests**
  - Verify navigation to each manager, create/edit form validation, draft/publish transitions, ordering controls, delete confirmation, loading/error/empty states and FAQ page filtering.
  - Verify existing Content Library navigation still works.
- [x] **Step 2: Run the UI test and confirm failure**
  - Run: `npm test -- tests/admin/ManagedContentManager.test.tsx`
  - Expected: FAIL because the managers do not exist.
- [x] **Step 3: Implement managers using existing admin styles and upload API**
  - Preserve keyboard accessibility and responsive behavior.
  - Use the APIs defined in Task 3; do not publish on a local form save unless the explicit action says publish.
- [x] **Step 4: Run UI tests**
  - Run: `npm test -- tests/admin/ManagedContentManager.test.tsx`
  - Expected: PASS.
- [x] **Step 5: Run all tests and build**
  - Run: `npm test && npm run build`
  - Expected: pass without regressions to current admin authentication/editor.

### Task 6: Stage verification and core CMS acceptance gate

**Files:**
- Test/update: `docs/ADMIN-CMS-BRD.md`
- Update after verification: `docs/superpowers/plans/2026-10-12-layali-core-cms.md`

- [x] **Step 1: Run full automated checks**
  - CI run [38259999486](https://github.com/layalialzahra/layali-al-zahra-website/actions/runs/38259999486) passed dependency installation, `npm audit --audit-level=high`, `npm test` and `npm run build` on the audited HEAD `046c4b7e4b5a7629fc860538b6d37b0e3b969e48`. This is automated CI evidence only.
- [ ] **Step 2: Verify admin API behavior in a safe staging environment**
  - Exercise CRUD, auth failures, same-origin rejection, validation, image upload, ordering and public published-only reads.
- [ ] **Step 3: Run migration in dry-run mode and compare counts/content**
  - Do not apply against production without an explicit approved release step.
- [ ] **Step 4: Obtain owner acceptance before changing public reads**
  - The public components must continue rendering the current snapshots until this approval.
- [ ] **Step 5: Update BRD/log with verified results and one coherent commit**
  - Record exact test/build results and environment; do not claim production deployment if only staging was tested.

---

## Current acceptance checkpoint — 2026-10-12

- Audited HEAD before this documentation commit: `046c4b7e4b5a7629fc860538b6d37b0e3b969e48`. Build/test/audit passed in [run 38259999486](https://github.com/layalialzahra/layali-al-zahra-website/actions/runs/38259999486).
- Task 6 Step 1 is verified by CI and marked complete. Steps 2–5 remain unchecked: no controlled staging CRUD/auth/origin/upload/public-read acceptance, real staging DB comparison, owner acceptance or BRD acceptance record has been produced by this audit.
- The owner-confirmed Vercel hold prevents using a new Vercel deployment for this task. Do not treat CI success as staging or production evidence. Core CMS acceptance remains open.

## Task 01 — status reconciliation (2026-10-12)

- Verified `feat/layali-managed-content-cms` at `dbd22794c87a7f6cd80003e32c4713d1463d8b34` before this docs-only update; compared with audited implementation baseline `046c4b7e4b5a7629fc860538b6d37b0e3b969e48`, the branch is 15 commits ahead and 0 behind, with documentation-only changes.
- Core Task 6 Step 1 (dependency installation, high-severity audit, `npm test`, `npm run build`) passed in [38259999486](https://github.com/layalialzahra/layali-al-zahra-website/actions/runs/38259999486) on `046c4b7e4b5a7629fc860538b6d37b0e3b969e48`; historical text/binary scan [38259999483](https://github.com/layalialzahra/layali-al-zahra-website/actions/runs/38259999483) also passed on that baseline. No Actions runs were returned for `dbd22794c87a7f6cd80003e32c4713d1463d8b34`; the only status was a Vercel failure context to a generic configuration URL, not evidence of a deployment.
- **Next:** Short Task List Task 02 must establish an authorised non-production environment/database without reconnecting Vercel. Then continue Task 6 Steps 2–5. Staging CRUD/auth/origin/upload/public-read checks, real staging migration comparison and explicit owner acceptance remain open. No production migration/cutover is authorised.


## Environment gate — Task 02 outcome (2026-10-12)

**Blocked:** do not start runtime acceptance or migration until a currently available, owner-authorised non-production target and isolated database are evidenced. The repository environment template contains only a placeholder `MONGODB_URI` and defaults `MONGODB_DB_NAME` to `layalialzahra`; `api/_lib/mongodb.js` does not enforce production/staging separation. Historical BRD notes about a Vercel staging admin service and Preview variables are insufficient to prove the present project identity or database isolation. Provider-level Vercel and MongoDB settings could not be verified through the available connections.

Full evidence, risk assessment and the unblock checklist: [docs/ENVIRONMENT-VERIFICATION-2026-10-12.md](../../ENVIRONMENT-VERIFICATION-2026-10-12.md). Do not reconnect Vercel, use production as staging, perform a migration, or mark Task 6 Steps 2–5 complete. Continue only after explicit environment authorisation and isolation verification.


## Task 03 — Services admin automated acceptance (2026-10-12)

**Outcome:** Automated API/model/UI checks pass on tested commit `0b97e33e4cfcaf16e9a985a7d570ea206fcdf3a1`. This is source-level acceptance only; live staging acceptance remains blocked by Task 02.

- Added `tests/api/managed-content-services-acceptance.test.js` covering service create/default draft, partial edit preservation, numeric ordering, publish/unpublish transitions, duplicate normalized slug conflict, invalid title/order handling, published-only public reads, public sort order and delete behavior.
- Expanded `tests/admin/ManagedContentManager.test.tsx` for explicit draft creation, editing title/order and surfacing duplicate-slug API errors while keeping the editor open.
- Expanded `tests/api/managed-content.test.js` to reject null/blank sort order and accept finite numeric values.
- Fixed `api/_lib/managed-content.js`: sort-order validation previously converted `null` and empty strings to numeric zero through `Number(value)`. It now rejects null, booleans and blank strings and still accepts finite numeric values. FAQ ordering uses the same strict helper.
- GitHub Actions Build verification [run 38270049182](https://github.com/layalialzahra/layali-al-zahra-website/actions/runs/38270049182) completed successfully on tested commit `0b97e33e4cfcaf16e9a985a7d570ea206fcdf3a1`: dependency installation, `npm audit --audit-level=high`, `npm test` and `npm run build` all passed.
- Historical secret scan [run 38270049237](https://github.com/layalialzahra/layali-al-zahra-website/actions/runs/38270049237) completed successfully; both the redacted Gitleaks history scan and binary-blob scan passed on the tested commit.
- No live API/database writes, staging tests, image uploads, migrations, deployment or public-source changes were performed. Task 02's environment-isolation blocker remains in force. Keep the Services staging/runtime acceptance gate open until a safe authorised target is evidenced.


## Task 03 follow-up — duplicate slug on edit and final automated checks (2026-10-12)

- Added an API regression test confirming a service cannot be edited to use another service's slug; the request returns HTTP 409 and neither record is overwritten.
- Latest tested code/test commit: [`5bab4a5992315c529a708e48b6f07c2f6e596042`](https://github.com/layalialzahra/layali-al-zahra-website/commit/5bab4a5992315c529a708e48b6f07c2f6e596042).
- Build verification [run 38270400681](https://github.com/layalialzahra/layali-al-zahra-website/actions/runs/38270400681) passed dependency installation, `npm audit --audit-level=high`, `npm test` and `npm run build`.
- Historical secret scan [run 38270400613](https://github.com/layalialzahra/layali-al-zahra-website/actions/runs/38270400613) passed the redacted Gitleaks reachable-history scan and binary-blob scan.
- These checks verify the feature-branch source only. Task 02 still blocks live/staging runtime acceptance; no database writes, uploads, migrations, deployment or public content-source changes were performed. Vercel remains disconnected.


## Short Task List Task 04 — Offers admin automated acceptance (2026-10-12)

**Outcome:** Automated acceptance PASS on code/test commit `526047628878e300791450700d6e3f43e7d1c2e0`; staging/runtime acceptance remains blocked by Short Task List Task 02. This entry does not close Core CMS Task 6 Steps 2–5 or authorise a database migration or public-source cutover.

- Added `tests/api/managed-content-offers-acceptance.test.js` for offer CRUD, publication/unpublication, deletion, published-only public reads, display-price preservation and date/validity behavior.
- Added `tests/admin/OffersManager.test.tsx` for explicit publishing of a date-range offer and saving a recurring offer as a draft while preserving labels and omitting date fields.
- Verified display strings remain unchanged (for example, `AED 178.50`, `AED 99.75` and `From AED 99`). Existing `Every Monday` and `Midday Special` remain text labels; no dates are inferred from those labels.
- Date tests cover an inclusive same-day range, leap-day acceptance (`2028-02-29`), reversed ranges, impossible calendar dates, non-ISO input and missing required date boundaries.
- Fixed a verified defect: switching an existing date-range offer to `recurring` or `label` could leave old `validFrom`/`validUntil` values stored. The validator now normalizes these irrelevant dates to `null` for non-date validity types, including partial updates.
- Build verification [38271554877](https://github.com/layalialzahra/layali-al-zahra-website/actions/runs/38271554877) passed on the code/test commit: dependency installation, `npm audit --audit-level=high` (0 vulnerabilities), `npm test` (80 Node tests and 22 Vitest tests across 5 files) and `npm run build` (client build, SSR build and homepage SSR smoke test).
- The TDD test-only run [38271243996](https://github.com/layalialzahra/layali-al-zahra-website/actions/runs/38271243996) failed at the new assertion because non-date validity returned an undefined date field instead of the normalized null value; the fix and regression tests then passed in run 38271554877.
- No staging/live database access, uploads, migration, deployment or public content-source change occurred. Vercel remains disconnected. The environment blocker documented in `docs/ENVIRONMENT-VERIFICATION-2026-10-12.md` remains in force.


## Short Task List Task 05 — Packages automated acceptance (2026-10-12)

**Outcome:** Automated API/model/UI acceptance PASS on code/test commit [cc6603ffae487a827e98d81ed7d5b1f3ac89a548](https://github.com/layalialzahra/layali-al-zahra-website/commit/cc6603ffae487a827e98d81ed7d5b1f3ac89a548). Staging/runtime acceptance remains BLOCKED by Short Task List Task 02.

- Added `tests/api/managed-content-packages-acceptance.test.js` for package field validation, create/default-draft, partial-update persistence, category/price/image/details/booking URL/order preservation, publication/unpublication, deletion, duplicate normalized slugs, controlled validation errors, database failure handling and published-only ordered public reads.
- Added `tests/admin/PackagesManager.test.tsx` for draft form persistence, image-upload-to-package integration, explicit publish/unpublish transitions, API validation error display and confirmed deletion.
- Public-data checks verify that drafts are excluded, published packages are sorted by `sortOrder`, price/category/image/details are preserved, and internal `status`, SEO fields and timestamps are not exposed by the public serializer.
- Fixed a verified error-classification defect in `api/_lib/managed-content-routes.js`: unsafe HTTP image URLs throw “Image URL must use HTTPS”, but the admin route did not classify that validation message as a client error and returned HTTP 503. The handler now returns HTTP 400 for that validation failure; tests verify invalid input does not mutate the collection. The test-only run exposed this defect and a too-narrow assertion; both were corrected before the passing run.
- Build verification [38273001219](https://github.com/layalialzahra/layali-al-zahra-website/actions/runs/38273001219) passed dependency installation, `npm audit --audit-level=high` (0 vulnerabilities), `npm test` (87 Node tests passed, 0 failed; 27 Vitest tests across 6 files passed), client build, SSR build and homepage SSR smoke test.
- Historical scan [38273001202](https://github.com/layalialzahra/layali-al-zahra-website/actions/runs/38273001202) passed: 463 reachable commits / approximately 117.35 MB scanned with zero Gitleaks findings; 118 reachable binary blobs containing printable strings / 170,446,401 bytes scanned with zero findings. The binary scan is heuristic and does not semantically inspect compressed/encrypted payloads.
- No authorised non-production database has been verified. These are mock/API/UI automation results, not live MongoDB persistence or actual Blob storage acceptance. No staging/live writes, real upload, migration, deployment or public content-source change occurred. Vercel remains disconnected.
- **Status boundary:** Short Task List Task 05 automated checks are complete; Task 02 still blocks runtime acceptance. Core CMS Task 6 Steps 2–5 remain open.

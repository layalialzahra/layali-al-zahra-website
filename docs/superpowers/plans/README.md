# Layali CMS implementation plan index

> **Current status checkpoint:** [Project status and acceptance gates](../PROJECT-STATUS-2026-10-12.md). This record supersedes stale deployment assumptions in older notes. Owner-confirmed: Vercel is disconnected and current changes are undeployed; do not reconnect or trigger deployment until project completion and final release approval.

Read the approved design specification before any plan. Read the Notion project hub's four child pages — `decisions.md`, `stages.md`, `log.md`, `agents.md` — before every implementation task.

## Order

1. [Core Content CMS](2026-10-12-layali-core-cms.md): services, offers, packages, FAQs, CRUD APIs, migration snapshots and admin UI.
2. [Google Reviews](2026-10-12-layali-google-reviews.md): API prerequisite gate, sync, explicit publish/unpublish and local deletion.
3. [Homepage Crawlability and Cutover](2026-10-12-layali-crawlability-cutover.md): rendering feasibility, crawler-facing HTML, one-family-at-a-time migration and release gates.

The master plan is [Layali CMS Expansion](2026-10-12-layali-cms-expansion.md).

## Approval boundary

The owner has authorised implementation on `feat/layali-managed-content-cms`, not production data migration or public cutover. Vercel is disconnected by owner instruction; today's changes are not deployed. Do not reconnect Vercel or trigger deployments during implementation because the owner is preserving the daily free deployment allowance. Reconnect only for the final controlled release after all acceptance gates pass and the owner explicitly approves. A historical GitHub status/check labelled Vercel is not evidence that current changes were deployed. Google sync work must stop if required API access is not verified. Rendering implementation must stop for owner review if the feasibility spike requires a broad architectural change.

## Security and acceptance checkpoint — 2026-10-12
- Latest source changes are on feat/layali-managed-content-cms; no deployment was triggered.
- [Build verification 38255367374](https://github.com/layalialzahra/layali-al-zahra-website/actions/runs/38255367374) passed dependency audit, tests and build.
- [Historical secret scan 38255367338](https://github.com/layalialzahra/layali-al-zahra-website/actions/runs/38255367338) passed: 364 commits / ~117.18 MB with zero text findings; 118 reachable binary blobs with printable strings / 170,446,401 bytes with zero findings.
- Password changes now revoke prior admin sessions via a server-checked session version. script-src no longer allows unsafe inline/eval scripts; analytics/Meta Pixel initialization uses same-origin /tracking.js.
- Remaining gates are browser/runtime CSP and session-revocation acceptance, Google Business Profile API/OAuth/location access, functional/migration acceptance, deployed rewrite/function packaging, crawler-facing HTTP HTML acceptance and final release approval. Route-aware SSR/hydration is implemented locally; Vercel remains disconnected.

## Latest verified checkpoint — 2026-10-12

- Audited branch `feat/layali-managed-content-cms` was identical to HEAD `046c4b7e4b5a7629fc860538b6d37b0e3b969e48` before this documentation commit.
- [Build verification 38259999486](https://github.com/layalialzahra/layali-al-zahra-website/actions/runs/38259999486) passed dependency installation, high-severity audit, tests and build.
- [Historical secret scan 38259999483](https://github.com/layalialzahra/layali-al-zahra-website/actions/runs/38259999483) passed text/history and binary printable-string scan steps; recorded output: 413 commits / ~117.24 MB, zero text findings, 118 binary blobs / 170,446,401 bytes, zero findings.
- Route-aware SSR/hydration is implemented locally and passes CI, but Vercel routing/function packaging and crawler-facing HTTP acceptance remain unverified. Generic render exception fallback still returns a shell with empty `#root` and HTTP 200; this gap is open. Managed review-source failure is a separate intentional fail-closed behavior.
- **Sequence note:** SSR implementation preceded completion of Core CMS Task 6 and live Google Reviews acceptance. This is a documented plan-sequence deviation, not acceptance of those upstream gates.
- **Next task:** Core CMS plan Task 6 — Stage verification and core CMS acceptance. Keep staging/runtime/owner-acceptance checkboxes open until evidence exists.

## Task 01 — status reconciliation (2026-10-12)

- Verified branch `feat/layali-managed-content-cms` at `dbd22794c87a7f6cd80003e32c4713d1463d8b34` immediately before this documentation update; it is 15 commits ahead of audited code baseline `046c4b7e4b5a7629fc860538b6d37b0e3b969e48`, with documentation-only changes.
- Build/audit/tests passed on `046c4b7e4b5a7629fc860538b6d37b0e3b969e48` in [38259999486](https://github.com/layalialzahra/layali-al-zahra-website/actions/runs/38259999486); reachable text/binary scan passed on the same baseline in [38259999483](https://github.com/layalialzahra/layali-al-zahra-website/actions/runs/38259999483). No CI is established for `dbd22794c87a7f6cd80003e32c4713d1463d8b34`: only a Vercel failure status pointing to generic configuration docs was returned, and no Actions runs were returned. This is not deployment evidence; owner confirms Vercel remains disconnected.
- **Next ordered task:** Short Task List Task 02, confirm an authorised non-production verification environment. Then resume Core CMS Task 6 Steps 2–5; Step 1 is CI-evidenced only on `046c4b7e4b5a7629fc860538b6d37b0e3b969e48`. Keep Google API access, staging/runtime acceptance, SSR fallback, crawler HTTP, rollback and release gates open.


## Short Task List Task 04 — Offers automated acceptance (2026-10-12)

- Code/test commit: `526047628878e300791450700d6e3f43e7d1c2e0`.
- Build verification [38271554877](https://github.com/layalialzahra/layali-al-zahra-website/actions/runs/38271554877) passed dependency install, `npm audit --audit-level=high` (0 vulnerabilities), `npm test` (80 Node tests + 22 Vitest tests across 5 files) and `npm run build` (client, SSR and smoke test).
- Offers tests cover create/edit, publish/unpublish/delete, published-only public reads, display price labels, recurring/descriptive labels and date boundaries. Fixed stale date values persisting after switching an offer to a non-date validity type.
- Runtime/staging acceptance remains blocked by Task 02. Vercel stays disconnected; no database migration or public cutover.


## Short Task List Task 05 — Packages automated acceptance (2026-10-12)

- Tested code commit: [cc6603ffae487a827e98d81ed7d5b1f3ac89a548](https://github.com/layalialzahra/layali-al-zahra-website/commit/cc6603ffae487a827e98d81ed7d5b1f3ac89a548).
- Build verification [38273001219](https://github.com/layalialzahra/layali-al-zahra-website/actions/runs/38273001219) passed dependency audit (0 vulnerabilities), 87 Node tests, 27 Vitest tests across 6 files, client/SSR builds and homepage SSR smoke test.
- Historical scan [38273001202](https://github.com/layalialzahra/layali-al-zahra-website/actions/runs/38273001202) passed: 463 reachable commits / ~117.35 MB with zero Gitleaks findings; 118 binary blobs / 170,446,401 bytes with zero printable-string findings.
- Packages CRUD, category/price/image/details/order persistence, publication, duplicate slugs, validation and public allowlist are covered by automated tests. A validation-error mapping defect was fixed (unsafe HTTP image URL now returns 400 rather than 503).
- Task 05 remains OPEN overall until authorised staging persistence/upload/runtime checks pass; Task 02 remains blocked. Vercel remains disconnected. Task 06 is next in the queue, but do not start it until explicitly instructed.


## Short Task List Task 06 checkpoint — 2026-10-12

FAQ API and admin UI regression tests have been added in commits `83b248c2480c0859911c58bbcf940bf0fe8dcbea` and `e0efd65cac369ff242b3093753c5e1a9ac209da3`. The available status/workflow query did not return a CI run for these commits, so execution and build success are not claimed. Task 02 remains blocked; no authorised staging database is verified. Task 06 remains open until automated run evidence and authorised staging/runtime acceptance are recorded. Vercel remains disconnected.


Latest Task 06 test-only follow-up: commit `09debf63f90ae32f5fc449cb29dcb8ccb9f7d643` adds an explicit unpublish-to-public-API regression assertion. Test execution and build success remain unverified because no run evidence was returned by the available status/workflow lookup.

## Short Task List Task 08 checkpoint — 2026-10-12

Image-upload automated acceptance passed on tested commit [a9c5469e94d0c8b18006cbb4c21059b7cdfd7d28](https://github.com/layalialzahra/layali-al-zahra-website/commit/a9c5469e94d0c8b18006cbb4c21059b7cdfd7d28). Build verification [38277348263](https://github.com/layalialzahra/layali-al-zahra-website/actions/runs/38277348263) passed 104 Node tests, 29 Vitest tests across 7 files, high-severity dependency audit (0 vulnerabilities), client/SSR builds and homepage SSR smoke test. Historical scan [38277348295](https://github.com/layalialzahra/layali-al-zahra-website/actions/runs/38277348295) passed with zero findings across 491 reachable commits and 118 binary blobs / 170,446,401 bytes. Task 02 still blocks real staging/Blob acceptance; Vercel remains disconnected.

## Short Task List Task 09 — public CMS API boundaries (2026-10-12)

- Automated acceptance passed on tested HEAD [f832185898175ac10432546915d0a38bd5e66666](https://github.com/layalialzahra/layali-al-zahra-website/commit/f832185898175ac10432546915d0a38bd5e66666). Build verification [38280386368](https://github.com/layalialzahra/layali-al-zahra-website/actions/runs/38280386368): 0 high-severity dependency vulnerabilities, 107 Node tests passed, 29 Vitest tests passed across 7 files, client/SSR builds and homepage SSR smoke test passed.
- Added all-four-endpoint tests for empty datasets, published-only reads, resource allowlists, FAQ page scoping and safe generic 503 behavior for DB connection/index/read failures. Fixed a confirmed nested-field exposure path in service subservices by allowlisting nested fields.
- Historical scan [38280386362](https://github.com/layalialzahra/layali-al-zahra-website/actions/runs/38280386362) passed: 501 reachable commits, zero text/history findings; 118 binary blobs with printable strings, zero findings.
- Runtime acceptance remains blocked by Task 02; no live DB, deployment, migration or cutover. Vercel remains disconnected.


## Task 10 — Existing Blog, Beauty Tips and News CMS regression checks (2026-10-12)

- Automated regression tests added in `tests/api/legacy-content-regression.test.js` for legacy content types, partial edit preservation, schedule validation, sanitized article bodies, public-field privacy, stable listing/detail route contracts and retention of upload tests.
- Source review found no confirmed application regression; no application logic changes were made.
- Build verification [38281099834](https://github.com/layalialzahra/layali-al-zahra-website/actions/runs/38281099834) passed on tested commit [49292cebd8b3c495faaa748062d34ca8d74dbe8d](https://github.com/layalialzahra/layali-al-zahra-website/commit/49292cebd8b3c495faaa748062d34ca8d74dbe8d): 0 high-severity dependency vulnerabilities, 114 Node tests, 29 Vitest tests across 7 files, client/SSR builds and homepage SSR smoke test.
- First CI run failed because the test imported MongoDB helpers before setting a test-only URI; the harness was corrected and the final run passed.
- Runtime/staging acceptance remains open because Task 02 has no verified authorised isolated non-production target. No real Blob upload, live DB, migration, deployment or public-source cutover occurred. Vercel remains disconnected.


## Task 11 — migration source reconciliation (2026-10-12)

**Source-to-migration comparison: PASS. Database/staging comparison: NOT RUN, blocked by Task 02.**

- Added `tests/managed-content-migration-snapshot.test.js` to compare the migration builder against authoritative source files for all 56 records: 15 Services, 5 Offers, 23 Packages and 13 FAQs.
- Compared exact source titles, descriptions, labels/prices, image paths/URLs, source order, subservice names/prices, validity labels/types, FAQ question/answer/page assignment/order and the existing Zylu booking URL. FAQ assignment counts are Services 5, Offers 4, Packages 4.
- **Discrepancies found: 0. Source content changes: 0.** No source values were changed.
- Documented explicit schema-generated mapping values separately from discrepancies: blank service description where source has none, title-derived image alt, generated subservice IDs, normalized offer/package slugs, shared booking fallback and zero-based sort order.
- Full reconciliation: [`docs/MIGRATION-DATA-RECONCILIATION-2026-10-12.md`](https://github.com/layalialzahra/layali-al-zahra-website/blob/feat/layali-managed-content-cms/docs/MIGRATION-DATA-RECONCILIATION-2026-10-12.md).
- Build verification [38281562425](https://github.com/layalialzahra/layali-al-zahra-website/actions/runs/38281562425) passed on tested code/test commit [acc1accdb15c93ae43df285dd28179b0d606c671](https://github.com/layalialzahra/layali-al-zahra-website/commit/acc1accdb15c93ae43df285dd28179b0d606c671): 0 dependency vulnerabilities; 120 Node tests passed, 29 Vitest tests across 7 files passed, client/SSR builds and homepage SSR smoke test passed.
- This verifies the generated source projection only, not database contents or an applied migration. No database connection/write, migration, deployment or public-source switch occurred. Task 02 remains blocked; Vercel remains disconnected. Temporary CI PR [#8](https://github.com/layalialzahra/layali-al-zahra-website/pull/8) was closed unmerged.


## Core CMS acceptance checkpoint — 2026-10-12

Tasks 03–12 were reconciled in [Core CMS Acceptance Summary](../../CORE-CMS-ACCEPTANCE-SUMMARY-2026-10-12.md). **Decision: HOLD; Task 13 remains open pending explicit owner acceptance.** Task 02's authorised staging environment is not verified; Task 05 runtime persistence/Blob acceptance and Task 06 staging acceptance remain open; Task 12 migration/count/field/idempotency/rollback evidence was not run. Automated CI/source results must not be treated as staging acceptance. Do not enable managed public content, change its source, run production migration or deploy without completed staging evidence and explicit written owner approval.


## Core CMS verification refresh — 2026-10-12

Latest branch HEAD `2b3883d08165d73fcb7ac7a8bdeb11f797bf4438` passed Build verification [38282811459](https://github.com/layalialzahra/layali-al-zahra-website/actions/runs/38282811459): 120 Node tests, 29 Vitest tests across 7 files, 0 dependency vulnerabilities, client/SSR builds and homepage SSR smoke test. Historical secret scan [38282811451](https://github.com/layalialzahra/layali-al-zahra-website/actions/runs/38282811451) passed. The integrated run resolves the missing Task 06 automated execution trace, but does not constitute staging acceptance. Task 02/12 and explicit owner acceptance remain blocked; Task 05 and Task 06 runtime acceptance remain open. No deployment, production migration or public-source switch occurred.


## Short Task List Task 15 — controlled Google Reviews sync (2026-10-13)

**OPEN / BLOCKED.** No live sync attempted because Google Business Profile API approval/enablement, OAuth grant/scope, live credential presence and verified-location access remain unverified. Source review confirms pagination/count/duplicate-token validation before sync writes and existing unit coverage for complete multi-page and incomplete-page fixtures; this is not live acceptance. Real page/count/data-integrity checks and runtime preservation of existing records remain NOT RUN. MongoDB bulk writes may partially apply if the database write itself fails; that risk requires a separate fix/test. See [Task 15 blocker report](../../GOOGLE-REVIEWS-CONTROLLED-SYNC-BLOCKER-2026-10-13.md). Vercel remains disconnected and no successful live sync is claimed.

## Short Task List Task 16 — review moderation — 2026-10-13

- Added route-level lifecycle regression `tests/api/google-reviews-moderation-e2e.test.js` for local deletion/suppression across sync, default-unpublished imports, explicit publish and preservation of existing publication/order.
- Acceptance record: `docs/GOOGLE-REVIEWS-MODERATION-ACCEPTANCE-2026-10-13.md`.
- Build verification passed on `5872de79017b2cbb2d175ce445e4ca337f7ee6cd` ([run 38320839858]): dependency install, audit, tests and build passed. Runtime/staging acceptance remains open under Task 02's missing authorised isolated environment. No Google API call, production write, deployment or public-source cutover.

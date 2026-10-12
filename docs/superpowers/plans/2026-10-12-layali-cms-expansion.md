# Layali Al Zahra CMS Expansion Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Enable safe admin management of services, offers, packages, FAQs and selected Google reviews while preserving the current public site.

**Architecture:** Implement the core structured content CMS first, then the external Google Reviews integration, then the crawlable homepage integration. Each subsystem has its own plan and acceptance gate. Reuse the current Vercel API, MongoDB, admin session and Blob upload patterns; retain the current hard-coded public content until migration is verified and cutover is explicitly approved.

**Tech Stack:** React 18, TypeScript, Vite, Vercel serverless functions, MongoDB Atlas, Vercel Blob. Introduce a small test setup only after confirming compatibility with the current Vite config.

**Spec:** `docs/superpowers/specs/2026-10-12-layali-cms-expansion-design.md`

## Global Constraints

- Preserve current public design, routes, booking URLs, content and existing Blog/Beauty Tips/News behavior.
- Reuse `api/_lib/auth.js`, `api/_lib/mongodb.js`, existing admin UI patterns and Blob upload endpoint where appropriate.
- Admin write routes require an authenticated admin and same-origin validation.
- Public routes expose published records only.
- Google sync and review publishing are separate actions; selecting a review does not publish it.
- Local review deletion must never modify Google and must not silently reappear on sync.
- Do not change the public source of truth until migration and acceptance checks pass.
- Do not claim a test, deployment, API access or live-state check unless it was actually performed.
- **Owner-confirmed deployment hold (2026-10-12):** Vercel is disconnected and today's changes are not deployed. Do not reconnect Vercel or trigger deployments during implementation; preserve the daily free deployment allowance for the final controlled release after completion and explicit approval. Do not infer deployment from historical GitHub status metadata.
- Avoid unrelated cleanup, especially tracked `node_modules/` and `build/`; minimise coherent commits and do not push feature implementation to `main` without release approval.
- Repository is public; the owner has chosen to keep it public until project completion. Treat this as an accepted risk, never commit secrets, and do not change visibility without instruction.

## Review Focus

1. Existing price labels such as “AED 99.75” and “From” values must display unchanged rather than being coerced into numbers.
2. Recurring offer labels such as “Every Monday” must not be treated as date expiry values.
3. Existing public content must remain visible if MongoDB is unavailable, migration is incomplete or the feature has not been approved for cutover.
4. An unauthenticated or cross-origin write must not mutate a managed-content collection.
5. A failed Google sync or deleted local review must not clear, republish or unexpectedly restore the homepage review set.

## Plan set and order

1. **Core CMS:** [Core content modules plan](2026-10-12-layali-core-cms.md)
2. **Reviews:** [Google Reviews sync and publishing plan](2026-10-12-layali-google-reviews.md) — depends on core CMS patterns and verified API access.
3. **SEO/cutover:** [Homepage crawlability and migration plan](2026-10-12-layali-crawlability-cutover.md) — depends on core CMS and review publishing; the rendering approach must be validated before implementation.

Do not begin a downstream plan until its dependency and the relevant open decisions are satisfied. Each plan ends with a review gate; no plan authorises production cutover by itself.

## Cross-plan release gates

- [x] Owner authorised proceeding with the next planned task on 2026-10-12.
- [x] Repository visibility state and owner decision recorded: remain public until project completion. The implementation branch is `feat/layali-managed-content-cms`; production deployment/cutover remains prohibited without verification and approval.
- [x] Add and verify `npm test` in GitHub Actions (Node.js 20); tests and build passed on commit `bdc0fcb1b64b158b052390b5f2061a2ddd589267`.
- [ ] Verify Google Business Profile API/OAuth/location access before live sync acceptance. Provider-independent sync code exists; external API access remains an unresolved prerequisite.
- [x] Decide review deletion suppression and source-edit/removal behavior: use durable `google_review_suppressions` keyed by `googleReviewId`; preserve local publication/order on sync; retain reviews missing from one completed sync for explicit admin review. Recorded in Notion decisions and implemented in the current branch. Live API acceptance remains open.
- [x] Run a redacted Gitleaks scan across reachable Git history and binary printable strings. Latest run [38255367338](https://github.com/layalialzahra/layali-al-zahra-website/actions/runs/38255367338) scanned 364 commits / ~117.18 MB with zero text findings and 118 binary blobs / 170,446,401 bytes with zero findings, after a narrow allowlist for the documented public Web3Forms access key. This is heuristic scanning; compressed/encrypted payloads and unreachable objects are outside its semantic coverage.
- [x] Pin production same-origin validation to HTTPS and add regression coverage; CI run [38251638974](https://github.com/layalialzahra/layali-al-zahra-website/actions/runs/38251638974) passed tests/audit/build.
- [x] Add explicit CSP allowlist entries for the existing Meta Pixel script/beacon origins and add a configuration regression test; CI run [38251889567](https://github.com/layalialzahra/layali-al-zahra-website/actions/runs/38251889567) passed tests/audit/build.
- [x] Implement server-checked session versioning. Password changes increment the admin session version; protected requests validate it against MongoDB, so previously copied tokens are rejected on their next request. Unit regression tests and CI passed in [run 38255367374](https://github.com/layalialzahra/layali-al-zahra-website/actions/runs/38255367374).
- [x] Remove `unsafe-inline` and `unsafe-eval` from CSP `script-src`; move Google Analytics and Meta Pixel bootstrap code to same-origin `/tracking.js` and add regression tests. CI passed in [run 38255367374](https://github.com/layalialzahra/layali-al-zahra-website/actions/runs/38255367374). `style-src 'unsafe-inline'` remains because the current site uses inline styles; review that separately without breaking layout. Browser/runtime verification remains pending.
- [ ] Verify actual proxy/header behavior, auth/upload/database routes, responsive rendering and crawler-facing HTML during the final controlled release window. Vercel remains disconnected until then.
- [x] Implement route-aware homepage SSR/hydration on the feature branch: server entry, root and /home rewrites through the existing catch-all function, published-only/suppression-aware review query, HTML-safe hydration data and managed-review lookup fail-closed tests. Build verification [38259645839](https://github.com/layalialzahra/layali-al-zahra-website/actions/runs/38259645839) passed client build, SSR build and smoke test. **Generic render-exception fallback acceptance remains open:** the catch path returns the original HTML shell with empty `#root` and HTTP 200. Live target-environment crawler verification remains pending; do not reconnect Vercel until the approved final verification window.
- [ ] Owner explicitly approves migration/cutover after staging verification.

---

## Latest security implementation checkpoint — 2026-10-12
- [Build verification 38255367374](https://github.com/layalialzahra/layali-al-zahra-website/actions/runs/38255367374) passed dependency audit, tests and build after the session-revocation and script-CSP changes.
- [Historical secret scan 38255367338](https://github.com/layalialzahra/layali-al-zahra-website/actions/runs/38255367338) passed: 364 commits / ~117.18 MB with zero text findings; 118 reachable binary blobs containing printable strings / 170,446,401 bytes with zero findings.
- Session versioning is implemented and covered by regression tests; password changes revoke old copied sessions on the next protected request.
- CSP script-src has no unsafe inline/eval directives. Tracking bootstrap is now external. Style-src still permits unsafe-inline due existing inline styles; live/browser acceptance remains open.
- Vercel remains disconnected. Google API access, crawler-facing HTML, migration acceptance, responsive browser QA and final release approval remain pending.


## Historical crawlability component POC — 2026-10-12 (superseded by route-aware implementation below)
- At this earlier checkpoint, the component-level SSR test passed in [run 38256652658](https://github.com/layalialzahra/layali-al-zahra-website/actions/runs/38256652658): rendered HTML included a published review and excluded a review marked unpublished.
- This was only a component POC at that point. The route-aware server entry, request handler, initial HTML and hydration were implemented later as recorded in the subsequent section. Deployed crawler HTTP acceptance remains open.


## Route-aware homepage SSR implementation — 2026-10-12
- The feature branch now renders the homepage to HTML before the browser app hydrates. Existing metadata/canonical tags remain from the built index template.
- Review source switch is controlled by MANAGED_HOME_REVIEWS_ENABLED and is false by default. Only published, non-suppressed records are included when enabled; internal IDs are removed from browser props and hydration JSON is HTML-escaped.
- Build/test/audit/SSR smoke passed in [run 38259645839](https://github.com/layalialzahra/layali-al-zahra-website/actions/runs/38259645839). Historical scan [38259645791](https://github.com/layalialzahra/layali-al-zahra-website/actions/runs/38259645791) passed with zero findings.
- Remaining: actual Vercel rewrite/function packaging, live crawler HTTP response, DB availability, and owner-approved review-source cutover. Vercel remains disconnected.

## Documentation reconciliation checkpoint — 2026-10-12

- Audited HEAD before this documentation commit: `046c4b7e4b5a7629fc860538b6d37b0e3b969e48`; the branch ref compared identical.
- Latest Build verification [38259999486](https://github.com/layalialzahra/layali-al-zahra-website/actions/runs/38259999486) passed dependency install, `npm audit --audit-level=high`, tests and build. Latest historical scan [38259999483](https://github.com/layalialzahra/layali-al-zahra-website/actions/runs/38259999483) passed text/history and binary printable-string scan steps.
- **Plan-sequence deviation recorded:** route-aware SSR implementation proceeded before Core CMS Task 6 and live Google Reviews staging acceptance were complete. The code remains undeployed; this does not close any upstream acceptance gate.
- **Open SSR fallback gap:** generic homepage-render exceptions currently return the original HTML shell with empty `#root` and HTTP 200. This does not satisfy a useful static fallback expectation. Managed review lookup failure in managed mode separately fails closed to an empty review set by design.
- **Next approved task:** Core CMS Task 6 — stage verification and core CMS acceptance gate. The automated-check step is supported by run 38259999486; safe staging CRUD/auth/origin/upload/public-read checks, real staging migration comparison and owner acceptance remain open.
- No Vercel reconnect/deployment, production migration/cutover or `main` push is authorized by this plan update.

## Task 01 — current status reconciliation (2026-10-12)

- Branch `feat/layali-managed-content-cms` was verified at `dbd22794c87a7f6cd80003e32c4713d1463d8b34` before this documentation-only update; compare to audited implementation baseline `046c4b7e4b5a7629fc860538b6d37b0e3b969e48` shows 15 commits ahead, 0 behind, with documentation-only changes.
- Build verification [38259999486](https://github.com/layalialzahra/layali-al-zahra-website/actions/runs/38259999486) and historical scan [38259999483](https://github.com/layalialzahra/layali-al-zahra-website/actions/runs/38259999483) passed on `046c4b7e4b5a7629fc860538b6d37b0e3b969e48` only. No CI runs were returned for `dbd22794c87a7f6cd80003e32c4713d1463d8b34`; its only combined status context was Vercel: failure to a generic docs URL. This is not deployment evidence; Vercel remains disconnected.
- Next ordered task is Short Task List Task 02: confirm an authorised non-production verification environment. Once confirmed, continue Core CMS Task 6 staging acceptance. Do not infer staging acceptance from CI; keep external Google API prerequisites, SSR fallback, crawler HTML, migration/rollback, responsive/runtime QA and release approval open.


## Short Task List Task 04 — Offers acceptance checkpoint (2026-10-12)

Automated Offers management acceptance is covered on code/test commit `526047628878e300791450700d6e3f43e7d1c2e0`; Build verification [38271554877](https://github.com/layalialzahra/layali-al-zahra-website/actions/runs/38271554877) passed install, high-severity audit (0 vulnerabilities), 80 Node tests, 22 Vitest tests across 5 files, client/SSR build and SSR smoke test. Coverage includes CRUD/publication, exact price labels, recurring/descriptive validity labels, date-boundary validation and clearing stale dates when validity changes from date-range to recurring/label. **This is automated evidence only.** Short Task List Task 02 still blocks staging/runtime acceptance; no production data, deployment, migration or public cutover was performed.


## Short Task List Task 05 — Packages acceptance checkpoint (2026-10-12)

Automated API/model/UI checks passed on code/test commit [cc6603ffae487a827e98d81ed7d5b1f3ac89a548](https://github.com/layalialzahra/layali-al-zahra-website/commit/cc6603ffae487a827e98d81ed7d5b1f3ac89a548). Build verification [38273001219](https://github.com/layalialzahra/layali-al-zahra-website/actions/runs/38273001219) passed dependency audit (0 vulnerabilities), 87 Node tests, 27 Vitest tests across 6 files, client/SSR builds and homepage SSR smoke test. Historical scan [38273001202](https://github.com/layalialzahra/layali-al-zahra-website/actions/runs/38273001202) passed with zero Gitleaks findings across 463 reachable commits / ~117.35 MB and zero findings across 118 binary blobs / 170,446,401 bytes.

Coverage includes package CRUD, categories, exact price strings, image URL/alt, included items, booking URLs, ordering, publication, partial-field persistence, duplicate slugs, validation/error handling and published-only allowlisted public data. Fixed unsafe HTTP image URL validation being misclassified as HTTP 503 instead of HTTP 400. **Task 05 remains OPEN overall:** Task 02 still blocks live/staging persistence and upload acceptance. Vercel remains disconnected; no migration, deployment or public cutover occurred. Task 06 is next in the queue, but do not start it until explicitly instructed.

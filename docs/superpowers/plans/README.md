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
- Task 02 still blocks live/staging acceptance. Vercel remains disconnected. Next ordered task: Short Task List Task 06 — FAQ management; do not infer runtime acceptance from CI.

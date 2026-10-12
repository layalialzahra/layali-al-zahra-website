# Layali Al Zahra CMS Expansion — Status Checkpoint

**Date:** 2026-10-12  
**Repository:** `layalialzahra/layali-al-zahra-website`  
**Branch:** `feat/layali-managed-content-cms`  
**Application baseline observed before documentation-only follow-up:** `228e79206ed28c14e1e726cbab0c302ca28ced54`. Documentation-only follow-up commits are listed below.

> This status is authoritative for the CMS expansion and supersedes stale deployment assumptions in older records. Follow the owner-confirmed constraints below.

## Owner-confirmed constraints

- Vercel is disconnected. Today's feature-branch changes are not deployed. Keep it disconnected until the project is complete to preserve the daily free deployment allowance. Do not reconnect or trigger deployments during implementation; reconnect only for the final controlled release after acceptance and explicit approval.
- A historical GitHub status/check labelled Vercel is not evidence that today's work deployed or that the integration is currently connected.
- Work only in this repository and branch. The personal CRM repository is separate reference material and is out of scope; do not inspect it again unless the owner explicitly reopens it.
- Do not push to `main`, migrate production data, change public content source-of-truth, change repository visibility or perform production cutover without explicit owner approval.
- Keep the current public website and hard-coded content as fallback until migration and acceptance pass.

## Verified implementation / CI

- Core managed-content validators and allowlisted serializers exist for Services, Offers, Packages and FAQs.
- Protected admin CRUD and published-only public read handlers exist for those four content types.
- Legacy content snapshots and an idempotent migration utility with dry-run and explicit apply modes exist. No production migration was performed for this expansion.
- Dedicated admin UI exists for Services, Offers, Packages and FAQs.
- Google Reviews models, local review management and manual sync code exist. Live sync remains gated on verified Business Profile API approval, OAuth and location access.
- Crawlability research recommends a narrow SSR/hydration proof of concept; crawler-facing HTML acceptance is not complete.
- The feature tree contains 12 deployable API route entrypoints, matching the intended Vercel Hobby target. This is a tree count, not deployed runtime proof.
- GitHub Actions [38246829295](https://github.com/layalialzahra/layali-al-zahra-website/actions/runs/38246829295) passed dependency installation, `npm audit --audit-level=high`, tests and build. Earlier run [38245387331](https://github.com/layalialzahra/layali-al-zahra-website/actions/runs/38245387331) failed at dependency audit. CI is not staging or production acceptance.
- No Vercel reconnection, deployment, production migration, public cutover or `main` change occurred in this audit.

## Current gates

| Workstream | State | Remaining proof |
|---|---|---|
| Core CMS implementation | Implemented in branch | End-to-end controlled acceptance |
| CI, tests, dependency audit, build | [Run 38255367374](https://github.com/layalialzahra/layali-al-zahra-website/actions/runs/38255367374) passed after security changes | Rerun after future code changes |
| Security | Targeted code fixes and CI checks passed | style-src inline allowance, actual proxy chain and browser/runtime acceptance remain open; session revocation and script-CSP changes implemented; reachable history/binary-string scan passed |
| CRUD/auth/uploads/public API | Not accepted end-to-end | Test auth, same-origin rejection, validation, upload limits/signatures, draft exclusion, error/fallback behavior |
| Migration | Dry-run/count/display-value/idempotency unit tests pass | Real staging source/target comparison remains pending; no production apply |
| Google Reviews | Provider-independent logic, route and UI tests pass; live access blocked | Verify API/OAuth/location prerequisites and controlled sync/failure-preservation acceptance |
| Crawlability | Research plus component-level SSR proof passed in CI | Route-aware SSR/hydration, DB-backed initial HTML and crawler HTTP acceptance remain pending |
| Responsive QA | Pending | Browser checks on public/admin desktop and mobile layouts |
| Rollback/cutover | Pending, not authorised | Document rollback, acceptance evidence and explicit owner approval |
| Vercel release | Deferred | Reconnect only after completion for one controlled final release |
| Repository privacy | Deferred | Final-stage owner-approved decision |

## Security source-review checkpoint

Source review found scrypt password hashing, HMAC-signed eight-hour HttpOnly/SameSite=Lax sessions (Secure in production), same-origin checks for state-changing requests, login lockout logic, 4 MB upload limits with MIME/signature matching, protected admin CRUD, published-only public reads, allowlisted serializers and Google sync pagination validation before local writes.

Current status: script-src no longer permits unsafe-inline or unsafe-eval; tracking bootstraps load from same-origin /tracking.js. style-src unsafe-inline remains for existing inline styles. Password changes now increment a server-checked session version so old copied tokens are rejected on subsequent protected requests. Vercel documentation supports the forwarded-IP approach for direct Vercel traffic, but the live proxy chain remains unverified. Reachable text and printable binary-string scans passed with zero findings. Live environment configuration and browser/runtime behavior remain unverified. This is CI/source evidence, not a penetration test or live acceptance.

## Next work in order

1. **Priority 2 — Security:** complete historical/binary secret review, targeted security tests, CSP plan, proxy-header trust review and session-revocation assessment.
2. **Priority 3 — Functional acceptance:** test CRUD, auth/origin failures, uploads, published-only reads, Blog/Beauty Tips/News regressions, migration dry-run/count/repeatability and fallback behavior.
3. **Priority 4 — Google Reviews/crawlability:** verify external prerequisites, sync failure safety and suppression; complete the narrow crawlability proof of concept and HTML-level acceptance.
4. **Priority 5 — Release readiness:** reconcile plan checklists, responsive browser QA, route inventory, environment checklist, rollback evidence and owner acceptance. Vercel stays disconnected until project completion.
5. **Other pending:** keep BRD, Superpowers plans, security review and Notion aligned; decide repository privacy only at final stage.

## Documentation rules

Update the Notion hub, decisions, stages, agents and log for meaningful verified work. Mark a task complete only when its acceptance evidence exists. Distinguish implemented, CI-passed, staging-verified and production-released. Never record secret values.

## Documentation and security follow-up — 2026-10-12

- Reconciled the Google Reviews plan: suppression/source-edit/removal policy is marked decided and implemented; live Business Profile API approval, OAuth and location access remain unverified.
- Reconciled the crawlability plan and BRD with the owner-confirmed Vercel hold. Staging/crawler-facing checks remain deferred to the approved final verification window.
- Targeted follow-up source review reread auth/setup/password, upload, API router, Google Reviews routes, `index.html`, `vercel.json`, auth tests and CI workflow.
- Existing auth tests cover absent-Origin write rejection, safe GET without Origin, matching/mismatched origins and malformed cookies. Proxy header trust and immediate stateless-session revocation remain open.
- The current tree contains tracked dependency/build artifacts, including a Windows esbuild executable under `node_modules/`. No cleanup was performed; tracked `node_modules/` and `build/` are explicitly out of scope for incidental cleanup.
- GitHub code-search responses were not reliable even for known source identifiers. They are not evidence of a clean scan. A complete secret scan across history, text and binary blobs remains open; no secret values were retrieved or printed.
- Security review follow-up commit: `12179d3ba3f1e77ecce9a5dd63dc1b6fac7f493d`.
- Google Reviews plan commit: `f01e878d0a01ec3804971c0c8714aa25d0a5f18b`.
- Crawlability plan commit: `4f5216e8767229cc9ae1f6f3f8183ef50febf4da`.
- BRD addendum commit: `5ad60d548f5b0b5d27671e44a558088c34123a45`.
- The next security step is a reliable all-history text/binary scan and targeted test execution. CSP changes must account for inline Google Analytics/Meta Pixel behavior; do not make an untested CSP change. Vercel remains disconnected.


## Priority 2 change in progress — production Origin scheme hardening

- Updated `api/_lib/auth.js` to pin the expected origin scheme to HTTPS in production instead of using `x-forwarded-proto` for that decision.
- Added a regression test in `tests/api/auth-security.test.js` for a spoofed forwarded-protocol value.
- Implementation commit: `5bee062445dc9e852ebf4eca820f28073d943584`.
- Test commit: `6769ae39e4e9d504932e1354505ed81dd90ab41d`.
- Security review documentation commit: `e3725f807f2f7bc91fc2a007cbdc30c6835ca12b`.
- BRD change-log commit: `b3abd690e65859929c23d7b40e23f4ebbc1d3491`.
- GitHub Actions run [38251638974](https://github.com/layalialzahra/layali-al-zahra-website/actions/runs/38251638974) passed dependency installation, high-severity dependency audit, tests and build on tested commit `6769ae39e4e9d504932e1354505ed81dd90ab41d`. This verifies CI only, not deployed behavior. The separate `x-forwarded-for` client-IP trust review, session revocation, CSP validation and complete historical/text/binary secret scan remain open.
- No Vercel deployment or live/staging verification was initiated.


## CSP compatibility follow-up — 2026-10-12

- Source review found the existing inline Meta Pixel bootstrap loads `https://connect.facebook.net/en_US/fbevents.js`, but the prior CSP did not explicitly allow that script origin or `https://www.facebook.com` in image/connect sources. Runtime blocking was not directly observed.
- Added the required Meta Pixel/Facebook origins to the relevant CSP directives in `vercel.json` and added `tests/api/csp-config.test.js` to guard the allowlist.
- This does not remove `unsafe-inline` or `unsafe-eval`; a stricter policy still requires a separate tested change.
- Browser/runtime verification is pending the approved final release window. Vercel remains disconnected.


- **CSP test result:** GitHub Actions run [38251889567](https://github.com/layalialzahra/layali-al-zahra-website/actions/runs/38251889567) passed dependency installation, high-severity dependency audit, tests (including `tests/api/csp-config.test.js`) and build on commit `09c393494383bc39de8c82ea29c68d95b38679b1`. This is CI-only evidence; no browser or deployed runtime check was performed.


## Historical secret scan automation — 2026-10-12

- Added `.github/workflows/secret-scan.yml` using Gitleaks `v8.30.1`, full Git history/ref checkout and redacted output. First scan result is pending; do not mark the historical/text/binary secret-review gate complete before review and triage.
- This is a GitHub Actions security check, not a Vercel deployment.


## Secret scan CI wiring — 2026-10-12

- The standalone secret-scan workflow did not appear in the observed Actions run list after addition on the feature branch. Wired pinned Gitleaks `v8.30.1` into the existing Build verification workflow with full-history checkout and redacted output, so the next feature-branch run can execute it.
- First result is pending; do not claim a clean history scan until the Gitleaks step completes and any findings are triaged.


- **Secret scan workflow correction:** the first Build verification attempt after wiring Gitleaks failed before job execution due to invalid YAML command quoting. Corrected both workflow files to use a block scalar. The all-history scan result is still pending.


- **Gitleaks first-run disposition:** the scan processed 352 commits / approximately 117 MB and exited with code 1, but the available log did not expose usable finding metadata. Treat this as **not clean / unresolved**, not as proof of a secret. Both workflow definitions now emit a redacted report summary containing only rule ID, file path, line and abbreviated commit. The next run must identify and triage the cause.


## Gitleaks finding triage — 2026-10-12

- The redacted scan summary reported one `generic-api-key` match in `src/components/ContactPage.tsx` at historical commit prefix `4a1a56b0a5f2`. The value was not printed.
- The match is the browser-side Web3Forms `access_key`. Official Web3Forms docs describe this key as public by design, not a secret API key; it can still be abused to send unsolicited submissions. Added a narrow `.gitleaks.toml` allowlist matching only this file plus an `access_key` source line.
- The scan must be rerun after this allowlist change. This triage does not close binary-blob review or other security gates.


## Gitleaks scan result — 2026-10-12

- Standalone run [38252703895](https://github.com/layalialzahra/layali-al-zahra-website/actions/runs/38252703895) passed after the documented Web3Forms access-key allowlist: 354 commits scanned, approximately 117.15 MB, 0 findings.
- Scope is reachable Git history/text scanning from a full-history checkout. Binary-blob inspection remains open; do not generalize this to “no secrets ever existed.”
- Removed duplicate Gitleaks installation from Build verification after that combined run failed during scanner installation and skipped audit/tests/build. The dedicated historical scan workflow remains; the standard build workflow is restored to dependency audit, tests and build.


## Binary history scan — 2026-10-12

- Added `scripts/scan-binary-history.py` to inspect printable strings from binary blobs reachable in Git history and run Gitleaks over the extracted strings.
- Output is limited to redacted finding metadata. The scan is heuristic; compressed/encrypted payloads are not semantically inspected. First run pending; keep the binary review gate open until result and triage.


## Reachable history and binary scan result — 2026-10-12

- Historical secret scan [38253553830](https://github.com/layalialzahra/layali-al-zahra-website/actions/runs/38253553830) passed: 357 commits, approximately 117.16 MB, zero text/history findings after the narrow Web3Forms access-key allowlist.
- Binary scan examined 118 reachable binary blobs with printable strings, totaling 170,446,401 bytes, and reported zero findings.
- The scan is heuristic; it does not semantically inspect compressed/encrypted payloads, unreachable Git objects, external systems or deployed environment values.
- Standard Build verification [38253553795](https://github.com/layalialzahra/layali-al-zahra-website/actions/runs/38253553795) passed dependency audit, tests and build.
- Remaining Priority 2 work: proxy-IP trust assessment, session revocation decision and stricter CSP design/acceptance. Vercel remains disconnected.


## Latest security checkpoint — 2026-10-12

- Historical scan [38253765871](https://github.com/layalialzahra/layali-al-zahra-website/actions/runs/38253765871) passed: 358 commits / ~117.17 MB reachable history, zero text findings; 118 binary blobs with printable strings / 170,446,401 bytes, zero findings. Scope limitations remain: unreachable objects, external systems, deployed environment values and compressed/encrypted payloads are not covered semantically.
- Vercel documentation states that it overwrites `X-Forwarded-For` to prevent IP spoofing. This supports the current rate-limit key when requests reach Vercel directly; live proxy behavior remains unverified while disconnected.
- Production Origin scheme and CSP compatibility regression tests pass CI. Session revocation and stricter CSP removal of `unsafe-inline`/`unsafe-eval` remain open.


## Latest plan reconciliation — 2026-10-12

- Master plan now records the successful reachable-history text/binary scan, production Origin scheme regression and CSP allowlist regression with exact CI evidence.
- Latest scan [38253958356](https://github.com/layalialzahra/layali-al-zahra-website/actions/runs/38253958356) reported 359 commits / ~117.17 MB with zero text findings and 118 binary blobs / 170,446,401 bytes with zero findings.
- Build verification [38253958446](https://github.com/layalialzahra/layali-al-zahra-website/actions/runs/38253958446) passed audit, tests and build.
- Remaining: session revocation decision, stricter CSP, final proxy/runtime acceptance, functional acceptance, crawlability and Google API prerequisites. Vercel remains disconnected.


## Updated security and CI checkpoint — 2026-10-12

- Build verification [38255367374](https://github.com/layalialzahra/layali-al-zahra-website/actions/runs/38255367374) passed dependency audit, tests and build after the session-revocation and CSP script changes.
- Historical secret scan [38255367338](https://github.com/layalialzahra/layali-al-zahra-website/actions/runs/38255367338) passed: 364 commits / ~117.18 MB reachable history, zero text findings; 118 binary blobs containing printable strings / 170,446,401 bytes, zero findings. This is heuristic scanning and does not inspect compressed/encrypted payloads semantically.
- Session versioning is implemented and covered by regression tests. Password changes invalidate previous copied sessions on the next protected request.
- script-src has no unsafe-inline/unsafe-eval; tracking initialization is externalized. style-src unsafe-inline remains and requires separate layout-safe hardening. No browser/runtime test was performed.
- Google Business Profile access, crawlability proof of concept, migration dry-run/repeatability, responsive browser QA and final release approval remain pending. Vercel stays disconnected.


## Migration and crawlability proof checkpoint — 2026-10-12
- Migration tests cover the 56-record source mapping (15 services, 5 offers, 23 packages, 13 FAQs), dry-run without a MongoDB connection, preservation of display labels and repeat-apply idempotency. These are mock/unit tests; no real staging or production DB comparison/apply occurred.
- Added a component-level server-rendering proof test. [Build verification 38256652658](https://github.com/layalialzahra/layali-al-zahra-website/actions/runs/38256652658) passed audit, tests and build. Rendered HTML contains supplied published review text and excludes a supplied unpublished review. Existing hard-coded reviews remain the fallback.
- [Historical scan 38256652699](https://github.com/layalialzahra/layali-al-zahra-website/actions/runs/38256652699) passed: 371 commits / ~117.20 MB with zero text findings; 118 binary blobs / 170,446,401 bytes with zero findings.
- Remaining: route-aware SSR/hydration, database-backed published-review HTML, crawler HTTP acceptance, real staging migration comparison, Google API access, responsive browser QA and final release approval. Vercel remains disconnected.

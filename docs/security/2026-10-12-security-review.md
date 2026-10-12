# Application security review

Date: 2026-10-12
Scope: repository source, serverless API handlers, admin authentication, content rendering, uploads, Vercel configuration and dependency audit. This is a code review, not a penetration test of the deployed site.

## Findings addressed in this branch
- **Write-origin validation:** state-changing requests now fail closed when the `Origin` header is absent; mismatched origins remain rejected. Safe read methods can omit `Origin`.
- **Malformed cookies:** invalid percent-encoding is ignored instead of throwing during session lookup.
- **Upload content-type spoofing:** uploaded JPEG, PNG, WebP and GIF files must match their declared MIME type's file signature as well as the size/MIME allowlist.
- **Public diagnostics:** the catch-all no longer exposes the legacy `/api/test` collection-listing diagnostic. The public database health endpoint no longer returns the database name.
- **Stored HTML / XSS exposure:** blog/news/tip body content is sanitized with an allowlist HTML sanitizer, including when existing database records are serialized. Public content serialization now uses an explicit field allowlist instead of spreading every stored field.
- **CI write permissions:** build/test jobs use read-only repository permissions; dependency-lock updates run in a separate job with only the permission required to update the lockfile.
- **Dependency audit:** the initial audit reported 10 vulnerabilities (1 moderate, 7 high, 2 critical). Vite was updated to 6.4.4, Vitest to 4.1.11, compatible transitive fixes were applied and the regenerated lockfile was committed. The latest clean CI run used `npm ci`; `npm audit --audit-level=high` reported `found 0 vulnerabilities`, and tests/build passed.

## Remaining risks / follow-up
- **Repository visibility:** GitHub repository is public by owner decision until project completion. Public source visibility is not itself a server compromise, but secrets must never be committed. Repository privacy is deferred to the final stage as requested.
- **CSP:** `script-src` no longer permits `'unsafe-inline'` or `'unsafe-eval'`; Google Analytics and Meta Pixel bootstrap code was moved to same-origin `/tracking.js`, with regression tests. `style-src` still permits `'unsafe-inline'` because the current site uses inline styles. Browser/runtime tracking and layout checks remain pending.
- **Session revocation:** server-checked session versioning is now implemented. Tokens carry the admin session version; protected requests compare it with the current admin record. Password changes increment that version, invalidating copied old tokens on their next protected request. Regression tests and CI passed; end-to-end runtime verification remains pending.
- **Rate-limit identity:** Vercel's published request-header documentation says it overwrites `X-Forwarded-For` to prevent spoofing. This supports the current client-IP key for direct Vercel traffic; the actual deployment/proxy chain remains unverified while Vercel is disconnected.
- **Live configuration:** source review cannot prove that production environment variables are present, strong, rotated, or correctly scoped. Never print secret values; validate presence and length in the deployment environment during the final release checks.
- **Google API:** sync remains disabled until Google Business Profile API access is approved and OAuth/location credentials are configured. The endpoint validates complete pagination before local writes and does not mutate Google reviews.
- **Runtime verification and deployment hold:** The owner confirmed on 2026-10-12 that Vercel is disconnected and the current feature-branch changes are not deployed. Do not reconnect or trigger deployment during implementation; preserve the daily free deployment allowance. Live auth, upload and database behavior remain unverified until the final controlled release/acceptance window. A historical GitHub status/check labelled Vercel is not evidence that the current changes deployed.

## Scope limits
No production database was queried or modified. No live exploit attempt, external scan or production deployment was performed. Findings are based on repository code and CI evidence only.


## Owner-confirmed release constraint — 2026-10-12
Vercel remains disconnected by owner instruction and today's feature-branch changes are not deployed. Do not reconnect or trigger deployments during implementation. Reconnect only for the final controlled release after security, functional, crawlability and rollback acceptance are complete and the owner explicitly approves. No live penetration test or production verification has been performed in this review.


## Targeted follow-up review — 2026-10-12

### Additional checks performed
- Re-read the current authentication/session helpers, setup and password-change handlers, auth regression tests, catch-all API router, Google Reviews route handlers, upload handler, `index.html`, `vercel.json` and CI workflow on `feat/layali-managed-content-cms`.
- Existing automated auth coverage directly checks missing-Origin rejection for POST/PUT/DELETE, safe GET without Origin, matching vs mismatched HTTPS origins and malformed-cookie tolerance. It does not establish the reverse proxy's deployed header-trust behavior or session revocation.
- Reviewed the current repository tree for obvious credential-named paths and common binary/secret file extensions. The current tree includes tracked dependency/build artifacts, including a Windows esbuild executable under `node_modules/`; this is a repository hygiene/review item, not evidence of a secret. Do not remove tracked `node_modules/` or `build/` as part of this security pass without a separate scoped decision.
- The connector's code-search responses did not return reliable results for even known source identifiers. Therefore they are **not evidence of a clean secret scan** and are not used to close the historical/source/binary secret-review requirement.

### Current assessment
- No secret value was intentionally retrieved or printed during this follow-up. The complete all-history scan of text and binary blobs is **still outstanding**; current-tree filename checks alone are insufficient.
- CSP remains a deliberate follow-up rather than an untested one-line change: `index.html` contains inline Google Analytics and Meta Pixel snippets, while `vercel.json` permits inline scripts and eval. Plan a controlled CSP change that preserves analytics behavior and verify it with browser/runtime tests before release.
- **Production origin scheme hardened in source:** `sameOrigin()` now pins the expected scheme to HTTPS when `NODE_ENV=production`, ignoring `x-forwarded-proto` for that decision. Development still uses the forwarded protocol when supplied, otherwise HTTP. A regression test was added for a spoofed `http` forwarded-protocol header. This reduces dependence on that header for scheme validation; the separate `x-forwarded-for` client-IP trust assumption for rate limiting remains open.
- Sessions are stateless signed cookies with an eight-hour expiry. Password change clears the current response cookie, but there is no server-side token version/revocation check in the inspected helper. A previously copied valid token may remain accepted until expiry. Immediate revocation requires a deliberate design change and regression tests; do not imply it is already implemented.
- No code changes, secret rotations, production configuration checks, deployed exploit attempts or live penetration tests were performed during this follow-up.

### Priority 2 disposition
- Source-level review: continued; the above residual risks are confirmed.
- Targeted regression coverage: existing auth tests inspected, but no new tests were run in this connector-only pass.
- Full history/binary secret scan: open.
- CSP/proxy/session decisions and verification: open.
- Live environment checks: deferred to the final controlled release window; Vercel remains disconnected by owner instruction.


### Origin scheme hardening change — 2026-10-12
- Changed `api/_lib/auth.js` so production state-changing requests compare Origin against `https://{host}` regardless of `x-forwarded-proto`; development retains the existing local/proxy behavior.
- Added a regression test in `tests/api/auth-security.test.js` proving a forwarded-protocol value of `http` cannot make an HTTP Origin acceptable in production, while the matching HTTPS Origin is accepted.
- Code commit: `5bee062445dc9e852ebf4eca820f28073d943584`.
- Test commit: `6769ae39e4e9d504932e1354505ed81dd90ab41d`.
- GitHub Actions run [38251638974](https://github.com/layalialzahra/layali-al-zahra-website/actions/runs/38251638974) passed dependency installation, high-severity dependency audit, tests and build on commit `6769ae39e4e9d504932e1354505ed81dd90ab41d`. This verifies the regression test and source build in CI only; it is not live/staging verification. No Vercel deployment or production test occurred.


### CSP allowlist compatibility follow-up — 2026-10-12
- The existing inline Meta Pixel bootstrap loads `https://connect.facebook.net/en_US/fbevents.js`, but the previous CSP did not explicitly allow that script origin, and did not allow `https://www.facebook.com` in image/connect sources. This was a source/configuration finding; no browser runtime was available to confirm the actual blocked requests.
- Updated `vercel.json` to allow the existing Pixel script origin in `script-src`, and the Facebook beacon origin in `img-src` and `connect-src`. Added `tests/api/csp-config.test.js` to prevent these required allowlist entries from being removed accidentally.
- This does **not** resolve the separate use of `unsafe-inline` and `unsafe-eval`. A nonce/hash or external-script migration still requires a separately tested CSP change. No deployment/runtime confirmation is claimed.


- **CI result:** GitHub Actions run [38251889567](https://github.com/layalialzahra/layali-al-zahra-website/actions/runs/38251889567) passed dependency installation, high-severity dependency audit, all tests (including the new CSP allowlist test) and build on commit `09c393494383bc39de8c82ea29c68d95b38679b1`. This remains CI-only evidence; browser/runtime verification is pending.


### Historical secret scan execution — 2026-10-12
- Added `.github/workflows/secret-scan.yml` to run pinned Gitleaks `v8.30.1` against all reachable Git history (`fetch-depth: 0`, `--log-opts="--all"`) with redaction enabled.
- The first scan result is pending. Until it completes and any findings are triaged, the historical/text/binary secret-review requirement remains open. A passing scan is evidence for the scanner's coverage, not proof that secrets never existed in unreachable history or external systems.
- Workflow is limited to GitHub Actions; it does not connect Vercel or deploy the website.


### Scan execution wiring — 2026-10-12
- The separate scan workflow did not appear in the observed Actions run list after its addition to the feature branch. To ensure execution on this branch, the established Build verification workflow now checks out full history and runs the same pinned, redacted Gitleaks scan before dependency installation/tests/build.
- The standalone `.github/workflows/secret-scan.yml` is retained for explicit/manual and pull-request use when recognized by GitHub Actions. The combined build workflow is the immediate execution path.
- Scan result remains pending until the Build verification run reaches the Gitleaks step. No clean-scan claim is made before that result.


### Secret scan workflow syntax correction — 2026-10-12
- The first Build verification run after adding Gitleaks failed before creating a job; inspection found the shell command was incorrectly quoted as a YAML scalar. Corrected both workflow definitions to use a block scalar for the command.
- The all-history scan has **not yet completed**. Wait for the corrected Build verification run and inspect only redacted findings. Keep the history/binary secret-review gate open.


### Gitleaks result reporting correction — 2026-10-12
- The first completed all-history scan processed 352 commits and approximately 117 MB, then exited with code 1. The available step log did not expose usable finding metadata, so this cannot be treated as a clean scan and does not yet establish whether the exit was caused by findings or another scanner condition.
- Updated both workflow definitions to write a redacted JSON report and print only finding count, rule ID, file path, line number and abbreviated commit ID. Secret/match fields are never printed by the summary.
- The next run must be triaged using only that safe summary. Keep the historical secret-review gate open until the cause is understood and any findings are addressed or documented as verified false positives.


### Gitleaks triage — public Web3Forms access key
- The redacted report identified one `generic-api-key` match in `src/components/ContactPage.tsx` (historical commit prefix `4a1a56b0a5f2`). The value was not printed or copied into logs.
- The field is the Web3Forms `access_key` used by the browser-side contact form. Web3Forms' official FAQ says its access key is public by design and is not a secret API key; its docs also warn that someone with the key can submit unsolicited email requests. Sources: https://docs.web3forms.com/getting-started/faq and https://docs.web3forms.com/getting-started/api-reference.
- Added a narrow Gitleaks allowlist in `.gitleaks.toml` requiring both the `ContactPage.tsx` path and the `access_key` source-line pattern. This does not allowlist other rules or other files. Do not rotate/remove this key solely because of this finding; consider Web3Forms domain restrictions/spam controls if abuse occurs.
- Re-run the all-history scan to verify the finding is suppressed and no other findings remain. The scan still does not replace a separate binary-blob review, and the full security gate remains open until the corrected run completes.


### All-history Gitleaks scan result — 2026-10-12
- After adding the narrow Web3Forms allowlist, the standalone [Historical secret scan run 38252703895](https://github.com/layalialzahra/layali-al-zahra-website/actions/runs/38252703895) completed successfully: **354 commits scanned, approximately 117.15 MB scanned, 0 findings**.
- This closes the current Gitleaks text/history scan for reachable refs included by the full-history checkout. It does **not** prove secrets never existed in unreachable history or external systems, and it does not replace a dedicated binary-blob scan.
- The combined Build verification attempt at [38252703914](https://github.com/layalialzahra/layali-al-zahra-website/actions/runs/38252703914) failed during Gitleaks installation and skipped the build/test steps. To avoid coupling build reliability to scanner installation, Gitleaks now runs in the separate `.github/workflows/secret-scan.yml`; Build verification remains responsible for dependency audit, tests and build.
- Binary-blob inspection, `x-forwarded-for` trust, session revocation and strict CSP hardening remain open.


### Binary-blob review automation — 2026-10-12
- Added `scripts/scan-binary-history.py` and a step in the dedicated secret-scan workflow. It enumerates reachable Git objects, extracts printable strings from binary blobs and runs Gitleaks against those strings.
- The script prints only finding count, rule ID, source path, line and abbreviated blob ID; it does not print secret/match fields. It is heuristic and cannot inspect compressed/encrypted content semantically.
- First binary scan result is pending. Keep the binary-blob gate open until the workflow completes and findings, if any, are triaged.


### Binary-blob scan result — 2026-10-12
- The corrected [Historical secret scan run 38253553830](https://github.com/layalialzahra/layali-al-zahra-website/actions/runs/38253553830) passed: Gitleaks text/history scan covered 357 commits and approximately 117.16 MB with zero findings after the narrow public Web3Forms access-key allowlist.
- The binary-history step examined 118 reachable binary blobs containing printable strings, totaling 170,446,401 bytes, and reported zero findings.
- This is a successful heuristic scan of reachable Git history and printable binary strings. It does not semantically inspect compressed/encrypted payloads, unreachable Git objects, external systems or deployed environment values.
- Standard Build verification [38253553795](https://github.com/layalialzahra/layali-al-zahra-website/actions/runs/38253553795) passed dependency audit, tests and build on the same commit.
- At this historical checkpoint, remaining Priority 2 items were proxy trust, session revocation and stricter CSP. Session-version revocation and `script-src` hardening were implemented later and are documented in the latest verified implementation checkpoint below; actual proxy-chain and browser/runtime acceptance remain open.


### Latest scan and proxy-header assessment — 2026-10-12
- Latest [Historical secret scan run 38253765871](https://github.com/layalialzahra/layali-al-zahra-website/actions/runs/38253765871) passed: 358 commits / approximately 117.17 MB reachable history scanned, zero text findings after the narrow public Web3Forms allowlist; 118 binary blobs with printable strings / 170,446,401 bytes scanned, zero findings.
- Vercel's official [request-header documentation](https://vercel.com/docs/headers/request-headers) states that Vercel overwrites `X-Forwarded-For` to prevent IP spoofing and that `x-real-ip` is equivalent. This supports the current first-`x-forwarded-for` rate-limit key when requests reach Vercel directly. The actual production proxy chain remains unverified while Vercel is disconnected; if an additional proxy is introduced, verify its trust contract.
- The production Origin scheme fix and CSP compatibility test passed CI, but no live/browser runtime check occurred. Stateless session revocation and strict CSP removal of `unsafe-inline`/`unsafe-eval` remain open.


### Latest verified security evidence — 2026-10-12
- Latest [Historical secret scan run 38253958356](https://github.com/layalialzahra/layali-al-zahra-website/actions/runs/38253958356) passed: 359 commits / approximately 117.17 MB reachable history, zero text findings; 118 reachable binary blobs with printable strings / 170,446,401 bytes, zero findings.
- Standard Build verification [38253958446](https://github.com/layalialzahra/layali-al-zahra-website/actions/runs/38253958446) passed dependency audit, tests and build on the same checkpoint.
- Vercel's official request-header documentation says it overwrites `X-Forwarded-For` to prevent IP spoofing. This supports the current client-IP key when requests reach Vercel directly; actual proxy-chain behavior remains unverified while Vercel is disconnected.
- Session revocation and stricter CSP remain open; no deployed/browser acceptance is claimed.


## Latest verified implementation and CI checkpoint — 2026-10-12
- [Build verification 38255367374](https://github.com/layalialzahra/layali-al-zahra-website/actions/runs/38255367374) passed dependency audit, tests and build after session-version revocation, external tracking bootstrap and CSP script hardening.
- [Historical secret scan 38255367338](https://github.com/layalialzahra/layali-al-zahra-website/actions/runs/38255367338) passed: 364 commits / ~117.18 MB reachable history with zero text findings; 118 reachable binary blobs containing printable strings / 170,446,401 bytes with zero findings. The scan is heuristic and does not semantically inspect compressed/encrypted payloads or external/deployed environments.
- No unsafe-inline or unsafe-eval remains in script-src. style-src unsafe-inline remains as a separate layout compatibility risk; it has not been removed without a tested replacement for existing inline styles.
- Password changes increment sessionVersion; each protected API request checks the current admin record. A stale copied session is rejected after the version changes. CI regression tests pass; live MongoDB/runtime verification remains pending.
- No production DB was queried or modified. Vercel remains disconnected; no deployment or production acceptance was performed.

## Latest verified implementation and CI checkpoint — 2026-10-12

- Audited feature HEAD before this documentation commit: `046c4b7e4b5a7629fc860538b6d37b0e3b969e48`. GitHub compare confirms the branch ref was identical to this SHA.
- Build verification [38259999486](https://github.com/layalialzahra/layali-al-zahra-website/actions/runs/38259999486) passed dependency install, high-severity audit, tests and build. Historical scan [38259999483](https://github.com/layalialzahra/layali-al-zahra-website/actions/runs/38259999483) passed text/history and binary printable-string scan steps (413 commits / ~117.24 MB, zero text findings; 118 binary blobs / 170,446,401 bytes, zero findings per recorded scan output).
- Session-version revocation and strict `script-src` hardening are implemented and CI-tested. `style-src 'unsafe-inline'` remains. Actual proxy-chain behavior, browser/runtime CSP/tracking, live MongoDB session behavior and deployed auth/upload checks remain unverified.
- This is source/CI evidence, not a penetration test or production acceptance. Vercel remains disconnected and no production data was changed.

## Task 01 status reconciliation — 2026-10-12

- Current branch was verified at `dbd22794c87a7f6cd80003e32c4713d1463d8b34` immediately before this documentation-only reconciliation. It is 15 commits ahead of `046c4b7e4b5a7629fc860538b6d37b0e3b969e48`, with documentation-only changes; the source implementation remains the audited `046c4b7e4b5a7629fc860538b6d37b0e3b969e48` state.
- Build/audit/tests passed on `046c4b7e4b5a7629fc860538b6d37b0e3b969e48` in [38259999486](https://github.com/layalialzahra/layali-al-zahra-website/actions/runs/38259999486). Reachable history and printable binary-string scans passed on the same baseline in [38259999483](https://github.com/layalialzahra/layali-al-zahra-website/actions/runs/38259999483). No CI success is established for `dbd22794c87a7f6cd80003e32c4713d1463d8b34` or later docs-only commits: the only combined status context was Vercel: failure to a generic configuration-doc URL, and no Actions workflow runs were returned. This is not deployment evidence; Vercel remains disconnected by owner instruction.
- Implemented and CI-tested in source: server-checked session-version revocation and script-src hardening using same-origin `/tracking.js`. Remaining security acceptance: `style-src 'unsafe-inline'`, actual proxy-chain trust, browser/runtime CSP and tracking behavior, live MongoDB session revocation, and deployed auth/upload checks. Do not describe these as runtime-verified.
- Next task is Short Task List Task 02, confirming an authorised non-production verification environment. No Vercel reconnect/deployment is permitted. Core CMS staging acceptance, Google API/OAuth/location access, the generic SSR empty-root HTTP 200 fallback gap, migration/rollback, browser QA and owner release approval remain open.


### Package validation error classification — 2026-10-12

- Package acceptance tests exposed that `safeUrl()` rejects non-HTTPS external image URLs with the validation message “Image URL must use HTTPS”, but the managed-content route's validation-error classifier did not recognise that message and returned HTTP 503.
- Updated `api/_lib/managed-content-routes.js` so this input validation failure returns HTTP 400 instead of a service-unavailable response. Regression tests assert a controlled client error and no collection mutation for an unsafe image URL.
- Build verification [38273001219](https://github.com/layalialzahra/layali-al-zahra-website/actions/runs/38273001219) passed dependency audit (0 vulnerabilities), 87 Node tests, 27 Vitest tests across 6 files, client/SSR builds and homepage SSR smoke test. Historical scan [38273001202](https://github.com/layalialzahra/layali-al-zahra-website/actions/runs/38273001202) passed with zero Gitleaks findings across reachable history and zero findings in printable strings from reachable binary blobs.
- This is source/CI evidence only. No deployed endpoint, MongoDB or Blob storage was exercised. Task 02 still blocks runtime acceptance; Vercel remains disconnected.


## Short Task List Task 07 — admin security regression coverage (2026-10-12)

- Added `tests/api/admin-security-acceptance.test.js` in commit `410429bd8c866817ca6a8998eff99be9f61e228e`.
- The new route-level tests exercise unauthenticated POST/PUT/DELETE rejection and cross-origin POST/PUT/DELETE rejection, asserting the database is never reached. Invalid service creation, invalid sort-order update and malformed delete ID cases assert controlled HTTP 400 responses and byte-for-byte unchanged in-memory records.
- Existing `tests/api/auth-security.test.js` covers missing-Origin rejection, matching versus mismatched origins, production HTTPS origin pinning despite a spoofed forwarded-protocol value, malformed cookie handling, signed-session validation, session-version mismatch after password change and rejection when the admin record is missing.
- Source review found no additional confirmed application vulnerability in the inspected auth helpers and protected managed-content route. No production logic change was justified by this task; the change adds focused regression coverage.
- **CI execution status: pending verification.** The branch push should trigger Build verification, but no status context was returned for test commit `410429bd8c866817ca6a8998eff99be9f61e228e` at the time of this update. Do not claim tests/build passed until a completed run is verified.
- **Runtime status: not verified.** Task 02 remains blocked because no authorised, production-isolated non-production database/environment is established. No live API/database request, production write, deployment or penetration test was performed. Vercel remains disconnected. Session-version checks are unit-tested in source; live MongoDB revocation remains pending the approved runtime window.


### Task 07 final CI evidence — 2026-10-12
- Build verification [run 38276501223](https://github.com/layalialzahra/layali-al-zahra-website/actions/runs/38276501223) passed on tested feature-branch HEAD `59e33fce4d76311c60ed864981b533f3f3d5b8d1`: dependency installation, `npm audit --audit-level=high` (0 vulnerabilities), `npm test` (97 Node tests passed, 0 failed; 29 Vitest tests passed across 7 files), client build, SSR build and homepage SSR smoke test.
- Historical secret scan [run 38276501407](https://github.com/layalialzahra/layali-al-zahra-website/actions/runs/38276501407) passed on the same HEAD: 482 reachable commits / approximately 117.39 MB scanned with 0 Gitleaks findings; 118 reachable binary blobs / 170,446,401 bytes examined with 0 printable-string findings. Binary scanning is heuristic and does not semantically inspect compressed/encrypted payloads.
- The temporary draft CI PR [#3](https://github.com/layalialzahra/layali-al-zahra-website/pull/3) was closed unmerged after collecting the runs. No merge, `main` push, Vercel reconnect or deployment occurred.
- **Automated Task 07 acceptance: PASS.** Runtime security acceptance remains open: Task 02 has not established an authorised production-isolated test environment; live MongoDB session revocation and deployed auth/origin behavior were not tested. No new application logic vulnerability was confirmed, so no auth/API code fix was warranted.


## Short Task List Task 08 — image upload automated acceptance (2026-10-12)

**Automated acceptance: PASS** on tested code/test commit [a9c5469e94d0c8b18006cbb4c21059b7cdfd7d28](https://github.com/layalialzahra/layali-al-zahra-website/commit/a9c5469e94d0c8b18006cbb4c21059b7cdfd7d28). Runtime acceptance remains **OPEN/BLOCKED by Task 02** because no authorised production-isolated non-production environment and Blob storage have been verified.

- Added handler-level regression coverage to `tests/api/image-upload.test.js` for JPG/JPEG, PNG, WebP and GIF signature acceptance; unsupported SVG, MIME/signature mismatch and empty payload rejection; exact 4 MiB boundary and oversized bodies; declared Content-Length checks; malformed lengths and non-byte stream chunks; authentication and cross-origin rejection before reading/storing; generic storage/stream failure responses; and HTTPS storage URL validation.
- Hardened `api/admin/upload.js`: enforce the 4 MiB limit using both declared length and actual streamed bytes; reject non-byte chunks and malformed lengths; validate returned Blob URLs as HTTPS without embedded credentials; return the validated declared MIME type instead of trusting storage response metadata; and avoid returning or logging provider error objects. Valid upload paths remain under `layali-al-zahra/content/` with type-based extensions and public Blob access.
- First CI attempt [38277263547](https://github.com/layalialzahra/layali-al-zahra-website/actions/runs/38277263547) failed because the new test statically imported the upload handler before setting test-only MongoDB/session environment values. Updated the test to set test-only values before dynamic imports; no production credentials or runtime environment were used.
- Final Build verification [38277348263](https://github.com/layalialzahra/layali-al-zahra-website/actions/runs/38277348263) passed: `npm audit --audit-level=high` found 0 vulnerabilities; `npm test` reported 104 Node tests passed / 0 failed and Vitest reported 29 tests passed across 7 files; client build, SSR build and homepage SSR smoke test passed.
- Historical secret scan [38277348295](https://github.com/layalialzahra/layali-al-zahra-website/actions/runs/38277348295) passed: 491 reachable commits / approximately 117.41 MB scanned, zero Gitleaks findings; 118 binary blobs / 170,446,401 bytes of printable strings examined, zero findings. Binary scanning remains heuristic and does not semantically inspect compressed/encrypted payloads.
- No real Blob upload, staging request, database write, migration, deployment or public-source cutover occurred. Vercel remains disconnected. Automated tests use injected storage and in-memory/request fixtures; live storage behavior and deployment configuration remain unverified until Task 02 is unblocked.

## Public CMS API serialization review — 2026-10-12

- Added regression coverage for public Services, Offers, Packages and FAQs responses: published-only filtering, per-resource top-level allowlists, FAQ page scoping, empty collections, and generic 503 responses on connection, index-creation or read failures. Failure responses do not include database error details or cached/fallback CMS records.
- Confirmed and fixed a nested-field exposure risk in `serializeManagedItem`: service `subservices` had been passed through as complete nested objects despite the top-level allowlist. Nested serialization now permits only `id`, `name`, `price`, `description` and `bookingUrl`.
- Build verification [38280386368](https://github.com/layalialzahra/layali-al-zahra-website/actions/runs/38280386368) passed: 0 high-severity dependency vulnerabilities, 107 Node tests passed, 29 Vitest tests across 7 files passed, client/SSR builds and homepage SSR smoke test passed.
- Historical scan [38280386362](https://github.com/layalialzahra/layali-al-zahra-website/actions/runs/38280386362) passed with zero findings across 501 reachable commits and 118 binary blobs / printable strings. Binary inspection remains heuristic.
- This is source and automated CI evidence only. No live API, MongoDB or staging request was performed; Task 02 remains blocked. Vercel remains disconnected.


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


## Task 14 — Google Business Profile configuration review (2026-10-12)

- Inspected `.env.example` and the Google Reviews server-side configuration code. The checked-in example contains placeholder/empty values for `GOOGLE_BUSINESS_PROFILE_CLIENT_ID`, `GOOGLE_BUSINESS_PROFILE_CLIENT_SECRET`, `GOOGLE_BUSINESS_PROFILE_REFRESH_TOKEN` and `GOOGLE_BUSINESS_PROFILE_PARENT`; no secret values were accessed or recorded.
- The runtime configuration predicate checks non-empty values and the `accounts/{id}/locations/{id}` format only. A true result is not proof of Google API approval, API enablement, valid OAuth consent/scope, valid refresh token or access to the verified salon location.
- Current Vercel environment settings and Google Cloud project/quota/account permissions were not available for inspection. Therefore live credential presence and scope, API approval/enablement and location access remain **UNVERIFIED**, not confirmed missing and not passed.
- No token exchange, Google API call, live sync, database write, deployment or Vercel reconnection occurred. Keep Google sync and managed homepage reviews gated. Detailed evidence: [Task 14 prerequisite report](../GOOGLE-BUSINESS-PROFILE-PREREQUISITES-2026-10-12.md).

### Google Reviews moderation regression — 2026-10-13
- Source review: selection alone does not call a write endpoint; only explicit publish/unpublish actions change publication state.
- New reviews are merged with `isPublished: false` and `sortOrder: 0`; sync preserves the existing local publication/order values.
- Local deletion records the source ID in `google_review_suppressions` and deletes only the local review document. Subsequent sync filters suppressed IDs before upserting.
- Added a route-level lifecycle regression in `tests/api/google-reviews-moderation-e2e.test.js`. Build verification passed on `5872de79017b2cbb2d175ce445e4ca337f7ee6cd` ([run 38320839858]), including tests and build. Staging persistence remains unverified. No production data or Google source was changed.

### Google Reviews sync failure preservation — 2026-10-13
- Added fixture fault-injection tests for provider HTTP failure, timeout-class exception, incomplete page count and malformed response. Tests assert the review collection receives no bulk write and the complete local/published fixture remains unchanged.
- This validates the pre-write failure path under mocked conditions only. No live Google provider test was performed; Google API/OAuth/location and authorised isolated staging remain unverified. MongoDB bulk-write partial failure is a separate unverified risk. Evidence: `docs/GOOGLE-REVIEWS-SYNC-FAILURE-ACCEPTANCE-2026-10-13.md`.

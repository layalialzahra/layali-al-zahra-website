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
- **CSP:** the current policy still permits `'unsafe-inline'` and `'unsafe-eval'` in `script-src`. Inline analytics/Meta Pixel snippets exist in `index.html`; removing inline allowance requires moving them to external scripts or using a nonce/hash and verifying tracking behavior. This should be a separate tested change.
- **Session revocation:** sessions are stateless and last up to eight hours. Password change clears the current browser cookie but does not invalidate a previously copied session token immediately. Consider server-side session IDs/revocation if the admin threat model requires immediate revocation.
- **Rate-limit identity:** login lockout relies on proxy-provided client-IP headers. Verify the deployed proxy's header trust model before treating IP-based lockout as a strong control.
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

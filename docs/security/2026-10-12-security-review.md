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

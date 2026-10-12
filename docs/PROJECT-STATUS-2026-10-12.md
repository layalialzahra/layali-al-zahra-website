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
| CI, tests, dependency audit, build | Latest observed run passed | Rerun after code changes |
| Security | Source-reviewed; residual risks remain | CSP `unsafe-inline`/`unsafe-eval`; trusted-proxy IP assumptions; stateless-session revocation; full historical/binary secret review |
| CRUD/auth/uploads/public API | Not accepted end-to-end | Test auth, same-origin rejection, validation, upload limits/signatures, draft exclusion, error/fallback behavior |
| Migration | Not verified | Dry-run, source-to-schema mapping, count/content comparison and repeatability; no production apply |
| Google Reviews | Code exists; live access blocked | Verify API/OAuth/location prerequisites and test failure-preservation/suppression in controlled conditions |
| Crawlability | Research only | SSR/hydration proof of concept and HTTP HTML checks for published vs unpublished reviews |
| Responsive QA | Pending | Browser checks on public/admin desktop and mobile layouts |
| Rollback/cutover | Pending, not authorised | Document rollback, acceptance evidence and explicit owner approval |
| Vercel release | Deferred | Reconnect only after completion for one controlled final release |
| Repository privacy | Deferred | Final-stage owner-approved decision |

## Security source-review checkpoint

Source review found scrypt password hashing, HMAC-signed eight-hour HttpOnly/SameSite=Lax sessions (Secure in production), same-origin checks for state-changing requests, login lockout logic, 4 MB upload limits with MIME/signature matching, protected admin CRUD, published-only public reads, allowlisted serializers and Google sync pagination validation before local writes.

Residual risks: CSP allows `unsafe-inline` and `unsafe-eval`; login throttling trusts the first `x-forwarded-for` value pending proxy trust verification; sessions are stateless and a copied token may remain valid until expiry after password change. Live environment configuration and complete historical/binary secret review are unverified. This was a source review, not a penetration test or live acceptance.

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

# Task 25 — Deployed crawlability acceptance blocker
**Date:** 2026-10-13  
**Status:** OPEN / BLOCKED — no owner-approved release window or accessible deployed environment is evidenced.

## Exact blocker
- The owner-confirmed release hold remains active. Vercel is disconnected, and the instruction explicitly prohibits reconnecting it or deploying under the hold.
- No explicit owner approval identifying a release window and target environment was available in the project records reviewed for this task.
- Because Vercel remains disconnected and no separately approved deployed target/access was supplied, deployed runtime inspection could not be performed safely.

## Checks not run
No requests or deployment actions were made against a deployed target. These checks remain unverified:
- Vercel route rewrites and deployed function packaging.
- HTTP response status, headers and initial HTML for `/` and `/home`.
- Rendered title/description and canonical URL metadata on both routes.
- Published-only Google Reviews output, including exclusion of drafts and suppressed reviews.

Local SSR/build smoke tests are not substitutes for these deployed HTTP checks.

## Release evidence required
After explicit owner approval names the release window and environment, and access is provided, capture:
1. Target environment and approved window/authorisation reference.
2. Deployed commit and deployment identifier; deployed rewrite configuration and packaged function inventory.
3. Raw HTTP status/headers and initial HTML for `/` and `/home`.
4. Parsed metadata and canonical URLs for both responses.
5. Review fixture/runtime evidence proving published-only output and draft/suppressed exclusion, without exposing secrets or private review data.
6. Timestamped test results and any failures.

## Safety disposition
No Vercel reconnection, deployment, production write, migration, public-source switch or `main` change occurred. Managed public content remains disabled and legacy content remains the source of truth. Keep Task 25 unchecked/open until deployed evidence is captured in an explicitly approved release window.

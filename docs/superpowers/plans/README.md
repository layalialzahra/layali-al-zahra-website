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
- Remaining gates are browser/runtime CSP acceptance, session-revocation end-to-end acceptance, Google Business Profile access, crawlability proof of concept, functional/migration acceptance and final release approval. Vercel remains disconnected.

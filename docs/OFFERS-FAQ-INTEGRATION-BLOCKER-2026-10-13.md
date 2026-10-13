# Task 22 — Offers and FAQ Integration Blocker

**Date:** 2026-10-13  
**Status:** BLOCKED — prerequisite Core CMS acceptance is not recorded.

## Gate check

Core CMS acceptance remains **HOLD / OPEN** under Task 13. There is no verified owner-authorised, production-isolated staging database. Task 12 migration apply, real database counts and field integrity, repeat-run idempotency, and rollback/recovery have not been run. End-to-end staging checks for CRUD, authentication/origin controls, uploads, published public reads, and FAQ persistence/publication remain incomplete. Explicit written owner acceptance is outstanding.

Existing automated Offers/FAQ tests and passing CI do not satisfy this gate.

## Task 22 disposition

Stopped before application-code changes, feature-flag changes, or new integration tests. Offers/FAQ integration has not been accepted or newly tested under this task.

After the gate is satisfied, verify:
1. Published managed offers only, including exact pricing labels and validity labels/date boundaries.
2. Correct booking URLs and click-through behavior.
3. Published managed FAQ reads and expected page assignment.
4. Legacy content fallback when managed content is disabled or unavailable.
5. Existing layout, styling, and booking/contact behavior remain unchanged.
6. Error handling does not expose drafts or switch public content unexpectedly.

## Safety state

- Task 22 remains unchecked/open and blocked.
- Managed public content remains disabled; legacy content remains the public source of truth.
- Vercel remains disconnected.
- No deployment, production database access/write, migration, public-source switch, or `main` change occurred.

Related evidence: [Core CMS Acceptance Summary](./CORE-CMS-ACCEPTANCE-SUMMARY-2026-10-12.md), [Task 12 staging migration blocker](./MIGRATION-STAGING-BLOCKER-2026-10-12.md), and [project status](./PROJECT-STATUS-2026-10-12.md).

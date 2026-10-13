# Task 23 — Packages and FAQ Integration Blocker

**Date:** 2026-10-13  
**Status:** BLOCKED — prerequisite Core CMS acceptance is not recorded.

## Gate check

Core CMS acceptance remains **HOLD / OPEN** under Task 13. There is no verified owner-authorised, production-isolated staging database. Task 12 migration apply, real database counts and field integrity, repeat-run idempotency, and rollback/recovery have not been run. End-to-end staging checks for CRUD, authentication/origin controls, uploads, published public reads, and FAQ persistence/publication remain incomplete. Explicit written owner acceptance is outstanding.

Existing automated Packages/FAQ tests and passing CI do not satisfy this gate.

## Task 23 disposition

Stopped before application-code changes, feature-flag changes, or new integration tests. Packages/FAQ integration has not been accepted or newly tested under this task.

After the gate is satisfied, verify:
1. Published packages only and correct category/filter behavior.
2. Exact pricing, images and image rendering.
3. Correct booking destinations and click-through behavior.
4. Published managed FAQ reads and page assignment.
5. Legacy fallback when managed content is disabled or unavailable.
6. Existing layout, styling, package details and booking/contact behavior remain unchanged.
7. Errors do not expose drafts or unexpectedly switch the public content source.

## Safety state

- Task 23 remains unchecked/open and blocked.
- Managed public content remains disabled; legacy public content remains the source of truth.
- Vercel remains disconnected.
- No deployment, production database access/write, migration, public-source switch, or `main` change occurred.

Related evidence: [Core CMS Acceptance Summary](./CORE-CMS-ACCEPTANCE-SUMMARY-2026-10-12.md), [Task 12 staging migration blocker](./MIGRATION-STAGING-BLOCKER-2026-10-12.md), and [project status](./PROJECT-STATUS-2026-10-12.md).

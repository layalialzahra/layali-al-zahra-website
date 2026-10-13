# Task 21 — Services and FAQ Integration Blocker

**Date:** 2026-10-13  
**Status:** BLOCKED — prerequisite Core CMS acceptance is not recorded.

## Gate check

Core CMS acceptance is explicitly **HOLD / OPEN**. Task 13 remains open because end-to-end staging evidence and explicit written owner acceptance are missing. There is no verified owner-authorised, production-isolated staging database. Task 12 migration application, real database counts/field integrity, repeat-run idempotency and rollback/recovery were not run. Core CRUD/auth/upload/public-read and FAQ persistence/publication acceptance remain incomplete.

Automated Services/FAQ tests and passing CI are not the required Core CMS acceptance. They do not satisfy the prerequisite.

## Task 21 disposition

Stopped before changing application code or enabling managed Services/FAQ reads. No new integration tests were run because the task prerequisite failed. Existing feature-flagged/read-handler behavior is not being treated as accepted.

Required after the gate is satisfied:
1. Record staging CRUD, persistence, publication, published-only reads, auth/origin/upload and error/fallback evidence.
2. Complete the real staging migration comparison and rollback/recovery checks in an owner-authorised isolated environment.
3. Obtain explicit written owner acceptance for Core CMS.
4. Then test Services and FAQs behind the approved feature flag: published managed reads, legacy fallback, design/layout preservation, and booking/contact destinations and behavior.
5. Record test/build evidence and any confirmed fixes before marking Task 21 complete.

## Safety state

- Task 21 remains unchecked/open and blocked.
- Managed public content remains disabled; legacy public content remains the source of truth.
- Vercel remains disconnected.
- No deployment, production database access/write, migration, public-source switch or `main` change occurred.

Related evidence: [Core CMS Acceptance Summary](./CORE-CMS-ACCEPTANCE-SUMMARY-2026-10-12.md), [Task 12 staging migration blocker](./MIGRATION-STAGING-BLOCKER-2026-10-12.md), and [project status](./PROJECT-STATUS-2026-10-12.md).

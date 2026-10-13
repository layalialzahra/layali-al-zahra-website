# Task 24 — Homepage Showcase-to-Record Mapping Blocker

**Date:** 2026-10-13  
**Status:** BLOCKED — Core CMS acceptance remains HOLD / OPEN.

## Gate and disposition

Task 13 has not received explicit written owner acceptance. No owner-authorised production-isolated staging database is verified. The staging migration, real database counts and field integrity, repeat-run idempotency, rollback/recovery, and end-to-end CMS staging acceptance remain outstanding.

Because the curated homepage showcases would depend on managed Service, Offer and Package records, Task 24 did not change application code, feature flags, mapping behavior or tests. Existing automated CI does not replace the required gate or establish live record integrity.

## Required verification after Core CMS acceptance

- Map each curated homepage item to its canonical managed Service, Offer or Package record without changing the intended selection or order.
- Preserve current card design, labels, image behavior and booking destinations.
- Test missing, malformed/invalid and unpublished references; these must not leak unpublished records or create broken destinations.
- Verify the approved fallback behavior when managed records are disabled, unavailable or invalid; legacy content remains the public source until cutover is explicitly approved.
- Add regression tests for each mapping and failure path, run CI, and record the exact tested commit and evidence.
- Compare the rendered showcase against the existing homepage to confirm selection, order, design and booking behavior.

## Safety state

- Task 24 remains unchecked/open and blocked.
- Managed public content remains disabled; legacy content remains the source of truth.
- Vercel remains disconnected.
- No deployment, production database access/write, migration, public-source switch or `main` change occurred.

Related evidence: [Core CMS Acceptance Summary](./CORE-CMS-ACCEPTANCE-SUMMARY-2026-10-12.md), [Task 12 staging migration blocker](./MIGRATION-STAGING-BLOCKER-2026-10-12.md), and [project status](./PROJECT-STATUS-2026-10-12.md).

# Priority 2 — Legacy content import

**Date:** 2026-10-13  
**Branch:** `main`  
**Scope:** Import the existing website content into the managed CMS without replacing newer admin edits.

## Changes on main

- Fixed `scripts/migrate-managed-content.js`: it now inserts missing records only. A repeat run no longer overwrites edited text, prices, images, publication status or ordering.
- Added `api/admin/import-legacy-content.js`; the CMS import button now calls this endpoint instead of the previously referenced route that does not exist.
- The endpoint requires an authenticated admin, same-origin request, explicit confirmation, an enable flag, a dedicated staging MongoDB URI and a separate staging database name. It refuses to run when the staging configuration is absent or the database name is the production default.
- Updated the button confirmation and result message. Importing does not switch the public website to managed content.
- Updated the idempotency test to verify 56 records are not duplicated and admin edits remain unchanged on a repeat run.
- Fixed a related public-content fallback bug: when managed content is enabled and an API response is successfully empty (for example, all records are drafts), the site now keeps the empty result instead of restoring the legacy records. Updated the runtime-flag test to match the intended status check.
- Added endpoint tests for authentication, cross-origin rejection, explicit confirmation, disabled/misconfigured staging, production database refusal and successful staging-handler invocation.

## Source counts

| Content | Expected |
| --- | ---: |
| Services | 15 |
| Offers | 5 |
| Packages | 23 |
| FAQs | 13 |
| **Total** | **56** |

The source reconciliation record reports zero discrepancies across the 56 legacy source records. This is a source comparison, not proof of records in a database.

## Status

**Code changes committed directly to `main`. Actual staging import remains blocked** until the dedicated isolated staging connection and database are configured. No database import was run, no production data was touched, and no public content cutover was performed. Do not mark database import acceptance complete until staging counts, field integrity and repeat-run behavior are confirmed against that staging database.

## Commits

- `2a9570d5d3159e0f43d166cb3ef101c5f7c88216` — preserve existing CMS edits during import
- `7c4229706d683121ea16f404ecc9daac344b4076` — regression test for repeat import and admin-edit preservation
- `530a71900cc29ffd2f91de9087c2d3c5a49b5d7f` — add staging-only import endpoint
- `84b4028f2f08adb9e2b4e452fb36a8df6fbc1c14` — connect CMS import button to the safe endpoint
- `8a525bf930b9689d9bfd7e0e9aae37d5bd35ed0e` — make endpoint testable and preserve staging-only gate
- `a752e080ef6e75858b5126354d63fc0e195b7ef8` — add endpoint regression tests
- `59e0b5c89b8fae1ba1a29b9a41352ed9706ac25a` — preserve intentionally empty managed content
- `aae2b06fe941abfe822e9578ecd4b3472dc0d2d9` — align runtime-flag regression test

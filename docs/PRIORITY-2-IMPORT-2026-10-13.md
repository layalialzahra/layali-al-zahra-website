# Priority 2 — Legacy content import

**Date:** 2026-10-13  
**Branch:** `main`  
**Scope:** Import the existing website content into the managed CMS without replacing newer admin edits.

## Changes on main

- Fixed `scripts/migrate-managed-content.js`: it now inserts missing records only. A repeat run no longer overwrites edited text, prices, images, publication status or ordering.
- Added the import handler under `api/_lib/import-legacy-content.js` and routed it through the shared API function to stay within Vercel Hobby's 12-function limit.
- The CMS import button calls the shared endpoint using the same `MONGODB_URI` and `MONGODB_DB_NAME` as the live CMS. It requires an authenticated admin, a same-origin request and explicit confirmation. No staging database or separate credentials are required.
- Updated the button confirmation and result message to clearly say it imports missing records into the live CMS database.
- Updated the idempotency test to verify 56 records are not duplicated and admin edits remain unchanged on a repeat run.
- Fixed a related public-content fallback bug: when managed content is enabled and an API response is successfully empty (for example, all records are drafts), the site now keeps the empty result instead of restoring the legacy records. Updated the runtime-flag test to match the intended status check.
- Added endpoint tests for authentication, cross-origin rejection, explicit confirmation, missing live database configuration and successful invocation using the live CMS database settings.

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
- `530a71900cc29ffd2f91de9087c2d3c5a49b5d7f` — add import endpoint
- `84b4028f2f08adb9e2b4e452fb36a8df6fbc1c14` — connect CMS import button to the safe endpoint
- `8a525bf930b9689d9bfd7e0e9aae37d5bd35ed0e` — make endpoint testable
- `a752e080ef6e75858b5126354d63fc0e195b7ef8` — add endpoint regression tests
- `59e0b5c89b8fae1ba1a29b9a41352ed9706ac25a` — preserve intentionally empty managed content
- `aae2b06fe941abfe822e9578ecd4b3472dc0d2d9` — align runtime-flag regression test

- `2c0ca3d0f9cf0ff9d9b358d4be94893dd1c552cf` — use live CMS database settings
- `d835d86bb03655972c00862348a82d423910db64` — fix stale test import path and update live database tests
- `c1dba6c89842eba39dfb32d7e8abf2006bafb120` — update CMS button text for live import
- `e32c1f850fe64b52d4929485588e8cfc1e5c6cd5` — align import test wording

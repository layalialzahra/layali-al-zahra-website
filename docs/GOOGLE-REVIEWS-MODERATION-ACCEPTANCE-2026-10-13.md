# Task 16 — Google Reviews moderation lifecycle

**Date:** 2026-10-13  
**Repository/branch:** `layalialzahra/layali-al-zahra-website` / `feat/layali-managed-content-cms`  
**Status:** OPEN — automated regression added and CI-passed; authorised runtime acceptance pending.

## Scope checked

- New provider imports use `mergeSyncedReview`, which defaults new records to unpublished and sort order 0.
- The admin selection control is client-side state only; the publish endpoint is called only by the explicit Publish action.
- The sync merge preserves existing `isPublished`, `sortOrder` and `createdAt`.
- Delete creates a local suppression record keyed by the Google review ID, then deletes only the selected document from `google_reviews`. It does not call a Google delete endpoint.
- Sync filters suppressed source IDs before upserting, preventing a locally deleted review from silently returning on a subsequent sync.
- Public serialization/read paths exclude unpublished records and suppressed IDs.

## Regression test added

`tests/api/google-reviews-moderation-e2e.test.js` exercises the admin delete route and sync route against the same isolated in-memory database fixture. It checks that:
1. deletion removes only the chosen local record and records its source ID in suppression;
2. the next sync skips that source ID while retaining another local record;
3. a newly imported review starts unpublished;
4. an explicit publish request changes the publication state;
5. a subsequent sync preserves publication and ordering for existing records and does not restore the suppressed review.

Existing UI tests separately assert that selecting a review does not issue a write request and only the explicit publish action sends the publish request. Existing sync tests cover publication/order preservation and suppressed IDs.

## Result and limits

This is provider-independent automated route-level coverage, not a live Google sync or deployed browser acceptance. Build verification passed on commit `5872de79017b2cbb2d175ce445e4ca337f7ee6cd`: dependency install, dependency audit, test suite and application build all passed ([run 38320839858](https://github.com/layalialzahra/layali-al-zahra-website/actions/runs/38320839858)). Live staging persistence remains unavailable/unverified under the existing environment hold. No production database, Google API, Vercel deployment, public review source or live data was touched.

No confirmed production defect was found in the inspected moderation paths, so no runtime behavior was changed. Task 16 remains open until CI evidence is confirmed and the applicable staging/runtime acceptance gate is available.

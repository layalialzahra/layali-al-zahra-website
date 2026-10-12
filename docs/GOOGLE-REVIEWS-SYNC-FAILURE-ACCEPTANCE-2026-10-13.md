# Task 17 — Google Reviews sync failure preservation

**Date:** 2026-10-13  
**Status:** Automated regression and CI checks PASS; authorised runtime acceptance pending.

## Automated failure cases added

Extended `tests/api/google-reviews-sync.test.js` with independent fixture cases for:
- Google reviews endpoint returns an unsuccessful HTTP response;
- provider fetch throws a timeout-class error;
- final page has fewer reviews than `totalReviewCount`;
- provider returns an invalid page shape.

Each case seeds both a published review and an unpublished draft. It asserts HTTP 502, zero review-collection `bulkWrite` calls, deep equality of the full local review records before/after the failed sync, and preservation of the published subset. The incomplete review is not imported.

## Source behavior reviewed

`fetchAllGoogleReviews` obtains and validates all provider pages before the sync handler prepares review upserts. Non-success responses, fetch exceptions/timeouts, malformed page shapes and total-count mismatch throw before the review collection's `bulkWrite`. The route returns HTTP 502 from that failure path. The new tests are mocked-provider fault injection only.

## Results and limits

- These tests do **not** establish live Google provider behavior, authorised API access, or actual network timeout behavior against Google.
- Provider-level testing was not performed because Google Business Profile API/OAuth/location access remains unverified and there is no authorised isolated staging target.
- The test asserts preservation when source retrieval fails before writes. It does not establish cross-document atomicity if MongoDB itself fails during `bulkWrite`; that remains a separate risk documented under Task 15.
- No confirmed source-fetch failure defect was found in the inspected implementation, so no runtime behavior change was made.
- Build verification [38321074011](https://github.com/layalialzahra/layali-al-zahra-website/actions/runs/38321074011) passed install, dependency audit, tests and build on test commit `03dd11ae1ce6cb46eeacda9084726b532844914e`. Historical secret scan [38321073947](https://github.com/layalialzahra/layali-al-zahra-website/actions/runs/38321073947) passed on that commit. Keep Task 17 open until the authorised runtime gate is available. No live API calls, production database writes, deployment or public-source cutover occurred.

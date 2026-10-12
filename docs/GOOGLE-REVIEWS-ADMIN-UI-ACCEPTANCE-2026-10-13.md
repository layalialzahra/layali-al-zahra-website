# Task 18 — Google Reviews admin UI acceptance

**Date:** 2026-10-13  
**Status:** UI regression coverage added; CI/runtime acceptance pending.

## Automated UI cases added

Expanded `tests/admin/GoogleReviewsManager.test.tsx` to cover:
- rating and publication filters passed to the admin API;
- search submission and query encoding;
- explicit unpublish request and the reloaded unpublished state;
- deletion confirmation cancellation without a DELETE request;
- visible loading state until the initial request resolves;
- list-load errors displayed as an alert rather than an empty-state success;
- sync failure displayed as an error while retaining the last displayed review;
- publication API failure displayed while retaining the review;
- unavailable/unverified Google credentials keep the sync button disabled and explain why;
- existing tests cover selection without publication, explicit publish, and local-only deletion confirmation.

The new failed-response fixture accepts explicit HTTP status and `ok` values so UI tests exercise the component's non-success response handling.

## API/source behavior checked

- Rating, publication and committed search filters are sent to the admin list API.
- Publish/unpublish are explicit PUT actions; selection itself sends no write.
- Delete requires confirmation and sends DELETE only after confirmation.
- Sync remains disabled unless the list API reports `syncAvailable: true`.
- Failed list/action/sync requests are surfaced as alerts. Failed publish/sync paths do not intentionally remove the displayed review.

## Results and limits

- CI for the test changes is pending confirmation.
- These are automated component/API-fixture tests, not deployed browser acceptance or live database persistence proof.
- Google Business Profile API/OAuth/location access and an authorised isolated staging target remain unverified. No provider-level sync was performed.
- No production data, live Google source, Vercel deployment or public review cutover was touched.
- Task 18 remains open until CI results are confirmed and the authorised runtime persistence/acceptance gate is available.

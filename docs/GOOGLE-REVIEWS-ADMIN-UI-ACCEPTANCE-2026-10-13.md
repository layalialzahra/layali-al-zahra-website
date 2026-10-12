# Task 18 — Google Reviews admin UI acceptance

**Date:** 2026-10-13  
**Status:** Automated checks PASS; confirmed error-state defect fixed; authorised runtime/browser acceptance remains open.

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

## Confirmed defect and fix

The first CI run exposed two test failures. One assertion matched both the filter option and review status label; the test was corrected to target the status element. More importantly, an initial list-load failure showed an error alert alongside the misleading “No synced Google reviews yet” empty state. The component now clears stale list/selection state on a list-load failure, shows a dedicated “Unable to load Google reviews” state with a retry action, and distinguishes an empty filtered result from a truly empty review list.

## Results and limits

- Build verification [38321584041](https://github.com/layalialzahra/layali-al-zahra-website/actions/runs/38321584041) passed on `d6170e93e67d5950f46a4eb3a116dbafc10c77aa`: dependency install, dependency audit, full tests and build. The run reports 126 Node tests and 37 Vitest tests passing, including 11 Google Reviews manager UI tests.
- These are automated component/API-fixture tests, not deployed browser acceptance or live database persistence proof.
- Google Business Profile API/OAuth/location access and an authorised isolated staging target remain unverified. No provider-level sync was performed.
- No production data, live Google source, Vercel deployment or public review cutover was touched.
- CI results are confirmed. Task 18 remains open until the authorised runtime persistence and deployed-browser acceptance gate is available.

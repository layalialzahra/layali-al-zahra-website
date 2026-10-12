# Layali Al Zahra Google Reviews Sync and Publishing Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Let an admin manually sync reviews from the salon's Google Business Profile, choose reviews individually or in bulk, and explicitly publish, unpublish or delete local synced records.

**Architecture:** Use a separate `google_reviews` collection and protected server-side sync handler. Sync/import, selection and publication are distinct operations. Preserve the current hard-coded homepage review carousel until the core CMS, API access and review behavior have passed staging acceptance and the owner approves cutover.

**Tech Stack:** Vercel serverless API functions, MongoDB Atlas, existing admin auth, Google Business Profile API with OAuth 2.0 only after access is verified.

**Spec:** `docs/superpowers/specs/2026-10-12-layali-cms-expansion-design.md`

## Global Constraints

- Do not assume Business Profile API approval, OAuth configuration, location access or Vercel credentials exist.
- Sync is manual/on-demand for the first version; do not implement a recurring schedule.
- Selecting reviews must not publish them; only an explicit Publish Selected Reviews action publishes.
- Unpublish preserves the local record; delete affects only the local record and never the original Google review.
- A sync failure must not clear or change the currently published review set.
- Preserve existing publication choices and ordering for previously synced records.
- Never log or expose OAuth tokens, refresh tokens, environment values or private credentials.

## Review Focus

1. An API timeout/permission error must preserve all previously synced and published records.
2. A locally deleted review must not silently reappear on the next sync.
3. A sync update must preserve local `isPublished` and `sortOrder` values.
4. A review that Google edits or removes must not be silently deleted from the published homepage based on one incomplete sync.
5. Selection changes must never change publication state until an explicit publish/unpublish action is submitted.

---

### Task 1: Verify external API prerequisites and decide sync edge policies

**Files:**
- Update: `docs/superpowers/specs/2026-10-12-layali-cms-expansion-design.md` only if owner-approved decisions change
- Update: Notion `decisions.md` and `log.md`

- [ ] **Step 1: Verify Business Profile access without exposing secrets**
  - Confirm API project approval, API enablement, OAuth setup and verified location access with the account owner.
  - Check presence/names of expected environment variables only; never print their values.
- [x] **Step 2: Confirm policy for removed/edited reviews and local deletion**
  - **Decision recorded and implemented:** use durable suppression/tombstones keyed by `googleReviewId`; local deletion remains local and the review must not silently re-import. Source-owned fields may update while local publication/order are preserved. Reviews absent from one completed sync are retained for explicit admin review.
- [x] **Step 3: Record verified result and owner decision**
  - The policy decision is recorded in the project decision log and current branch. **Business Profile API approval, OAuth setup and location access are still unverified**; do not claim live sync acceptance or simulate a successful sync against real data.
  - Until access is verified, restrict further verification to provider-independent tests and source review.

### Task 2: Implement Google review schema and safe synchronization service

**Files:**
- Create: `api/_lib/google-reviews.js`
- Test: `tests/api/google-reviews.test.js`

**Interfaces:**
- `normalizeGoogleReview(apiReview)` maps only documented API response fields into a local record.
- `mergeSyncedReview(existing, incoming)` updates source-owned fields while preserving local `isPublished` and `sortOrder`.
- Unique key: `googleReviewId`; source fields and timestamps must follow the verified official API response.
- A sync operation reports inserted, updated, suppressed and failed counts without returning credentials.

- [x] **Step 1: Unit test coverage exists**
  - Test field mapping, absent optional fields, malformed records, stable IDs, publication/order preservation, suppression/tombstone behavior and source timestamp handling.
- [x] **Step 2: Run the unit tests**
  - The Google Reviews unit tests are included in the full npm test CI suite; the latest build verification passed.
- [x] **Step 3: Implement pure mapping/merge helpers**
  - Do not import undocumented properties; validate against actual API docs/response schema first.
- [x] **Step 4: Run tests**
  - Full CI test suite passed; see [Build verification run 38255367374](https://github.com/layalialzahra/layali-al-zahra-website/actions/runs/38255367374).

### Task 3: Implement manual sync endpoint and review admin APIs

**Files:**
- Create: `api/admin/google-reviews.js`
- Create: `api/admin/google-reviews-sync.js`
- Test: `tests/api/google-reviews-routes.test.js`

**Interfaces:**
- Admin list supports search, rating filter, `isPublished`, pagination and stable ordering.
- Explicit publish/unpublish operations accept selected local IDs and return updated records.
- Delete removes local records only; suppression state must remain if chosen in Task 1.
- Sync endpoint is a POST route protected by `requireAdmin` and `sameOrigin`, uses server-side OAuth and idempotent upsert, and does not publish newly imported records.

- [x] **Step 1: Route test coverage exists**
  - Cover unauthenticated requests, cross-origin writes, invalid IDs, partial bulk failure behavior, sync timeout/permission error, and ensure a failed sync does not alter published records.
- [x] **Step 2: Run route tests**
  - Route tests are included in the full npm test CI suite; the latest build verification passed.
- [x] **Step 3: Implement protected handlers**
  - Keep sync transaction/staging semantics safe: fetch and validate source results before mutating local records where possible; report partial provider failure explicitly.
  - Preserve local state on provider errors.
- [x] **Step 4: Run route tests**
  - Run: `npm test -- tests/api/google-reviews-routes.test.js`
  - Expected: PASS.
- [x] **Step 5: Run all tests and build**
  - Run: `npm test && npm run build`
  - Expected: pass.

### Task 4: Add review management UI

**Files:**
- Create: `src/components/admin/GoogleReviewsManager.tsx`
- Modify: `src/components/AdminPage.tsx`, `src/components/admin.css`
- Test: `tests/admin/GoogleReviewsManager.test.tsx`

**Interfaces:**
- Add Google Reviews navigation within authenticated admin.
- Actions: Sync from Google; select individually or select all on the current page; Publish Selected Reviews; Unpublish Selected; Delete Selected Synced Reviews.

- [x] **Step 1: UI test coverage exists**
  - Verify selecting records does not publish, publish/unpublish require explicit actions, sync loading/error state is clear, and delete confirmation states that only local records are deleted.
- [x] **Step 2: Run UI tests**
  - The manager tests are included in the full npm test CI suite; the latest build verification passed.
- [x] **Step 3: Implement the manager**
  - Display author, rating, review text, source date and publication state only when available from verified source fields.
  - Disable actions during in-flight operations and keep existing list state on sync failure.
- [x] **Step 4: Run UI tests**
  - Run: `npm test -- tests/admin/GoogleReviewsManager.test.tsx`
  - Expected: PASS.

### Task 5: Staging acceptance gate

- [x] **Step 1:** Run `npm test && npm run build` — passed in [CI run 38255367374](https://github.com/layalialzahra/layali-al-zahra-website/actions/runs/38255367374).
- [ ] **Step 2:** With verified test location/API access, perform a manual sync in staging and compare returned records with source reviews.
- [ ] **Step 3:** Verify imported reviews remain unpublished, explicit bulk/individual publishing works, unpublishing preserves records, local deletion does not call Google mutation endpoints, and a failed sync preserves the last good published set.
- [ ] **Step 4:** Confirm the homepage still uses the existing hard-coded reviews until separate cutover approval.
- [ ] **Step 5:** Update Notion decisions/stages/log with actual evidence. Do not claim the integration is connected if access remains unavailable.

---

## Current acceptance status — 2026-10-12
- Provider-independent mapping/merge logic, protected route handlers and the review manager are implemented. Unit, route and UI tests are present and the full test/build pipeline passed in [run 38255367374](https://github.com/layalialzahra/layali-al-zahra-website/actions/runs/38255367374).
- Reachable-history security scan passed in [run 38255367338](https://github.com/layalialzahra/layali-al-zahra-website/actions/runs/38255367338): 364 commits / ~117.18 MB with zero text findings; 118 binary blobs / 170,446,401 bytes of printable strings with zero findings.
- **Still pending:** owner/account verification for Google Business Profile API approval, OAuth and location access; live sync comparison; staging validation of publish/unpublish/delete and failure-preservation; approved homepage cutover. The current homepage review carousel remains the fallback.
- All session-protected routes now await server-side session-version validation. Password changes increment the admin session version, invalidating previously copied sessions on their next protected request. This change passed the full CI suite.
- CSP script-src no longer permits unsafe inline/eval scripts. Google Analytics and Meta Pixel bootstrapping moved to same-origin /tracking.js; a configuration test checks for inline executable scripts. Browser/runtime confirmation remains pending.

## Latest verification checkpoint — 2026-10-12

- Current audited feature HEAD before this documentation commit: `046c4b7e4b5a7629fc860538b6d37b0e3b969e48`.
- Build/test/dependency audit passed in [run 38259999486](https://github.com/layalialzahra/layali-al-zahra-website/actions/runs/38259999486); reachable history and binary printable-string scan passed in [run 38259999483](https://github.com/layalialzahra/layali-al-zahra-website/actions/runs/38259999483).
- Provider-independent mapping/merge, routes and admin UI remain implemented/tested. Business Profile API approval, OAuth and verified location access remain unverified; live sync, staging publish/unpublish/delete, and failure-preservation acceptance remain open.
- This CI evidence does not change the staging acceptance checkboxes. Do not reconnect Vercel or claim live API success.

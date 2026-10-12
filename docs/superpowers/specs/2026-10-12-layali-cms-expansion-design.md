# Layali Al Zahra CMS Expansion — Design Specification

**Status:** Draft for owner review  
**Date:** 2026-10-12  
**Repository:** layalialzahra/layali-al-zahra-website  
**Approved direction:** Dedicated content modules; reuse existing CMS infrastructure where appropriate.

## 1. Goal

Allow an authorised, non-technical admin to create, edit, order, publish, unpublish and delete Services, Offers, Packages and page FAQs through `/admin`, and manage which genuine Google Business Profile reviews appear in the homepage review section, without editing application code for routine content changes.

## 2. Verified baseline

- Frontend: React 18, TypeScript and Vite SPA.
- Backend: Vercel serverless API functions in `api/`.
- Data: MongoDB Atlas; database name defaults to `layalialzahra`.
- Media: Vercel Blob through existing admin upload endpoint.
- Existing admin: `src/components/AdminPage.tsx` and `AdminContentManager.tsx`.
- Existing authentication: `api/_lib/auth.js`; protected admin endpoints use `requireAdmin` and same-origin checks.
- Existing content model/API: `api/_lib/content.js`, `api/admin/content.js` and `api/content.js`, currently limited to `blog | tip | news`.
- Public pages: `ServicesPage.tsx`, `OffersPage.tsx`, `PackagesPage.tsx`; their main data and FAQs are hard-coded.
- Homepage: `HomePage.tsx` has hard-coded service/offer/package showcases and review data.
- Vercel SPA rewrites and security headers are in `vercel.json`.
- CI workflow builds with `npm run build`; package scripts do not currently provide a project test command.
- Existing BRD: `docs/ADMIN-CMS-BRD.md` has deferred stages for offers, services/packages and testimonials.
- Repository tree contains tracked `node_modules/` and `build/` paths. This is a separate maintenance concern; do not delete them as part of this feature without a scoped review.
- The repository was last verified public. This project has not changed its visibility.
- `.env.example` documents MongoDB and admin variables but no Google Business Profile settings. Vercel credential state and API access remain unverified.

## 3. Design principles

1. Preserve the current public visual design, page routes, booking destinations, existing approved content and Blog/Beauty Tips/News behavior.
2. Use dedicated modules and purpose-specific validation rather than expanding the existing editorial content type set to include every entity.
3. Reuse established authentication, MongoDB connection, upload and admin interaction patterns where they fit.
4. Database-backed publishing should not require a code deployment.
5. Keep migration separate from cutover: old hard-coded content remains the fallback until imported data is verified and the owner approves switching the public page.
6. Every write endpoint is authenticated, validates input and applies same-origin protection consistent with current patterns.
7. Use explicit destructive-action confirmation; distinguish unpublish from delete.
8. Do not store secrets in code, Notion, logs or sample data.
9. Do not claim a deployment, API access, test pass or live state unless verified.

## 4. Content modules and data model

Use dedicated MongoDB collections unless repository inspection during implementation demonstrates a clear, safe existing collection convention that should be reused. Collection and field names below are proposed interface contracts and should remain stable once approved.

### 4.1 Services

Suggested collection: `services`.

Fields:
- `_id`: MongoDB identifier.
- `slug`: unique, normalized stable identifier.
- `title`, `description`.
- `imageUrl`, `imageAlt` (optional).
- `subservices`: ordered array of objects with stable local ID, name, price display value, optional description and optional booking URL.
- `category` or category key, if needed by current page filters.
- `sortOrder`: numeric ordering value.
- `status`: `draft` or `published`.
- `seoTitle`, `metaDescription` (optional).
- `createdAt`, `updatedAt`.

Prices must support current display strings such as AED amounts and “from” pricing; do not force numeric conversion that changes current display. Preserve all existing category and subservice relationships during migration.

### 4.2 Offers

Suggested collection: `offers`.

Fields:
- `_id`, unique `slug`, `title`, `description`.
- `priceLabel` or `badgeText` for current display badges.
- `imageUrl`, `imageAlt`.
- `validityType`: defined date range or recurring text label, so existing values like “Every Monday” are not misrepresented as dates.
- `validFrom`, `validUntil` for actual date-based offers; optional.
- `validityLabel` for display when validity is recurring or descriptive.
- `bookingUrl`, `sortOrder`, `status`, optional SEO fields and timestamps.

Expired-offer behavior must be based on validity type: a date-bound offer can be excluded or marked expired according to an owner-approved rule; recurring labels must not be treated as expired dates. Do not invent validity dates.

### 4.3 Packages

Suggested collection: `packages`.

Fields:
- `_id`, unique `slug`, `title`, `description`, `priceLabel`.
- `category`, `imageUrl`, `imageAlt`.
- `includedItems` or an ordered package details array only if needed by current UI/content; optional.
- `bookingUrl`, `sortOrder`, `status`, optional SEO fields and timestamps.

Preserve the existing category-based filters and display prices exactly during initial migration.

### 4.4 FAQs

Suggested collection: `faqs`.

Fields:
- `_id`, `pageKey` limited to `services | offers | packages`.
- `question`, `answer`, `sortOrder`, `status`, timestamps.

FAQs are separate records so an admin can add, edit, reorder, publish, unpublish or delete a single question without editing an entire page. The public page reads only published FAQs for its own `pageKey`.

### 4.5 Google Business Profile reviews

Suggested collection: `google_reviews`.

Fields should be limited to what the authorised API returns and what the admin/public experience needs:
- Stable source `googleReviewId` unique key.
- `authorName`, `rating`, `reviewText`, source review/create/update timestamps and review URL if provided by the API.
- `isPublished`, `sortOrder`, `syncedAt`, `sourceUpdatedAt`.
- Optional import/error metadata that does not expose credentials.

Validate exact fields against the official API response before implementation. Do not fabricate missing review details. Store only the necessary review fields.

## 5. API and security shape

Follow existing Vercel serverless handler patterns. Suggested route families:
- `/api/admin/services` and public `/api/services`
- `/api/admin/offers` and public `/api/offers`
- `/api/admin/packages` and public `/api/packages`
- `/api/admin/faqs` and public `/api/faqs`
- `/api/admin/google-reviews` for list, select/publish, unpublish and local deletion
- `/api/admin/google-reviews/sync` for explicit sync operation, subject to Vercel route conventions and verified API access
- A public published-reviews read path for the homepage.

Final route design must match existing Vercel file-based API routing and avoid ambiguous path matching. Admin writes must:
- Require an authenticated admin session.
- Validate method, same-origin request and payload.
- Enforce allowed fields and valid statuses.
- Prevent duplicate slugs/source review IDs.
- Return consistent status codes and useful non-secret errors.
- Never expose OAuth tokens, environment values or database connection details.

Public reads must return published records only, with safe serialization and appropriate cache behavior. Existing content API behavior must remain unchanged.

## 6. Admin UX

Add dedicated sections to the existing admin navigation and dashboard for Services, Offers, Packages, FAQs and Google Reviews. Reuse the current visual system and form/list patterns.

Each content module should provide:
- Search/list view and a clear empty state.
- Create and edit forms with field-level validation.
- Image selection/upload where relevant.
- Draft/published state, publish/unpublish actions and sort ordering.
- Delete confirmation and success/failure/loading states.
- Clear distinction between unsaved edits and public changes.

FAQs can be filtered by page. Review management must show source review details and published state, support individual and bulk selection, and make bulk actions explicit.

Do not publish reviews immediately when a checkbox is ticked. Provide distinct actions:
- **Sync from Google**
- **Publish Selected Reviews**
- **Unpublish Selected**
- **Delete Selected Synced Reviews**

Delete must confirm that only local CMS copies will be removed, not the original Google reviews. When a review is published, ordering controls should determine the homepage order. The existing hard-coded review set remains the fallback until approved cutover.

## 7. Google Business Profile integration

API access is an external dependency, not an assumed capability. Before implementing live sync:
1. Confirm the salon's verified Google Business Profile location and account access.
2. Confirm a Google Cloud project is approved for Business Profile API use and the required review-read API access is enabled.
3. Confirm OAuth consent/configuration and secure server-side token handling.
4. Confirm required production environment variables are present by checking names/presence only; never print secret values.
5. Document setup and failure behavior.

The first planned workflow is manual sync on demand. Automatic sync cadence is not approved and must not be implemented by assumption.

Sync must be idempotent by source review ID. It must preserve local publication choices and order for existing records. A sync failure must not clear or alter the current published review set. A sync must not silently publish imported reviews. Manual deletion behavior on later sync must be defined so deleted reviews do not unexpectedly reappear; options include a minimal suppression/tombstone record keyed by Google review ID, or explicitly documenting that a future sync can re-import deleted items. Select one after verifying API semantics and reviewing the storage trade-off.

If Google edits/removes a review, the integration needs an explicit policy. Proposed safe default for review: update source fields on successful sync while preserving local publication/order; do not automatically delete a locally published review just because it is missing from a single sync response. Removal handling needs API confirmation and owner approval.

## 8. SEO and rendering

The current site is a React/Vite SPA. Do not assume that fetching database data in the browser alone guarantees that all review text will be present in the initial HTML response. Investigate a minimal approach compatible with Vercel and the current app, such as a narrowly scoped server-rendered/prerendered homepage output or another verified crawlable delivery strategy.

The solution must:
- Preserve the existing SPA route behavior and page design.
- Make published review names/text available to crawlers in rendered HTML, then verify with an HTTP response/source check and a crawler/render test.
- Avoid exposing unpublished reviews in public HTML or API responses.
- Avoid unsupported claims that this will improve rankings.
- Avoid self-serving review-star structured data/rich-result promises for a business showing reviews about itself. Validate structured data against current Google guidelines before adding any review schema.
- Preserve existing canonical and metadata behavior.

The selected rendering strategy is an implementation design decision that must be validated against the current Vercel configuration and build before choosing the least invasive implementation.

## 9. Migration and cutover

1. Inspect the complete current data arrays and FAQ lists, including HomePage showcases, and build a source-to-schema mapping.
2. Export or otherwise capture a recoverable snapshot of current hard-coded records before migration.
3. Create an idempotent migration utility that imports existing service groups/subservices, offers, packages and FAQs without changing labels, prices, image paths, validity labels, booking destinations or ordering.
4. Do not migrate hard-coded homepage showcase cards as duplicate records if they intentionally present a curated subset; map their intended references to the canonical service/offer/package records.
5. Verify counts, fields, ordering, image paths, category filters and links against source code.
6. Implement database-backed reads behind a safe feature switch or explicit fallback, if compatible with existing architecture.
7. Keep current hard-coded public rendering as fallback until admin CRUD and migration are accepted.
8. Switch one content type at a time after staging verification; preserve rollback to hard-coded data.
9. Keep current hard-coded Google review carousel until Google API access, review selection/publishing and crawlability checks pass and the owner approves replacement.

## 10. Testing and acceptance criteria

### Data/API/security
- CRUD works for each content module.
- Unauthenticated requests cannot read admin data or mutate records.
- Same-origin protection and payload validation are enforced on writes.
- Slug uniqueness and Google review ID uniqueness are enforced.
- Public APIs return only published items and safe fields.
- Delete requires confirmation in UI and cannot affect the source Google review.
- Invalid dates, recurring validity labels, malformed URLs, blank required fields and duplicate IDs are handled explicitly.
- Failed sync preserves the last good published review set and does not publish new reviews.
- Sync preserves existing publication flags/order and does not unexpectedly resurrect manually deleted records under the chosen deletion policy.

### Regression and UI
- Existing Blog/Beauty Tips/News CRUD, scheduling, uploads, auth and public routes remain functional.
- Service subservices, package filters, offer cards, FAQs and booking links match existing behavior and content.
- Create/edit/publish/unpublish/delete flows show clear loading, success, error and empty states.
- Desktop and mobile admin layouts are checked.
- Public design does not change except where data source wiring requires no visible difference.

### Build and SEO
- Add a lightweight project test command or use an established compatible test approach only after inspecting current dependencies and choosing the minimum needed.
- Run focused API/model/UI tests and `npm run build`.
- Verify the actual initial HTML or chosen rendered response includes only published review content.
- Verify page metadata, canonical routes, crawlability and no unpublished review leakage.
- Verify staging/live environment explicitly before any claim of deployment success.

## 11. Deployment and repository constraints

- Avoid commits on every tiny step. Group related changes into a small number of coherent commits after verification.
- Confirm the actual Vercel project connected to the target branch and the intended deployment environment before pushing. Existing BRD notes distinguish a Git-connected admin/staging Vercel project from a stable production-domain deployment; verify current state rather than assuming.
- Do not push feature implementation to `main` without explicit release approval.
- Do not combine tracked `node_modules/` or `build/` cleanup with this feature without separate scope and approval.
- Repository privacy remains an owner action; it was verified public during audit.

## 12. Open decisions and dependencies

- Google Business Profile API project approval, OAuth access and verified location access.
- Manual-only versus scheduled automatic sync; manual-only is the provisional design.
- Policy for source reviews edited or removed on Google.
- Policy for locally deleted reviews on subsequent sync; prevent silent resurrection.
- Required ordering controls for services, offers, packages, FAQs and published reviews.
- Vercel branch/project allowed for feature commits and release process.
- Crawlable homepage delivery strategy must be validated with the current Vite/Vercel deployment before implementation.

## 13. Non-goals

- Redesigning the public site.
- Rewriting the existing Blog/Beauty Tips/News CMS.
- Changing booking provider or booking destinations.
- Deleting/modifying source reviews on Google.
- Broad repository cleanup or dependency upgrades unrelated to the feature.
- Claiming search-ranking gains or review-star rich results.

## 14. Definition of done

The feature is complete only when the owner can manage each requested content type without code edits; current content and public design are preserved; review sync/publishing/deletion behaves as specified; security, regression, build, migration and crawlability checks pass; the intended deployment is verified; and the owner accepts the result.
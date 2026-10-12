# Layali Al Zahra Website — Admin CMS / Content Management BRD

**Project:** Layali Al Zahra Beauty Lounge website  
**Repository:** `layalialzahra/layali-al-zahra-website`  
**Primary admin URL:** `https://layalialzahra.com/admin`  
**Status:** 🟡 Implementation in progress

> **Expansion reconciliation (2026-10-12):** This BRD contains historical stages from the original Blog/Beauty Tips/News CMS. Its older Stage 6+ “not started” labels are not the authoritative status of the separate CMS expansion. Current Services, Offers, Packages, FAQs, Google Reviews and homepage SSR progress is tracked in the approved `docs/superpowers/plans/` set and the dated checkpoint at the end of this BRD. Expansion source implementation/CI does not itself establish staging, live API, crawler HTTP or release acceptance.

> **Change-control:** Every repository/code/configuration change must update this BRD in the same change. A stage is complete only when its applicable checklist and acceptance criteria are implemented and verified.

## 1. Purpose
Convert the hard-coded salon website into a professional CMS while preserving the public design unless a redesign is explicitly requested. A non-technical admin must be able to manage content without GitHub, source-code edits, Vercel or developer assistance.

## 2. Target Architecture
Public Tips/Blog/News → backend API → MongoDB Atlas. Private `/admin` → secure session authentication → authenticated admin APIs → MongoDB Atlas.

## 3. Current State
- MongoDB Atlas production connection is complete; database `layalialzahra` is reachable.
- Secure authentication is complete: salted `scrypt`, signed 8-hour HttpOnly sessions, same-origin checks, login/logout, password change, setup and login-abuse protection.
- Stage 3 unified content model/API is implemented for `blog | tip | news`, including validation, normalization, sanitization, indexes, CRUD, search/filter/pagination, duplicate, publish/unpublish and public published-only reads.
- Stage 4 branded admin content editor is complete with responsive create/edit/delete/duplicate/publish controls and production image upload through Vercel Blob.
- Stage 5 public Blog/News/Beauty Tips route foundations are implemented.
- Production Content API previously failed because of a shared content-module `SyntaxError`; diagnostic isolation identified it and the sanitizer syntax was corrected.
- Production content health confirmed MongoDB, content module, database, collection, query, serialization and four indexes.
- A real Blog Post was created and published from the CMS and appears in the admin list.
- Public Blog detail lookup was hardened to locate the published record first and then validate publication date, including legacy string-form dates.
- The public API fix deployed successfully, but the owner initially still received `Content not found`.
- Authenticated content-health metadata showed the stored record had a future publish date: `2026-09-15T13:31:00Z`. This correctly excluded it from the public API.
- The owner corrected the Blog Post publish date in the CMS, but the retest still returned `Content not found`.
- Investigation identified that the admin editor treated `datetime-local` values as UTC when saving, creating a local-time/UTC mismatch.
- The admin editor now converts stored dates to browser-local time for editing and converts local input back to ISO UTC before saving.
- The first deployment of that editor fix exposed a JSX closing-tag error in the publishing panel; the error was corrected by restoring the missing closing `</div>` before `</CardContent>`.
- The corrected component preserves the local/UTC publish-date handling and the existing CMS functionality.
- The markup correction is committed on `main` as `974620b69f62d6ee15531d82478cec39a86c6b9e`.
- The new Vercel project is the active Git-connected environment; the old Vercel project is disconnected from GitHub and remains the stable production-domain deployment until final cutover.
- The new Vercel project has the required MongoDB/admin environment variables in Production and Preview.
- Public content responses are explicitly `no-store`, so CMS publishing does not depend on a new frontend deployment to become visible.
- Public Blog/News listing pages use API pagination and a Load more flow; Beauty Tips use stable slug detail links and the same pagination pattern.
- Public content detail pages set per-content title, description, canonical URL, Open Graph/Twitter metadata and JSON-LD, and expose related-service context when present.
- Content-body sanitization was tightened to remove additional executable/embed/form elements and dangerous URL schemes.
- The new Vercel staging admin service is healthy after correcting the MongoDB connection secret; `/api/admin/auth` returns a successful setup/session response and `/admin` loads the authenticated dashboard/content manager.
- Stage 3 live production acceptance is complete: temporary content was created, kept private as a draft, published and verified through the public API/detail route, unpublished and verified inaccessible, then deleted.
- Vercel Blob store `layali-al-zahra-images` is connected to the active Vercel project with read/write access and the required deployment environment configuration.
- Live image acceptance is complete: a temporary Blog item uploaded an image through the CMS, rendered the Blob-backed preview in the editor, published successfully, and rendered the same image on the public Blog detail route.
- The temporary image-test content was deleted after public verification; no test content remains in the CMS.
- Stage 4 mobile polish is complete: admin controls, filters, editor cards, action buttons and spacing now adapt cleanly to narrow screens.
- Stage 4 News UX is complete: News creation defaults to the News category, exposes News-specific summary/headline guidance and restricts News category choices to the relevant salon/news categories.
- Stage 4.1 correction is complete: public routing/navigation, content presentation, responsive behavior, six sample records, admin UX and invalid-slug 404 behavior were accepted by the owner.
- The homepage integration correction is complete: the legacy hard-coded Beauty Tips section is suppressed and the DB-driven Tips/Blog/News showcase is mounted immediately before Reviews.
- The remaining Stage 4.1 regression/security checks were reviewed in the deployed source: protected admin writes require an authenticated session and same-origin request; public content reads expose no backend secrets or diagnostic metadata.
- Six management sample records are loaded in the active CMS environment: two Blog items, two Beauty Tips and two News items.
- The six legacy Beauty Tips have now been migrated into the CMS and published; the owner verified that all six are live on the public Beauty Tips page.
- Dynamic public content canonical URLs are now pinned to the production `https://www.layalialzahra.com` origin rather than the current Vercel runtime origin, preventing preview/staging canonical URLs.
- The admin workspace no longer displays the legacy migration bar or the public-site WhatsApp floating widget; those website-only elements are suppressed on `/admin`.
- The obsolete mobile number ending in `1231` was removed from the shared footer and Contact page so it no longer appears in those sitewide contact surfaces.

## 4. Master Status
| Stage | Status | Current state |
|---|---|---|
| 0 — Baseline & Safety | 🟢 Complete | Audit, rollback checkpoint and production-build verification completed |
| 1 — MongoDB Production Connection | 🟢 Complete | Atlas + Vercel configured and live DB health confirmed |
| 2 — Secure Admin Authentication | 🟢 Complete | Authentication and protected-access acceptance completed |
| 3 — CMS Foundation | 🟢 Complete | API safety, CRUD, draft privacy, publish/unpublish, public API and Blog detail acceptance completed |
| 4 — Admin Content Editor | 🟢 Complete | Responsive editor/list, News UX, Blob storage, image upload and live acceptance completed |
| 4.1 — Public Content Presentation & Admin UX | 🟢 Complete | Owner accepted routing, responsive presentation, sample content, admin UX and 404 behavior; homepage integration corrected |
| 5 — Public Tips/Blog/News | 🟢 Complete | Six-tip migration/publication, stable public routes, metadata/canonical hardening and CMS publishing acceptance completed |
| 6 — Offers | ⬜ Not started | Deferred until Stage 5 is stable |
| 7 — Services & Packages | ⬜ Not started | Deferred |
| 8 — Gallery & Testimonials | ⬜ Not started | Deferred |
| 9 — SEO & Analytics | ⬜ Not started | Deferred until content system is stable; per-content SEO foundation already exists in Stage 5 |

## 5. Stage 0 — Baseline & Safety — COMPLETE
- [x] Inspect existing routes/code.
- [x] Identify database/API experiments and limitations.
- [x] Preserve public design.
- [x] Establish and maintain this BRD.
- [x] Establish rollback checkpoint `checkpoint/pre-stage-0-2-3-close`.
- [x] Add repeatable production-build verification.

## 6. Stage 1 — MongoDB Production Connection — COMPLETE
- [x] Production MongoDB Atlas cluster configured.
- [x] Vercel `MONGODB_URI` configured as a Production secret.
- [x] `MONGODB_DB_NAME=layalialzahra` configured.
- [x] Cached MongoDB connection helper.
- [x] Generic production health/error handling.
- [x] Live DB health confirmed.

## 7. Stage 2 — Secure Admin Authentication — COMPLETE
- [x] Direct `/admin` route.
- [x] Server-side admin login/session verification.
- [x] One-time setup token and password confirmation.
- [x] Salted `scrypt` password hashing; hashes never returned.
- [x] Signed 8-hour HttpOnly Secure SameSite=Lax sessions.
- [x] Same-origin protection for writes.
- [x] Five failures/15 minutes → 30-minute lockout.
- [x] Password change invalidates active session.
- [x] Admin username uniqueness and abuse-record TTL cleanup.
- [x] Owner verified login/logout/password change.
- [x] Owner verified unauthenticated protected-API rejection.
- [x] Session-expiry implementation verified from deployed source.

## 8. Stage 3 — CMS Foundation — COMPLETE
### Content model
One model with `type: blog | tip | news`. Metadata includes title, slug, excerpt/body, featured image/alt text, category/tags, author, related service, SEO title/meta/social image, status, publish date, timestamps and stable ID. Beauty Tips additionally support `tip1`–`tip5`.

### Categories
Hair: Hair Care, Hair Treatments, Hair Colour, Hair Extensions.  
Beauty: Skincare, Nails, Brows & Lashes, Waxing.  
Lifestyle: Dubai Beauty, UAE Beauty, Seasonal, Events.  
Salon: News, Offers, Announcements.

### Database/API
- [x] Shared content helper and type validation.
- [x] Slug normalization.
- [x] Tag normalization/deduplication.
- [x] Server validation/normalization.
- [x] Body sanitization, including executable embeds, event handlers and dangerous URL schemes.
- [x] Unique `{type,slug}` and feed/update indexes.
- [x] Index initialization retry and non-blocking warning handling.
- [x] Application-level slug collision guard.
- [x] Authenticated CRUD/search/filter/pagination.
- [x] Duplicate operation with forced draft + unique copy slug.
- [x] Publish/unpublish.
- [x] Published-only public API.
- [x] `tip1`–`tip5` persistence.
- [x] Search regex/filter/input hardening.
- [x] Long image URL bound.
- [x] Authenticated content-health diagnostic.
- [x] Diagnostic module-import isolation.
- [x] Corrected sanitizer syntax after production diagnostic.
- [x] Production Blog create/publish proven.
- [x] Public API index setup made non-blocking.
- [x] Public detail publication-date compatibility hardened for BSON Date/string values.
- [x] Health diagnostic exposes safe content metadata for slug/type/status/date troubleshooting.
- [x] Future publish-date mismatch identified and corrected in production content.
- [x] Admin local/UTC publish-date conversion corrected.
- [x] Corrected JSX closing-tag regression introduced while applying the publish-date editor fix.
- [x] Public API responses explicitly disable caching for immediate CMS publishing visibility.
- [x] Verify unique slugs against production data: active CMS data is clean after test cleanup; unique index and application guard are active.
- [x] Verify draft privacy publicly: a live draft returned `Content not found` from the public API.
- [x] Verify safe API errors/no secrets in production: public failures return generic messages and authenticated diagnostics expose metadata only.

### Production acceptance
- [x] Authenticated APIs safely create/edit/delete/publish in production: live test content was created, published, verified publicly, unpublished and deleted through the CMS.
- [x] Public APIs expose only intended published content: draft/unpublished content is excluded and published content is returned.
- [x] Published Blog detail API and `/blog/<slug>` route pass live acceptance using staging CMS test content.

## 9. Stage 4 — Admin Content Editor — COMPLETE
### Dashboard/list
- [x] Layali Al Zahra admin branding.
- [x] Dashboard/workspace navigation.
- [x] Content list with title/category/status/date.
- [x] Search/type/status filters.
- [x] Create/edit/duplicate/publish/unpublish/delete confirmation.
- [x] Loading/error/empty states.
- [x] Mobile polish: responsive controls, filter layout, compact headings, mobile-friendly action grid and editor card spacing.

### Editors
- [x] Blog fields: title/slug/category/image/alt/excerpt/body/tags/related service/SEO/status/publish date.
- [x] Basic bold/italic/underline/link controls.
- [x] Beauty Tip description + `tip1`–`tip5` + relationships/SEO/status.
- [x] News shared content fields.
- [x] Richer News-specific editor guidance and category behavior without changing the public design or shared content model.
- [x] Publish-date datetime-local values correctly convert between browser-local time and stored ISO UTC.
- [x] Publishing panel JSX markup corrected and production build restored.

### Images
- [x] Vercel Blob selected.
- [x] Authenticated upload endpoint.
- [x] JPG/PNG/WebP/GIF, max 4 MB.
- [x] File picker/upload state/preview.
- [x] Production Blob store configuration and authentication verification: active Vercel project connected to `layali-al-zahra-images` with read/write access; redeployment completed so runtime configuration is active.
- [x] Upload endpoint has explicit validation and user-safe failure handling; live success path verified end-to-end.

### Acceptance
- [x] Nontechnical admin can create/edit/delete production content end-to-end: live CMS create/publish/unpublish/delete flow verified.
- [x] Production image upload/select works: live upload, CMS preview and public Blog image rendering verified.
- [x] Draft/publish controls exist and were live-tested.

## 10. Stage 4.1 — Public Content Presentation & Admin UX — COMPLETE
This correction/acceptance gate is complete. It did not replace the historical Stage 0–4 record.

### Public routing and navigation
- [x] Explicit public route handling for `/home`, `/services`, `/packages`, `/offers`, `/tips`, `/blog`, `/news` and `/contact`.
- [x] Vercel SPA rewrites for `/home`, `/services`, `/packages`, `/offers`, `/contact`.
- [x] Owner verified all primary public header pages open correctly.
- [x] Owner verified mobile navigation/pages.

### Public content presentation
- [x] Blog/News listing cards no longer display hashtag-style tags.
- [x] Listing/detail image containers use stable aspect-ratio geometry and `object-fit: cover`.
- [x] Blog, Tips and News listing/detail layouts use the established Offers visual language as the design reference.
- [x] Public content detail pages use editorial title, metadata, excerpt/body and structured tip-step presentation.
- [x] Owner verified public content presentation on desktop and mobile.
- [x] Owner verified all six sample records on public listing/detail pages.
- [x] Homepage Tips/Blog/News showcase integration corrected: legacy hard-coded Beauty Tips removed from display and DB-driven Tips/Blog/News placed before Reviews.
- [x] Owner verified image crops at the tested responsive widths.
- [x] Invalid Blog detail slug verified: `/blog/this-does-not-exist` correctly shows `Content not found` rather than a broken page.

### Admin UX
- [x] Branded admin login shell.
- [x] Responsive dashboard with Blog/Beauty Tips/News counts and quick actions.
- [x] Content Library with search/type/status filters, create actions, thumbnails, status/category metadata and compact row actions.
- [x] Editor with primary content column plus media/publishing rail.
- [x] Settings/password-change area.
- [x] Desktop sidebar and mobile navigation drawer.
- [x] Owner completed live desktop/mobile acceptance of login/setup/dashboard/library/editor/settings as one coherent workspace.
- [x] First-time admin can identify create/edit/publish/unpublish/duplicate/delete actions without developer assistance.
- [x] Main CMS validation, loading, success, failure and confirmation states were exercised during acceptance.

### Sample content
- [x] Six management sample records are loaded: two Blog, two Beauty Tip and two News.
- [x] Sample content was researched from current beauty/hair/nail/skin guidance and current beauty-trend context before seeding.
- [x] Owner verified the sample records' public image, title, excerpt/body, category and publication state.
- [x] Owner verified sample records are not unintentionally future-dated or private.
- [x] Owner verified sample content can be edited, unpublished and republished without code deployment.

### Regression/security gate
- [x] Existing authentication/session behavior preserved.
- [x] Existing MongoDB/API/CRUD behavior preserved.
- [x] Existing duplicate/publish/unpublish/delete behavior preserved.
- [x] Existing image upload behavior preserved.
- [x] Protected admin writes remain behind `requireAdmin` and same-origin checks in the admin content API.
- [x] Public content API remains read-only and published-only.
- [x] Public routing changes do not expose secrets or diagnostic metadata.

### Stage 4.1 acceptance rule
Stage 4.1 is 🟢 Complete. The owner accepted the live routing/content/admin experience, invalid-slug 404 behavior and homepage integration correction. Stage 5 is the active workstream.

## 11. Stage 5 — Public Tips/Blog/News — COMPLETE
- [x] Beauty Tips DB-driven published-only API.
- [x] Protected idempotent six-tip migration tooling.
- [x] Blog/News listing/detail foundations.
- [x] SPA route recognition and Vercel rewrites for listing/detail routes.
- [x] Listing cards use stable slug URLs.
- [x] Blog/News listing pagination and Load more UI.
- [x] Beauty Tips stable slug detail links and pagination/Load more UI.
- [x] Detail pages expose H1, alt text, publication date, category, tags and related-service context when available.
- [x] Per-content title/description/canonical/Open Graph/Twitter metadata and JSON-LD foundation.
- [x] Execute and verify six-tip migration.
- [x] Verify drafts remain private: the same live draft/unpublished test was excluded from public API and detail route.
- [x] Final public design verification across the final migrated set.
- [x] Final live route verification for the tested Blog detail route.
- [x] Live stable slugs/H1/alt/publication/category/tags/related-service/404 acceptance across the migrated content set, with the six published Beauty Tips verified live and public detail behavior covered by the established Content Detail component and 404 acceptance.
- [x] Live SEO/canonical/OG/structured content/internal-link acceptance across the final content implementation; dynamic canonical URLs are pinned to the production domain.
- [x] Publishing without code deployment acceptance: publish/unpublish visibility changed through CMS/API without a frontend code deployment.
- [x] Admin-only cleanup: public-site WhatsApp UI and completed migration prompt are not shown in the private admin workspace.

### Stage 5 execution order
1. Execute the protected idempotent six-tip migration into CMS drafts. **Complete.**
2. Review the migrated six-tip set in Content Library. **Complete.**
3. Publish the approved six-tip set. **Complete.**
4. Verify `/beauty-tips`, `/beauty-tips/<slug>`, `/blog`, `/blog/<slug>`, `/news`, `/news/<slug>`. **Complete.**
5. Verify homepage content showcases and internal links. **Complete.**
6. Complete public SEO/canonical/OG/JSON-LD/404 checks. **Complete.**
7. Complete nontechnical publishing acceptance. **Complete.**
8. Approve production-domain cutover as the stable production state only after Stage 5 acceptance. **Stage 5 prerequisite complete; domain cutover remains a separate deployment-safety task.**

## 12. Stage 6 — Offers — DEFERRED
- [ ] Dynamic offers data model/page with pricing, validity, images, publication and CTA/booking.
- [ ] Preserve current Offers visual language and existing public UX while making content DB-driven.
- [ ] Admin create/edit/publish/unpublish/duplicate/delete.
- [ ] Image upload/media selection.
- [ ] Date/validity handling and expired-offer behavior.
- [ ] CTA/booking destination validation.
- [ ] Mobile/desktop acceptance.
- [ ] Public SEO/canonical/structured-data checks where applicable.

## 13. Stage 7 — Services & Packages — DEFERRED
- [ ] DB-driven services and packages with pricing, duration, ordering, publication, SEO and CTAs while preserving design.
- [ ] Service/package categories and relationships.
- [ ] Admin CRUD, ordering and publication controls.
- [ ] Public detail/listing routes and stable slugs where applicable.
- [ ] Booking/contact CTA integrity.
- [ ] Mobile/desktop acceptance.
- [ ] Migration/verification of existing hard-coded services and packages.

## 14. Stage 8 — Gallery & Testimonials — DEFERRED
- [ ] DB-driven gallery with categories/upload/order/visibility.
- [ ] Gallery image validation, media storage and crop behavior.
- [ ] Testimonials with client name/review/rating/date/photo/publication/order.
- [ ] Admin CRUD and ordering.
- [ ] Public rendering, responsive behavior and moderation/publication controls.
- [ ] Image/media performance verification.

## 15. Stage 9 — SEO & Analytics — DEFERRED
- [ ] Sitewide SEO defaults, OG, canonical, robots, sitemap and structured data.
- [ ] Analytics/Search Console readiness.
- [ ] CMS performance/statistics dashboard.
- [ ] Indexability and noindex rules for admin/private routes.
- [ ] Final metadata consistency across all public content types.
- [ ] Final structured-data validation.
- [ ] Search/analytics acceptance after all dynamic sections are live.

## 16. Cross-stage Non-negotiables
### Security
- [ ] Final secret audit.
- [x] Server-side environment variables.
- [x] Server-side authentication/session validation.
- [x] Admin writes require valid session.
- [x] Public content API does not expose backend secrets.
- [x] Destructive delete confirmation.
- [x] Basic content sanitization.
- [x] Final regression that public routing changes cannot bypass authentication on admin APIs.

### Usability/design
- [x] Final nontechnical end-to-end publishing acceptance for the completed Stage 5 content flow.
- [x] Loading/success/failure states.
- [x] Useful empty state.
- [x] Mobile admin polish.
- [x] Public design preserved.
- [x] Branded admin shell.
- [ ] Final desktop/mobile acceptance across all completed dynamic sections beyond Stage 5.

### Performance/reliability
- [x] Cached MongoDB connections.
- [x] Core indexes.
- [x] API pagination.
- [ ] Production query/index performance verification.
- [x] No large binaries in MongoDB: image assets are stored in Vercel Blob and only URLs are stored with content.
- [ ] Final public performance verification.
- [x] Content API remains available when individual index initialization emits warnings.
- [x] Public content reads are not cached by the API layer, enabling publishing without a frontend deployment.

### Deployment/domain safety
- [x] New Git-connected Vercel project is the active development/acceptance environment.
- [x] Old Vercel project is disconnected from GitHub and retained as the prior production deployment until domain cutover.
- [x] New Vercel project accepts `layalialzahra.com` and `www.layalialzahra.com` with valid configuration; apex redirects to `www` on the new project.
- [x] Domain verification DNS record was accepted by the new Vercel project.
- [ ] Verify SSL/DNS and production site on the salon domain after the latest admin cleanup deployment.
- [ ] Remove the salon domain from the old Vercel project only after the new project is confirmed stable; keeping the old project intact is currently the rollback strategy.
- [ ] Confirm the old project is no longer serving the salon domain.
- [ ] Record the final production-domain cutover in this BRD before marking the cutover complete.

## 17. Core MVP Checklist
- [x] Real authentication.
- [x] Secure MongoDB production connection.
- [x] Authentication API.
- [x] Unified content model.
- [x] Authenticated CRUD foundation.
- [x] Draft/publish.
- [x] Production images.
- [x] Categories/tags.
- [x] Related service.
- [x] Per-content SEO fields.
- [x] Six-tip migration.
- [x] DB-driven public API foundation.
- [x] Slug normalization/uniqueness foundation.
- [x] Public API filters drafts.
- [x] Public design preserved.
- [x] Production build/deployment verification.
- [x] Owner can publish end-to-end without code for the completed Stage 5 content workflow.

## 18. Change Log
### 2026-09-14 — Stage 2 authentication integration
- Replaced mock client-only admin login with server-backed session authentication.
- Added setup, login, session-check, logout and generic error handling.

### 2026-09-14 — Authentication hardening and acceptance
- Corrected MongoDB helper import paths.
- Added direct `/admin` routing and Vercel SPA rewrite.
- Added login-abuse protection, password change/session invalidation and indexes.
- Owner verified login/logout/password change and protected API rejection.
- Closed Stage 2 after technical session-expiry verification.

### 2026-09-14 — Unified CMS foundation and admin editor
- Added unified `blog | tip | news` model, validation, sanitization, serialization and indexes.
- Added authenticated CRUD/search/filter/duplicate/publish APIs and public published-only API.
- Added structured Beauty Tip fields, admin editor, branding, upload foundation and migration tooling.
- Converted public Beauty Tips to DB-driven content and added Blog/News route foundations.

### 2026-09-14 — Stage 3 security/reliability hardening
- Hardened filters/search/duplicate validation and field bounds.
- Added content-index retry behavior, then made individual index warnings non-blocking.
- Added application-level `{type,slug}` collision checks.

### 2026-09-14 — Stage 3 production Content service failure/recovery
- Owner observed `Content service unavailable` in the Content screen while MongoDB health remained healthy.
- Added authenticated `/api/admin/content-health` diagnostic.
- Diagnostic isolated a shared content-module `SyntaxError`; sanitizer syntax was corrected.
- Diagnostic then confirmed MongoDB, content module, database, collection, query, serialization and four indexes.
- Owner created and published a real Blog Post successfully.

### 2026-09-14 — Stage 3 public Blog detail troubleshooting
- Owner confirmed the published Blog appears in the CMS but its public API returned `Content not found`.
- Hardened `api/content.js` detail lookup to fetch the published record first and perform publication-date validation in application code, including legacy string-form dates.
- Vercel deployment for the public API fix completed successfully, but the owner retest still returned `Content not found`.

### 2026-09-14 — Stage 3 stored-content diagnostic
- Added authenticated metadata-only content summary to `/api/admin/content-health`.
- The diagnostic reports count plus recent content ID/type/title/slug/status/publish date, without returning body, image or SEO fields.
- Purpose: identify whether the failing public URL differs from the actual stored `{type,slug,status,publishDate}` record before making another public API change.
- This BRD was updated in the same change as the diagnostic code.

### 2026-09-14 — Stage 3 publish-date correction
- Diagnostic showed the published Blog Post was scheduled for `2026-09-15T13:31:00Z`, which was in the future and therefore correctly excluded by the public API.
- Owner corrected the Blog Post publish date in the CMS so it is no longer future-dated.
- Final public Blog API/detail-route acceptance remained pending live retest.

### 2026-09-14 — Stage 3 admin publish-date timezone correction
- Fixed the CMS editor's `datetime-local` handling so publish dates are displayed in the browser's local timezone and saved as explicit ISO UTC timestamps.
- This prevents a UAE local publish time from being incorrectly interpreted as UTC and remaining future-dated.
- Final public Blog API/detail-route acceptance remained pending deployment and retest.

### 2026-09-14 — Stage 3 CMS build markup correction
- Vercel production build failed after the publish-date editor change because the Publishing panel had a missing closing `</div>` before `</CardContent>`.
- Corrected the JSX nesting without changing the publish-date timezone logic or CMS behavior.
- The corrected component was then committed to `main` as `974620b69f62d6ee15531d82478cec39a86c6b9e`.
- The BRD was updated in the same change to maintain the mandatory change-control record.
- Final live public API/detail-route acceptance remained pending a successful production deployment.

### 2026-09-14 — Stage 3/4/5 public-content readiness pass
- Switched active development to the new Git-connected Vercel project while preserving the old production deployment as a disconnected rollback/stability copy.
- Kept MongoDB/admin environment variables aligned on the new project.
- Added explicit `no-store` handling to public content API responses so publishing is not dependent on a frontend deployment.
- Tightened content-body sanitization against additional executable/embed/form elements and dangerous URL schemes.
- Added paginated Load more flows to Blog/News and Beauty Tips listings.
- Added stable Beauty Tip slug links to detail routes.
- Added per-content canonical, description, Open Graph/Twitter metadata and JSON-LD, plus related-service context on detail pages.
- This BRD is updated in the same change as the code changes above.
- Remaining blockers are live acceptance, six-tip migration and Vercel Blob store setup/authentication verification.

### 2026-09-14 — Stage 3 acceptance checks
- Corrected the new Vercel project's MongoDB connection secret; `/api/admin/auth` now returns HTTP 200 and the admin dashboard/content manager load successfully.
- Verified the current content collection is empty in the active CMS environment, so there are no duplicate production slugs; the unique `{type,slug}` index and application-level collision guard remain active.
- Verified public API error handling remains generic and does not expose backend secrets; authenticated health diagnostics remain metadata-only.
- Draft privacy still required one live draft record to be created and checked publicly; this was deliberately left open rather than marked complete without evidence.
- Stage 3 remained in progress only for live content acceptance: draft privacy, authenticated CRUD/publish acceptance and public Blog detail acceptance.

### 2026-09-14 — Stage 3 live CRUD/public acceptance
- Created a temporary Blog draft in the staging CMS and verified the public detail API returned `Content not found` while the item was a draft.
- Published the same test item from the CMS and verified the public content API returned the published item.
- Verified the published `/blog/cms-draft-test-do-not-publish` route rendered the CMS content correctly.
- Unpublished the item and verified the same public route returned the site's `Content not found` state immediately.
- Deleted the temporary test item and confirmed the Content Manager returned to `No content yet`.

### 2026-09-14 — Stage 3 closure bookkeeping correction
- Reconciled the BRD master status and current-state summary with the completed Stage 3 production acceptance evidence.
- Stage 3 is now explicitly marked `🟢 Complete`; Stages 4 and 5 remain the active workstreams.

### 2026-09-14 — Stage 4 image storage, responsive UX and closure
- Connected the active Vercel project to the `layali-al-zahra-images` Blob store with read/write access and redeployed so the runtime token configuration became active.
- Verified end-to-end image upload from the nontechnical CMS editor, including upload state, Blob-backed preview, publication and public rendering on the Blog detail route.
- Deleted the temporary image-test content after verification; the CMS has no retained test record.
- Applied mobile admin polish to the content list, filters, editor layout, buttons, headings and image controls so the workspace remains usable on narrow screens.
- Added richer News-specific editor guidance and category behavior without changing the public design or the shared content model.
- Stage 4 acceptance is now complete; Stage 5 remains the next active workstream for six-tip migration and final public-content acceptance.

### 2026-09-14 — Stage 4.1 correction and owner visual review
- Recovered the comprehensive BRD baseline instead of replacing the historical project record with a shortened correction-only document.
- Recorded Stage 4.1 as a separate correction/acceptance gate so completed Stages 0–4 remain intact and auditable.
- Corrected public routing for Services, Packages, Offers and Contact and added the required SPA rewrites.
- Removed hashtag-style tags from Blog/News cards and standardized public image crop geometry and editorial typography.
- Rebuilt the admin login, Dashboard, Content Library, editor and Settings into one responsive visual system.
- Preserved existing CMS/security/API behavior and retained the six management sample records for review.
- Owner visually reviewed the deployed website and admin workspace and stated that the design is at the desired professional level; small functional defects may still be found during acceptance.
- No Stage 5 execution is authorized by this record until the remaining Stage 4.1 functional/live checks are completed.

### 2026-09-14 — BRD recovery and deployment-history correction
- Created recovery branch `recovery/pre-brd-restore-2026-09-14` from the correction-pass commit before restoring this document.
- Restored the comprehensive BRD structure and historical Stage 0–4 evidence from the last complete BRD version at commit `c95bbf465b5bced148ae066e3feefddb0e460f46`.
- Added the current Stage 4.1 correction gate and domain-cutover checklist without deleting the historical record.
- This BRD recovery is documentation-only; no application code is changed by this recovery.
- Future BRD updates must append or precisely edit the relevant status/checklist/change-log entry; they must not replace the document with a shortened summary.

### 2026-09-14 — Stage 4.1 live acceptance pass and homepage integration correction
- Owner verified all primary public pages open correctly and completed desktop/mobile public-content checks.
- Owner verified all six management sample records on the public pages and completed the responsive/mobile acceptance pass.
- Owner completed live admin acceptance for login/setup/dashboard/content library/editor/settings and the principal CMS actions.
- Identified the homepage integration defect: the legacy hard-coded Beauty Tips carousel was still rendered, while the new DB-driven Tips/Blog/News showcase was after Reviews.
- Corrected the homepage integration so the legacy hard-coded Beauty Tips section is suppressed and the DB-driven Tips/Blog/News showcase is mounted immediately before Reviews.
- Owner verified the invalid Blog slug `/blog/this-does-not-exist` shows the intended `Content not found` state.
- Source review confirmed protected admin writes still require authentication and same-origin checks and that public content responses remain published-only without diagnostic/secrets exposure.
- Stage 4.1 is now complete and Stage 5 is the active workstream.

### 2026-09-14 — Stage 5 six-tip migration and publication
- Executed the protected idempotent six-tip migration from the CMS Content Library; the result was **6 Beauty Tips migrated; 0 already existed**.
- Reviewed the migrated records in the Content Library.
- Published all six migrated Beauty Tips from the CMS.
- Owner verified that all six published Beauty Tips are live on the public `/beauty-tips` page.
- No application code change was required for the migration or publication; the BRD records the acceptance state as required by change-control.
- Remaining Stage 5 work is final public route, internal-link, SEO/metadata and nontechnical publishing acceptance before production-domain cutover.

### 2026-09-15 — Stage 5 canonical hardening and admin cleanup
- Corrected dynamic content detail canonical generation so Blog/News/Beauty Tip pages always emit the production canonical origin `https://www.layalialzahra.com`, rather than the current Vercel preview/runtime origin.
- Removed the completed six-tip migration prompt from the visible admin workspace without altering the already-completed migration backend tooling or stored content.
- Suppressed the public-site WhatsApp floating widget and related website-only WhatsApp UI from the private `/admin` workspace.
- Confirmed the Stage 5 implementation/acceptance gate is complete: migrated content is published, public routes and detail presentation are established, stable slugs and 404 behavior are covered, per-content SEO/OG/Twitter/JSON-LD metadata is implemented and production canonical URLs are protected.
- Production-domain cutover remains intentionally separate from Stage 5 and the old Vercel project remains untouched as the rollback/stability copy.

### 2026-09-15 — Obsolete phone number cleanup
- Removed the obsolete mobile number ending in `1231` from the shared site footer and Contact page.
- Removed both the visible phone-number entry and its `tel:` link from the Contact page's phone-number data, so the old number is no longer rendered or callable there.
- Kept the current WhatsApp number and the two existing telephone numbers unchanged.
- This is a sitewide contact-content cleanup; no CMS/database content or unrelated phone numbers were changed.

## 19. Recovery / Source-of-truth rule
The comprehensive BRD version at commit `c95bbf465b5bced148ae066e3feefddb0e460f46` is the recovered historical baseline for the project record. The current file preserves that baseline and adds the Stage 4.1 correction/acceptance layer. Repository history remains available for exact historical comparison.

**Rule going forward:** never delete historical stage detail to make a correction pass shorter. Update the relevant checklist/status and append a dated change-log entry instead.


## 20. Current CMS expansion checkpoint — 2026-10-12

This section is the current status for the separate managed Services, Offers, Packages, FAQs, Google Reviews and crawlability expansion. It does not rewrite or invalidate the historical deployment and acceptance notes above, which describe earlier work and environments.

- **Repository/branch:** `layalialzahra/layali-al-zahra-website`, `feat/layali-managed-content-cms`. Continue work only on this branch. Do not push to `main`.
- **Deployment hold:** the owner confirmed that Vercel is disconnected and today's feature-branch changes are not deployed. Do not reconnect Vercel or trigger deployments during implementation. Preserve the daily free deployment allowance for one controlled final release after the project is complete and the owner explicitly approves.
- **Production safety:** no production migration, public content source-of-truth change, production cutover or repository visibility change is authorised by this checkpoint. Keep current public content as the fallback until migration and acceptance evidence pass.
- **Current expansion implementation:** managed-content validation/serialization, protected admin CRUD and published-only public reads exist for Services, Offers, Packages and FAQs. Dedicated admin UI exists. Migration tooling supports dry-run and explicit apply; no production migration for this expansion has been performed.
- **CI evidence:** latest relevant Build verification [38255367374](https://github.com/layalialzahra/layali-al-zahra-website/actions/runs/38255367374) passed dependency installation, high-severity dependency audit, tests and build after session-version revocation and script-CSP hardening. This is CI evidence only, not staging or production acceptance.
- **Security gate (updated 2026-10-12):** session-version revocation is implemented and regression-tested; password changes invalidate older copied sessions on the next protected request. CSP `script-src` no longer allows `unsafe-inline`/`unsafe-eval`; analytics bootstrap is externalized to same-origin `/tracking.js`. `style-src 'unsafe-inline'` remains for existing inline styles. Latest reachable text/binary-string scan passed with zero findings. Actual proxy chain, live environment configuration and deployed auth/upload behavior remain unverified.
- **Google Reviews gate:** suppression keyed by `googleReviewId` is implemented; local publication/order are preserved on sync and reviews missing from one completed sync are retained for explicit review. Business Profile API approval, OAuth and location access remain unverified. New imports must remain unpublished and failed sync must preserve the last good published set.
- **Crawlability gate (updated 2026-10-12):** route-aware homepage SSR/hydration is implemented on the feature branch, with published-only/suppression-aware review rendering and a disabled-by-default review-source flag. Build/test/audit and built-server smoke passed in [run 38259645839](https://github.com/layalialzahra/layali-al-zahra-website/actions/runs/38259645839). Actual Vercel rewrite/function packaging and crawler-facing HTTP acceptance remain pending.
- **Required next order:** (1) Priority 2 security review and targeted tests, (2) Priority 3 functional acceptance and migration dry-run/count/repeatability, (3) Priority 4 Google Reviews prerequisites/safety and crawlability proof of concept, (4) Priority 5 responsive QA, release checklist, rollback evidence and owner acceptance. Only then consider the final controlled release.
- **Evidence discipline:** distinguish source-reviewed, CI-passed, staging-verified and production-released. Do not mark tasks complete without evidence, expose secret values, or claim a deployment/API test that was not performed.



### 2026-10-12 — Priority 2 origin scheme hardening
- Hardened `api/_lib/auth.js` so production same-origin validation pins the expected protocol to HTTPS rather than trusting `x-forwarded-proto` for the scheme decision.
- Added a regression test in `tests/api/auth-security.test.js` for a spoofed forwarded-protocol header.
- Commits: implementation `5bee062445dc9e852ebf4eca820f28073d943584`; test `6769ae39e4e9d504932e1354505ed81dd90ab41d`.
- GitHub Actions run [38251638974](https://github.com/layalialzahra/layali-al-zahra-website/actions/runs/38251638974) passed dependency installation, high-severity dependency audit, tests and build on the tested commit. This is CI evidence only, not live/staging verification. Vercel remains disconnected and no deployment was triggered.


### 2026-10-12 — CSP compatibility for existing Meta Pixel
- Added explicit CSP allowlist entries for the existing Meta Pixel script and Facebook beacon origins in `vercel.json`.
- Added `tests/api/csp-config.test.js` to assert the required origins remain allowlisted.
- GitHub Actions run [38251889567](https://github.com/layalialzahra/layali-al-zahra-website/actions/runs/38251889567) passed dependency installation, high-severity dependency audit, tests (including the new CSP allowlist test) and build on commit `09c393494383bc39de8c82ea29c68d95b38679b1`. This is CI-only evidence. Browser/runtime behavior is pending the final controlled release window. `unsafe-inline`/`unsafe-eval` hardening remains open.


### 2026-10-12 — All-history secret scan automation
- Added `.github/workflows/secret-scan.yml` using pinned Gitleaks `v8.30.1`, full Git history/ref checkout and redacted scan output.
- The initial scan is pending. Keep the secret-review gate open until the run completes and any findings are triaged. No secret values should be copied into docs or issues.
- This workflow runs in GitHub Actions only; Vercel remains disconnected.


### 2026-10-12 — Wire secret scan into established CI
- The new standalone workflow did not appear in the observed Actions run list after being added on the feature branch. Added the pinned, redacted all-reachable-history Gitleaks scan to the existing Build verification workflow and changed checkout to full history so this branch's push reliably exercises the scan.
- The scan result remains pending. CI may fail on a finding or scanner/configuration issue; review only redacted output and do not copy secret values into documentation.


### 2026-10-12 — Secret scan workflow syntax correction
- The initial Build verification attempt after wiring Gitleaks failed before starting a job because the command quoting was invalid YAML. Corrected the Gitleaks run command in both workflow files to use a block scalar.
- The full-history scan result remains pending; no clean-scan claim is made.


### 2026-10-12 — Gitleaks output made safely triageable
- Initial all-history scan processed 352 commits / approximately 117 MB and exited with code 1, but the connector-visible log did not provide usable finding metadata. No clean-scan claim is valid.
- Updated both workflows to emit a redacted JSON report and print only rule IDs, file paths, line numbers and abbreviated commit IDs. The next run is required for safe triage; keep this gate open.


### 2026-10-12 — Triage Web3Forms Gitleaks finding
- Gitleaks reported one `generic-api-key` match in `src/components/ContactPage.tsx`. The value was not printed.
- Verified against the official Web3Forms FAQ/API reference that the client-side `access_key` is intentionally public by design, not a secret API key. Added a narrow `.gitleaks.toml` allowlist requiring both the exact file path and the `access_key` line pattern.
- A corrected scan must pass before closing the text-history scan gate. Binary-blob review remains separate and open.


### 2026-10-12 — Gitleaks all-history scan result
- Standalone run [38252703895](https://github.com/layalialzahra/layali-al-zahra-website/actions/runs/38252703895) passed after the narrow Web3Forms access-key allowlist: 354 commits and approximately 117.15 MB scanned; zero findings.
- This closes the reachable text/history Gitleaks check only. Binary-blob inspection remains open.
- Removed the duplicate Gitleaks installation from Build verification because its combined run failed during scanner installation and skipped tests/build. The dedicated secret-scan workflow remains in place; standard Build verification continues to run audit, tests and build.


### 2026-10-12 — Binary history scan automation
- Added a redacted binary-blob scan step to the dedicated secret-scan workflow. It extracts printable strings from reachable binary Git blobs and runs Gitleaks against them.
- Only metadata is printed; no secret values should be copied to docs/issues. The scan is heuristic and does not inspect compressed/encrypted payloads semantically. First result pending.


### 2026-10-12 — Binary-history scan completed
- Historical secret scan [38253553830](https://github.com/layalialzahra/layali-al-zahra-website/actions/runs/38253553830) passed. Gitleaks scanned 357 commits / approximately 117.16 MB of reachable history and reported zero findings after the documented public Web3Forms key allowlist.
- The binary step examined 118 reachable binary blobs with printable strings (170,446,401 bytes) and reported zero findings.
- Scope limitation: this is heuristic printable-string scanning, not semantic inspection of compressed/encrypted payloads, unreachable objects, external systems or production environment values.
- Build verification [38253553795](https://github.com/layalialzahra/layali-al-zahra-website/actions/runs/38253553795) passed dependency audit, tests and build. Remaining security items are proxy-IP trust, session revocation and strict CSP hardening/runtime acceptance.


### 2026-10-12 — Latest security scan and proxy review
- Latest scan [38253765871](https://github.com/layalialzahra/layali-al-zahra-website/actions/runs/38253765871) passed: 358 commits / ~117.17 MB text/history scanned with zero findings after the documented public Web3Forms allowlist; 118 binary blobs with printable strings / 170,446,401 bytes scanned with zero findings.
- Vercel's official request-header documentation states that Vercel overwrites `X-Forwarded-For` to prevent IP spoofing. The current rate-limit key is supported when requests reach Vercel directly, but the actual proxy chain remains unverified.
- Remaining security gate: session revocation decision and stricter CSP design/runtime acceptance. No deployment or live test was performed.


### 2026-10-12 — Latest security acceptance evidence
- Historical scan [38253958356](https://github.com/layalialzahra/layali-al-zahra-website/actions/runs/38253958356) passed: 359 commits / ~117.17 MB reachable history with zero text findings and 118 binary blobs with printable strings / 170,446,401 bytes with zero findings.
- Standard Build verification [38253958446](https://github.com/layalialzahra/layali-al-zahra-website/actions/runs/38253958446) passed audit, tests and build.
- Vercel's request-header docs state that `X-Forwarded-For` is overwritten to prevent IP spoofing; direct-Vercel behavior is documented, but the live proxy chain is not verified.
- Session revocation and stricter CSP removal of `unsafe-inline`/`unsafe-eval` remain open. No deployment or browser/runtime test occurred.


### 2026-10-12 — Session revocation and script CSP hardening
- Implemented server-checked session versioning in api/_lib/auth.js. Admin sessions include a version that is compared with the current MongoDB admin record on protected requests; password changes increment the version and revoke previously copied tokens. Added regression coverage for stale, current and legacy session versions.
- Updated protected content, upload, migration, seed and Google Reviews routes to await session validation.
- Moved Google Analytics and Meta Pixel bootstrap code from inline script blocks in index.html into same-origin public/tracking.js. Removed unsafe-inline and unsafe-eval from CSP script-src; added tests that reject those script allowances and executable inline scripts in index.html. style-src unsafe-inline remains because the site still uses inline styles.
- Build verification [38255367374](https://github.com/layalialzahra/layali-al-zahra-website/actions/runs/38255367374) passed dependency audit, tests and build. Historical secret scan [38255367338](https://github.com/layalialzahra/layali-al-zahra-website/actions/runs/38255367338) passed with zero text/history and binary printable-string findings.
- No production database, Vercel connection or deployment was used. Browser/runtime acceptance remains pending the final approved release window.


### 2026-10-12 — Migration and crawlability acceptance tests
- The existing migration tests assert 15 services, 5 offers, 23 packages and 13 FAQs (56 records total), preserve display labels, verify dry-run does not connect to MongoDB and confirm repeat apply does not duplicate records. These are mocked/unit-test results; no real staging or production DB migration was run.
- Added a component-level SSR proof in `tests/rendering/homepage-crawlability-poc.test.tsx`. It confirms rendered HTML contains supplied published review text and excludes a supplied review marked unpublished, while the existing hard-coded reviews remain the default fallback.
- CI build/test/audit passed in [run 38256652658](https://github.com/layalialzahra/layali-al-zahra-website/actions/runs/38256652658); reachable-history scan passed in [run 38256652699](https://github.com/layalialzahra/layali-al-zahra-website/actions/runs/38256652699) with zero text and binary printable-string findings.
- This does not yet integrate SSR into a request handler, fetch database-backed reviews into initial HTML or prove crawler HTTP output. Vercel remains disconnected and no deployment or production migration occurred.


### 2026-10-12 — Route-aware homepage SSR implementation
- Added a server-rendered homepage entry and hydration path. The existing catch-all API function serves the rendered root and /home alias, avoiding an extra function entrypoint.
- The handler keeps current hard-coded reviews as the default fallback. MANAGED_HOME_REVIEWS_ENABLED defaults to false; only when explicitly enabled does the homepage fetch published, non-suppressed reviews from MongoDB. A failed managed source fails closed to an empty review set.
- Regression tests cover published/unpublished output, suppression filtering, safe hydration data, fallback and managed-mode failure. Build verification [38259645839](https://github.com/layalialzahra/layali-al-zahra-website/actions/runs/38259645839) passed dependency audit, tests, client build, SSR build and smoke test. Historical scan [38259645791](https://github.com/layalialzahra/layali-al-zahra-website/actions/runs/38259645791) passed with zero text and binary printable-string findings.
- No deployment or production DB access occurred. Actual Vercel routing and crawler HTTP response remain pending the approved final verification window.

## Documentation reconciliation checkpoint — 2026-10-12

- **Audited application/code HEAD before this documentation-only reconciliation:** `046c4b7e4b5a7629fc860538b6d37b0e3b969e48`. GitHub compare confirmed `feat/layali-managed-content-cms` was identical to this SHA before these edits.
- **Build/test/audit:** [run 38259999486](https://github.com/layalialzahra/layali-al-zahra-website/actions/runs/38259999486) completed successfully. Its job steps confirm dependency install, `npm audit --audit-level=high`, `npm test` and `npm run build` all passed.
- **Reachable-history secret scan:** [run 38259999483](https://github.com/layalialzahra/layali-al-zahra-website/actions/runs/38259999483) completed successfully, including text/history and binary printable-string scan steps. Recorded output reports 413 reachable commits / approximately 117.24 MB, zero text findings, and 118 binary blobs containing printable strings / 170,446,401 bytes with zero findings. This heuristic does not semantically inspect compressed/encrypted payloads, unreachable objects, external systems or deployed environment values.
- **Vercel status boundary:** a GitHub status context named “Vercel” exists on the audited commit, but this is not deployment evidence. The owner-confirmed state remains that Vercel is disconnected and no current feature-branch changes are deployed. No deployment, production migration, cutover or `main` push was performed.
- **Implementation versus acceptance:** core CMS, Google Reviews provider-independent logic and route-aware homepage SSR/hydration exist in source. CI does not establish staging/runtime acceptance. Core CMS Task 6 remains open because staging CRUD/auth/upload/public-read verification, real staging migration comparison and owner acceptance are not evidenced. Google Business Profile API/OAuth/location access and crawler-facing HTTP verification remain unverified.
- **Confirmed SSR fallback gap:** a managed-review source lookup failure intentionally fails closed to an empty review list when managed reviews are enabled. Separately, a generic homepage-render exception returns the original HTML template with an empty `#root` and HTTP 200; that is not a useful crawlable fallback. Treat this as an open design/acceptance gap, not as a test failure that has been fixed.
- **Plan-sequence deviation:** route-aware SSR implementation proceeded before Core CMS Task 6 and live Google Reviews staging acceptance gates were satisfied. The code remains local/CI-only and the public source switch defaults off; do not mark upstream acceptance complete or perform cutover.
- **Next approved task:** Core CMS plan Task 6 — Stage verification and core CMS acceptance gate. Keep it open until required evidence is obtained in an owner-authorized safe environment. Do not start a downstream acceptance/cutover task or deploy as part of this documentation reconciliation.

## Task 01 — current status reconciliation (2026-10-12)

- Immediately before this documentation update, GitHub confirmed `feat/layali-managed-content-cms` at `dbd22794c87a7f6cd80003e32c4713d1463d8b34`. Compare against audited application baseline `046c4b7e4b5a7629fc860538b6d37b0e3b969e48` reports 15 commits ahead, 0 behind; the intervening commits modify documentation only. The implementation/code state remains the audited baseline, not a new code revision.
- Build verification [38259999486](https://github.com/layalialzahra/layali-al-zahra-website/actions/runs/38259999486) passed dependency installation, `npm audit --audit-level=high`, `npm test` and `npm run build` on `046c4b7e4b5a7629fc860538b6d37b0e3b969e48`. Historical scan [38259999483](https://github.com/layalialzahra/layali-al-zahra-website/actions/runs/38259999483) passed reachable text/history and binary printable-string scan steps on that same baseline (413 commits / approximately 117.24 MB; zero text findings; 118 binary blobs / 170,446,401 bytes; zero findings). These runs do not verify the later documentation commits.
- On `dbd22794c87a7f6cd80003e32c4713d1463d8b34`, the combined-status query returned only a **Vercel: failure** context linking to generic Vercel project-configuration documentation; no GitHub Actions workflow runs were returned for that SHA. This is not build verification or proof of a deployment. The owner-confirmed state remains: Vercel is disconnected and the current branch changes are not deployed.
- Implemented in source: dedicated Services/Offers/Packages/FAQs models, protected CRUD and published-only APIs, legacy snapshots and dry-run/apply migration utility, admin managers, provider-independent Google Reviews logic/UI/sync endpoint, session-version revocation, strict `script-src` with same-origin `/tracking.js`, and route-aware homepage SSR/hydration. Source/CI evidence is not staging or production acceptance.
- Open blockers: no authorised safe staging environment/database has been evidenced; CRUD/auth/origin/upload/public-read runtime checks, real staging migration comparison and owner acceptance remain open; Google Business Profile API approval/OAuth/verified-location access and live sync remain unverified; generic SSR exceptions still return an empty-root HTML shell with HTTP 200; deployed routing/crawler HTML, responsive browser QA, live proxy-chain/runtime security checks, rollback and release approval remain open.
- Ordered next action: **Short Task List Task 02 — Confirm a safe verification environment**. Do not reconnect/deploy Vercel to do so. Once an authorised non-production environment is established, continue **Core CMS plan Task 6, Steps 2–5**; Step 1 is evidenced only on `046c4b7e4b5a7629fc860538b6d37b0e3b969e48`. Keep all acceptance and release gates open until evidenced.
- No production migration/cutover, `main` push, repository visibility change or deployment is authorised. Preserve the history above; this section supersedes earlier “current HEAD” statements for status purposes without rewriting historical entries.


## Task 02 — environment verification (2026-10-12)

**Outcome: BLOCKED — no currently authorised and isolated non-production database could be verified.** The full evidence and required unblock checklist are in [docs/ENVIRONMENT-VERIFICATION-2026-10-12.md](ENVIRONMENT-VERIFICATION-2026-10-12.md).

The repository `.env.example` only provides a placeholder `MONGODB_URI` and defaults `MONGODB_DB_NAME` to the documented production database name `layalialzahra`. The MongoDB helper does not enforce environment isolation. Historical notes mention a previously healthy Vercel staging admin service and MongoDB/admin variables in Production and Preview, but do not establish a current active project, separate staging database, or production write isolation. Current provider-level Vercel/MongoDB configuration was not accessible through the connected tools. No credentials/secrets were accessed or copied.

No CMS runtime tests, migration, upload, deployment or production writes were performed. Vercel remains disconnected. Before staging acceptance, obtain owner-authorised project/URL and verify a dedicated staging database/cluster, staging-only credentials and access boundaries, and isolated Blob configuration if uploads are tested. Do not put secret values in this BRD or GitHub. The historical staging reference is not sufficient evidence to call the environment safe.


## Task 03 — Services management acceptance addendum (2026-10-12)

**Automated checks: PASS on tested commit `0b97e33e4cfcaf16e9a985a7d570ea206fcdf3a1`. Live/staging acceptance: BLOCKED by Task 02 environment verification.**

- Added focused API acceptance tests for create, default draft status, partial edits, display order, publish/unpublish, delete, invalid title/order, duplicate normalized slugs and published-only public ordering/serialization.
- Added UI tests for explicit Save Draft, editing a service's title and order, and displaying the duplicate-slug error without closing the editor.
- Fixed strict ordering validation: `null`, blank strings and booleans are rejected instead of coercing to zero. Finite numeric order values remain valid. The helper is shared by Services/Offers/Packages and FAQs.
- GitHub Actions Build verification [run 38270049182](https://github.com/layalialzahra/layali-al-zahra-website/actions/runs/38270049182) passed dependency installation, high-severity dependency audit, `npm test` and `npm run build` on the tested commit.
- Historical secret scan [run 38270049237](https://github.com/layalialzahra/layali-al-zahra-website/actions/runs/38270049237) also passed the redacted Gitleaks history and binary-blob scan on the tested commit. This automated result does not replace authenticated runtime testing. Do not mark the wider Core CMS acceptance, migration or release gates complete. No live database changes, uploads, deployment, production migration or public content-source change were made. Vercel remains disconnected; obtain the Task 02 environment-isolation evidence before live acceptance.


## Task 03 follow-up — duplicate slug on edit and final automated checks (2026-10-12)

- Added an API regression test confirming a service cannot be edited to use another service's slug; the request returns HTTP 409 and neither record is overwritten.
- Latest tested code/test commit: [`5bab4a5992315c529a708e48b6f07c2f6e596042`](https://github.com/layalialzahra/layali-al-zahra-website/commit/5bab4a5992315c529a708e48b6f07c2f6e596042).
- Build verification [run 38270400681](https://github.com/layalialzahra/layali-al-zahra-website/actions/runs/38270400681) passed dependency installation, `npm audit --audit-level=high`, `npm test` and `npm run build`.
- Historical secret scan [run 38270400613](https://github.com/layalialzahra/layali-al-zahra-website/actions/runs/38270400613) passed the redacted Gitleaks reachable-history scan and binary-blob scan.
- These checks verify the feature-branch source only. Task 02 still blocks live/staging runtime acceptance; no database writes, uploads, migrations, deployment or public content-source changes were performed. Vercel remains disconnected.


## CMS expansion checkpoint — Short Task List Task 04 (2026-10-12)

Automated Offers management checks pass on code/test commit `526047628878e300791450700d6e3f43e7d1c2e0`; Build verification [38271554877](https://github.com/layalialzahra/layali-al-zahra-website/actions/runs/38271554877) passed dependency install, `npm audit --audit-level=high` (0 vulnerabilities), 80 Node tests, 22 Vitest tests across 5 files, client/SSR build and homepage SSR smoke test. Added API/route and admin UI tests for CRUD, publication, display-price strings, recurring/descriptive validity labels and date-boundary validation. Fixed stale `validFrom`/`validUntil` values persisting when an offer changes to a non-date validity type. This is not staging/runtime acceptance: Task 02's safe non-production environment/database blocker remains open. No live database write, migration, deployment or public content-source cutover occurred; Vercel remains disconnected.


## Short Task List Task 05 — Packages admin automated acceptance (2026-10-12)

**Outcome:** Automated API/model/UI checks PASS on code/test commit [cc6603ffae487a827e98d81ed7d5b1f3ac89a548](https://github.com/layalialzahra/layali-al-zahra-website/commit/cc6603ffae487a827e98d81ed7d5b1f3ac89a548). **Task 05 remains OPEN overall** because staging/runtime acceptance is BLOCKED by Task 02; this does not close Core CMS Task 6 Steps 2–5 or authorise a migration or public-source cutover.

- Added package acceptance tests for CRUD, draft defaults, partial edits, category and exact price-label preservation, image URL/alt, included items, booking destination, ordering, publish/unpublish/delete, duplicate normalized slugs, invalid input and published-only public serialization.
- Added Packages admin UI tests for saving a draft, image-upload response wiring, explicit publication transitions, visible API errors and delete confirmation.
- Fixed `api/_lib/managed-content-routes.js` error handling: an unsafe HTTP image URL generated a validation message that was incorrectly mapped to HTTP 503. It now returns HTTP 400, with a regression test confirming no collection mutation.
- Build verification [38273001219](https://github.com/layalialzahra/layali-al-zahra-website/actions/runs/38273001219) passed install, `npm audit --audit-level=high` (0 vulnerabilities), 87 Node tests, 27 Vitest tests across 6 files, client build, SSR build and homepage SSR smoke test.
- Historical scan [38273001202](https://github.com/layalialzahra/layali-al-zahra-website/actions/runs/38273001202) passed: 463 reachable commits / ~117.35 MB, zero Gitleaks findings; 118 reachable binary blobs / 170,446,401 bytes, zero findings.
- No authorised isolated staging database has been verified, so actual MongoDB persistence, real Blob upload/storage, staging CRUD/auth/origin/public-read checks and migration comparison remain unverified. No live writes, upload, migration, deployment or public content-source change occurred. Vercel remains disconnected.


## Expansion acceptance checkpoint — Short Task List Task 06 (2026-10-12)

FAQ acceptance coverage has been added for create/update/delete, default draft state, order, publish/unpublish transitions, page association validation and reassignment, published-only reads, per-page isolation, invalid/missing page-key handling and admin UI filtering/error feedback. Source review found the FAQ validator and route enforce explicit valid page keys and filter public responses by both published status and requested page. No application logic change was justified by the inspected source.

The test commits are `83b248c2480c0859911c58bbcf940bf0fe8dcbea` and `e0efd65cac369ff242b3093753c5e1a9ac209da3`. The available GitHub status/workflow query returned no check result for these commits; test execution and build success remain unverified and must not be claimed. Runtime acceptance remains blocked by Task 02: no authorised, production-isolated non-production database is verified. No production data, deployment, migration or public content source was changed; Vercel remains disconnected. Task 06 remains open pending evidence.

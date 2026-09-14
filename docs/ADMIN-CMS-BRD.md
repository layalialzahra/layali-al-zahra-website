# Layali Al Zahra Website — Admin CMS / Content Management BRD

**Project:** Layali Al Zahra Beauty Lounge website  
**Repository:** `layalialzahra/layali-al-zahra-website`  
**Primary admin URL:** `https://layalialzahra.com/admin`  
**Status:** 🟡 Implementation in progress

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
- Stage 4.1 is a correction/acceptance gate, not a replacement for the historical Stage 4 record. The current public/admin implementation has been visually reviewed by the owner and judged to be at the desired professional design level; remaining 4.1 work is functional live acceptance and any small defects found during that acceptance.
- Six management sample records are loaded in the active CMS environment: two Blog items, two Beauty Tips and two News items.

## 4. Master Status
| Stage | Status | Current state |
|---|---|---|
| 0 — Baseline & Safety | 🟢 Complete | Audit, rollback checkpoint and production-build verification completed |
| 1 — MongoDB Production Connection | 🟢 Complete | Atlas + Vercel configured and live DB health confirmed |
| 2 — Secure Admin Authentication | 🟢 Complete | Authentication and protected-access acceptance completed |
| 3 — CMS Foundation | 🟢 Complete | API safety, CRUD, draft privacy, publish/unpublish, public API and Blog detail acceptance completed |
| 4 — Admin Content Editor | 🟢 Complete | Responsive editor/list, News UX, Blob storage, image upload and live acceptance completed |
| 4.1 — Public Content Presentation & Admin UX | 🟡 In progress | Correction pass is deployed; owner approves the design direction; live desktop/mobile and functional acceptance remain |
| 5 — Public Tips/Blog/News | 🔒 Blocked until Stage 4.1 passes | Route/API foundations exist; six-tip migration and final acceptance wait for the 4.1 gate |
| 6 — Offers | ⬜ Not started | Deferred until core CMS/public content is stable |
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
- [x] Richer News-specific UX: News creation defaults to `News`, provides a News Summary label/placeholder, contextual publishing guidance and relevant News/Announcements/Offers/Events category choices.
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

## 10. Stage 4.1 — Public Content Presentation & Admin UX — IN PROGRESS
This is the current correction/acceptance gate between the completed core CMS (Stages 0–4) and Stage 5. It must not erase or replace the completed Stage 0–4 record above.

### Public routing and navigation
- [x] Explicit public route handling for `/home`, `/services`, `/packages`, `/offers`, `/tips`, `/blog`, `/news` and `/contact`.
- [x] Vercel SPA rewrites for existing public pages that previously failed direct navigation: `/home`, `/services`, `/packages`, `/offers`, `/contact`.
- [ ] Live desktop/mobile verification of every primary header navigation item.

### Public content presentation
- [x] Blog/News listing cards no longer display hashtag-style tags.
- [x] Listing/detail image containers use stable aspect-ratio geometry and `object-fit: cover`.
- [x] Blog, Tips and News listing/detail layouts use the established Offers visual language as the design reference.
- [x] Public content detail pages use editorial title, metadata, excerpt/body and structured tip-step presentation.
- [ ] Live desktop verification against Offers at representative viewport widths.
- [ ] Live mobile verification against Offers at representative viewport widths.
- [ ] Verify all six sample records render correctly on public listing and detail pages.
- [ ] Verify homepage Tips/Blog/News showcases render correctly with the six sample records and do not duplicate or break existing homepage content.
- [ ] Verify image crops remain consistent at desktop/tablet/mobile widths.
- [ ] Verify detail-page 404 behavior for invalid slugs.

### Admin UX
- [x] Branded admin login shell.
- [x] Responsive dashboard with Blog/Beauty Tips/News counts and quick actions.
- [x] Content Library with search/type/status filters, create actions, thumbnails, status/category metadata and compact row actions.
- [x] Editor with primary content column plus media/publishing rail.
- [x] Settings/password-change area.
- [x] Desktop sidebar and mobile navigation drawer.
- [ ] Live desktop/mobile acceptance of login/setup/dashboard/library/editor/settings as one coherent workspace.
- [ ] Verify a first-time admin can identify create/edit/publish/unpublish/duplicate/delete actions without developer assistance.
- [ ] Verify validation, loading, success, failure and confirmation states for the main CMS actions.

### Sample content
- [x] Six management sample records are loaded: two Blog, two Beauty Tip and two News.
- [x] Sample content was researched from current beauty/hair/nail/skin guidance and current beauty-trend context before seeding.
- [ ] Verify every sample record has correct public image, title, excerpt/body, category and publication state.
- [ ] Verify no sample record is unintentionally future-dated or private.
- [ ] Verify sample content can be edited, unpublished and republished without code deployment.

### Regression/security gate
- [x] Existing authentication/session behavior preserved.
- [x] Existing MongoDB/API/CRUD behavior preserved.
- [x] Existing duplicate/publish/unpublish/delete behavior preserved.
- [x] Existing image upload behavior preserved.
- [ ] Final live regression of create/edit/duplicate/publish/unpublish/delete/upload after the UX correction pass.
- [ ] Confirm no protected API becomes publicly writable through the routing changes.
- [ ] Confirm no secrets or diagnostic metadata are exposed publicly.

### Stage 4.1 acceptance rule
Stage 4.1 remains 🟡 In progress until the remaining live checks above are verified. Stage 5 execution and production-domain cutover are gated on this acceptance, unless the owner explicitly overrides the gate.

## 11. Stage 5 — Public Tips/Blog/News — BLOCKED UNTIL 4.1 PASSES
- [x] Beauty Tips DB-driven published-only API.
- [x] Protected idempotent six-tip migration tooling.
- [x] Blog/News listing/detail foundations.
- [x] SPA route recognition and Vercel rewrites for listing/detail routes.
- [x] Listing cards use stable slug URLs.
- [x] Blog/News listing pagination and Load more UI.
- [x] Beauty Tips stable slug detail links and pagination/Load more UI.
- [x] Detail pages expose H1, alt text, publication date, category, tags and related-service context when available.
- [x] Per-content title/description/canonical/Open Graph/Twitter metadata and JSON-LD foundation.
- [ ] Execute and verify six-tip migration.
- [x] Verify drafts remain private: the same live draft/unpublished test was excluded from public API and detail route.
- [ ] Final public design verification.
- [x] Final live route verification for the tested Blog detail route.
- [ ] Live stable slugs/H1/alt/publication/category/tags/related-service/404 acceptance across migrated content.
- [ ] Live SEO/canonical/OG/structured content/internal-link acceptance across final content set.
- [x] Publishing without code deployment acceptance: publish/unpublish visibility changed through CMS/API without a frontend code deployment.

### Stage 5 execution order after 4.1
1. Complete six-tip migration into CMS drafts.
2. Review and publish the migrated six-tip set.
3. Verify `/beauty-tips`, `/beauty-tips/<slug>`, `/blog`, `/blog/<slug>`, `/news`, `/news/<slug>`.
4. Verify homepage content showcases and internal links.
5. Complete public SEO/canonical/OG/JSON-LD/404 checks.
6. Complete nontechnical publishing acceptance.
7. Only then approve production-domain cutover as the stable production state.

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
- [ ] Final regression that public routing changes cannot bypass authentication on admin APIs.

### Usability/design
- [ ] Final nontechnical end-to-end publishing acceptance.
- [x] Loading/success/failure states.
- [x] Useful empty state.
- [x] Mobile admin polish.
- [x] Public design preserved.
- [x] Branded admin shell.
- [ ] Final desktop/mobile acceptance across all completed dynamic sections.

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
- [ ] Attach `layalialzahra.com` and required `www` host to the new Vercel project.
- [ ] Verify SSL/DNS and production site on the salon domain.
- [ ] Remove the salon domain from the old Vercel project only after the new project accepts it and DNS/SSL are ready.
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
- [ ] Six-tip migration.
- [x] DB-driven public API foundation.
- [x] Slug normalization/uniqueness foundation.
- [x] Public API filters drafts.
- [x] Public design preserved.
- [x] Production build/deployment verification.
- [ ] Owner can publish end-to-end without code: Stage 4 core CMS publishing flow is verified; final 4.1 regression and production-domain cutover remain pending.

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

## 19. Recovery / Source-of-truth rule
The comprehensive BRD version at commit `c95bbf465b5bced148ae066e3feefddb0e460f46` is the recovered historical baseline for the project record. The current file preserves that baseline and adds the Stage 4.1 correction/acceptance layer. Repository history remains available for exact historical comparison.

**Rule going forward:** never delete historical stage detail to make a correction pass shorter. Update the relevant checklist/status and append a dated change-log entry instead.

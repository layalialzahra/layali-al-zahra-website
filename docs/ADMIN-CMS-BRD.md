# Layali Al Zahra Website — Admin CMS / Content Management BRD

**Project:** Layali Al Zahra Beauty Lounge website  
**Repository:** `layalialzahra/layali-al-zahra-website`  
**Primary admin URL:** `https://layalialzahra.com/admin`  
**Status:** 🟡 Implementation in progress

> **Project change-control rule:** Keep this BRD synchronized with implementation. Every repository/code/configuration change must update the BRD status/checklist in the same change.
>
> **Implementation fidelity rule:** Detailed requirements below are binding. A stage is complete only when its applicable checklist and acceptance criteria are implemented and verified.

## 1. Purpose
Convert the hard-coded salon website into a professional, manageable CMS while preserving the existing public website design unless a redesign is explicitly requested. The CMS must allow a non-technical salon owner/admin to manage content without GitHub, source-code edits, Vercel, or developer assistance.

## 2. Target Architecture
Public Tips/Blog/News → Backend API → MongoDB Atlas. Private `/admin` → secure login/session → authenticated admin APIs → MongoDB Atlas.

## 3. Current State
- MongoDB Atlas production connection is complete and the live database health endpoint previously confirmed database `layalialzahra`.
- Secure authentication backend is implemented: password hashing, signed 8-hour HttpOnly session cookie, session verification, same-origin checks, login/logout, and one-time initial admin setup.
- `/admin` now uses the real authentication API rather than client-only fake credentials. It checks the existing session on load, supports first-time setup, login, logout, loading states and generic errors.
- CMS modules are intentionally not implemented yet; the authenticated dashboard currently acts as the Stage 2 shell.
- Deployment issues were identified in both authentication server modules: their MongoDB helper relative imports were incorrect. Both have now been corrected to the proper paths.
- The frontend now explicitly recognizes direct pathname `/admin` and suppresses the public header/footer/cookie UI on the admin route.
- Vercel configuration now rewrites direct `/admin` requests to the SPA entry point while preserving the browser pathname, allowing the frontend `/admin` route to render.
- Login abuse protection is implemented using MongoDB-backed attempt records keyed by a hashed IP/username combination: five failures within a 15-minute window trigger a 30-minute lockout, with `Retry-After` returned on blocked attempts.
- Admin Account settings now expose a secure password-change form backed by `/api/admin/password`; successful password changes invalidate the current browser session and require sign-in again.
- Stage 3 content foundation now has shared server-side validation, normalization, sanitization, serialization and MongoDB indexes, plus an authenticated CRUD/search/filter/duplicate API for content.
- Production authentication acceptance testing and the public content API remain open.

## 4. Master Status
| Stage | Status | Current state |
|---|---|---|
| 0 — Baseline & Safety | 🟡 In progress | Audit complete; build verification and rollback checkpoint remain |
| 1 — MongoDB Production Connection | 🟢 Complete | Atlas + Vercel configured; live health check confirmed `layalialzahra` |
| 2 — Secure Admin Authentication | 🟡 In progress | Core auth, routing, rate limiting and password change implemented; production acceptance remains |
| 3 — CMS Foundation | 🟡 In progress | Content model, indexes and authenticated CRUD/search/filter/duplicate API implemented; public API remains |
| 4 — Admin Content Editor | ⬜ Not started | Depends on Stage 3 |
| 5 — Public Tips/Blog/News | ⬜ Not started | Depends on Stages 3–4 |
| 6 — Offers | ⬜ Not started | Deferred until core content CMS works |
| 7 — Services & Packages | ⬜ Not started | Deferred |
| 8 — Gallery & Testimonials | ⬜ Not started | Deferred |
| 9 — SEO & Analytics | ⬜ Not started | Deferred until content system is stable |

## 5. Stage 0 — Baseline & Safety
### Completed
- [x] Inspect existing routes and code.
- [x] Identify database/API experiments and limitations.
- [x] Preserve public design.
- [x] Establish and maintain this BRD.
### Open
- [ ] Confirm current Vercel production build/deployment works independently.
- [ ] Establish/verify rollback checkpoint.

## 6. Stage 1 — MongoDB Production Connection — COMPLETE
- [x] Production MongoDB Atlas cluster configured.
- [x] Vercel `MONGODB_URI` configured as a Production secret.
- [x] `MONGODB_DB_NAME=layalialzahra` configured.
- [x] Reusable cached MongoDB connection helper implemented.
- [x] Generic production health/error handling implemented.
- [x] Live health check confirmed the production API reaches `layalialzahra`.
- [x] CMS collections intentionally deferred to later stages.

## 7. Stage 2 — Secure Admin Authentication
### 7.1 Admin access model
- [x] `/admin` is the direct private admin URL.
- [x] No public navigation link is required.
- [x] Public website design/navigation remains unchanged.

### 7.2 Login and first-time setup
- [x] Admin login form uses admin email + password.
- [x] First-time setup is available only when no admin account exists and requires `ADMIN_SETUP_TOKEN`.
- [x] Password confirmation is required during setup.
- [x] Loading states and generic user-facing errors are implemented.
- [x] Password values are cleared after successful authentication/change flows.

### 7.3 Server-side security
- [x] Credentials are validated server-side.
- [x] Passwords are hashed with salted `scrypt` before storage.
- [x] Password hashes are never returned to the frontend.
- [x] Sessions use a signed token with an 8-hour expiry.
- [x] Session cookie is HttpOnly, SameSite=Lax and Secure in production.
- [x] Protected API helper validates the session server-side.
- [x] Same-origin protection is applied to authentication writes.
- [x] Generic authentication errors avoid exposing sensitive backend details.
- [x] Basic login abuse/rate limiting is implemented with MongoDB-backed attempt tracking.
- [x] Authenticated admin password-change endpoint verifies the current password, hashes the replacement password and clears the active session.

### 7.4 `/admin` integration
- [x] Removed fake client-only `isLoggedIn` authentication flow.
- [x] Admin UI checks the server session on load.
- [x] Valid session opens the authenticated dashboard shell.
- [x] Login creates the server session.
- [x] Logout clears the session cookie and returns to login.
- [x] Unauthenticated users cannot access the authenticated dashboard through the UI.
- [x] Frontend explicitly maps direct `/admin` pathname to `AdminPage` and keeps public header/footer out of the admin route.
- [x] Vercel rewrite added so direct `/admin` requests reach the SPA entry point.
- [ ] Verify the deployed `/admin` route no longer returns Vercel `404: NOT_FOUND`.
- [ ] Verify protected API access independently in production.
- [ ] Verify login/logout/setup/password-change end-to-end on the deployed site.

### 7.5 Admin Account settings
- [x] Settings view is available from the authenticated dashboard.
- [x] Admin Account section provides current password, new password and confirmation fields.
- [x] Password-change success signs the admin out and requires a fresh login.
- [ ] Verify password change against the production database/session flow.

### Stage 2 acceptance
- [ ] Unauthenticated user sees only login/setup as appropriate.
- [ ] Protected dashboard/API rejects unauthenticated access.
- [ ] Valid credentials create a valid session.
- [ ] Logout removes authenticated access.
- [ ] Session expiry is enforced.
- [x] Basic abuse protection is present.
- [x] Admin can change their password securely in the implemented flow.
- [ ] Production deployment passes end-to-end acceptance.

## 8. Stage 3 — CMS Foundation
### Unified content model
Use one content system with `type: blog | tip | news`.

Required fields: type, title, slug, excerpt, body, featured image, alt text, category, tags, author, related service, SEO title, meta description, social image, draft/published, publish date, created/updated timestamps, stable ID.

### Categories
**Hair:** Hair Care, Hair Treatments, Hair Colour, Hair Extensions  
**Beauty:** Skincare, Nails, Brows & Lashes, Waxing  
**Lifestyle:** Dubai Beauty, UAE Beauty, Seasonal, Events  
**Salon:** News, Offers, Announcements

Architecture must allow categories to be added without code changes.

### Database/API requirements
- [x] Shared content helper created with `blog | tip | news` type validation.
- [x] Slugs normalized consistently.
- [x] Tags normalized and deduplicated.
- [x] Server-side field validation and normalization foundation implemented.
- [x] Basic body sanitization implemented for stored content.
- [x] MongoDB indexes prepared for unique type/slug, published feeds, category feeds and updated time.
- [x] Authenticated content API added for create/read/update/delete.
- [x] Authenticated content search, status/type/category filters and pagination added.
- [x] Authenticated duplicate operation added; duplicates are forced to draft state with a unique copy slug.
- [x] Publish/unpublish supported through the content status field.
- [ ] Unique slugs within namespace/type verified against production data.
- [ ] Drafts private through public API.
- [ ] Safe API errors; no secrets in responses verified in production.
- [ ] Public APIs expose only published content.

### Acceptance
- [ ] Authenticated APIs safely create/edit/delete/publish content in production.
- [ ] Public APIs expose only intended published content.

## 9. Stage 4 — Admin Content Editor
### Dashboard structure
ADMIN / Dashboard  
CONTENT: Blog Posts, Beauty Tips, Salon News, Offers, Announcements  
WEBSITE: Services, Packages, Gallery, Testimonials  
SETTINGS: SEO, Contact Details, Admin Account

### Content lists
- [ ] Show title/category/status/date.
- [ ] Search and status/category/type filters.
- [ ] Edit, duplicate, publish/unpublish, delete with confirmation.
- [ ] Add new.
- [ ] Loading/error/empty states.

### Blog editor
- [ ] Title, slug, category, featured image, alt text.
- [ ] Excerpt and rich body editor.
- [ ] Tags and related service.
- [ ] SEO title/meta/keywords or tags/social image.
- [ ] Draft/publish and publish date.

### Beauty Tip editor
- [ ] Title, description, featured image.
- [ ] Tip1–Tip5.
- [ ] Related service, category/tags, SEO, draft/published.

### News editor
- [ ] Separate `news` type.
- [ ] Support new service, staff, equipment, holiday hours, Eid, Ramadan, renovation, event, product line and similar announcements.
- [ ] Image/title/text/date/status.

### Image handling
- [ ] Upload/select image.
- [ ] Use object storage rather than MongoDB binary storage.
- [ ] Persist URL/reference and alt text.
- [ ] Handle upload failures clearly.

### Acceptance
- [ ] Nontechnical admin can create/edit/delete content without code.
- [ ] Admin can upload/select images.
- [ ] Admin can save drafts and publish/unpublish.

## 10. Stage 5 — Public Tips/Blog/News
- [ ] Replace hard-coded Tips content with DB-driven content.
- [ ] Migrate six existing tips accurately.
- [ ] Keep drafts private.
- [ ] Preserve existing public design.
- [ ] Build Beauty Journal listing with featured article, filters, latest cards and pagination/load-more if needed.
- [ ] Implement `/beauty-tips`, `/beauty-tips/:slug`, `/blog`, `/blog/:slug`, `/news`, `/news/:slug`.
- [ ] Stable slugs, full content, H1, image alt, publication info, category/tags, related service/internal links and 404 handling.
- [ ] Per-content SEO: title, meta, canonical, OG image, structured content, alt text and internal links.
- [ ] No code deployment required to publish content.

## 11. Stage 6 — Offers
- [ ] title, short/full description, included services, price, original price, dates, image, category/tag, published state, CTA/booking.
- [ ] Dynamic Offers page with active/current display and expiry behavior.

## 12. Stage 7 — Services & Packages
- [ ] Services: name, description, category, image, price/starting price, duration, active/published, ordering, SEO, related content/CTA.
- [ ] Packages: name, description, included services, price, original/reference price, image, validity, active/published, ordering.
- [ ] Public Services/Packages pages become DB-driven while preserving design.

## 13. Stage 8 — Gallery & Testimonials
### Gallery
- [ ] Categories: Hair, Nails, Makeup, Bridal, Salon.
- [ ] Upload, title/caption, alt text, category, ordering, visible, delete/replace.
- [ ] Public gallery becomes DB-driven.
### Testimonials
- [ ] Client name, review, rating, date, optional photo, published/unpublished, ordering.

## 14. Stage 9 — SEO & Analytics
- [ ] Sitewide title/default title, default meta, OG image, canonical domain, robots/indexability, sitemap, canonicals, structured data.
- [ ] GA or equivalent and Search Console readiness.
- [ ] Track performance, most-viewed articles, published count and dashboard statistics.

## 15. Cross-stage Non-negotiables
### Security
- [ ] No secrets in GitHub.
- [ ] Server-side environment variables.
- [x] Server-side authentication/session validation foundation.
- [ ] Every write requires a valid session.
- [ ] No sensitive errors in responses.
- [ ] Destructive actions require confirmation.
- [x] Basic content sanitization foundation.

### Usability
- [ ] Nontechnical workflow; no GitHub/code/Vercel for publishing.
- [x] Form validation and clear loading/success/failure states in admin authentication/settings flows.
- [ ] Useful empty states.
- [ ] Mobile-friendly admin.

### Design
- [x] Public design preserved while backend/admin foundation is developed.

### Performance/reliability
- [x] Cached MongoDB connections.
- [x] Core content indexes defined.
- [ ] Appropriate indexes and pagination verified for all content queries.
- [ ] No large image binaries in MongoDB.
- [ ] Performant public pages.
- [ ] Graceful API failure.

## 16. Core MVP Checklist
- [x] Real authentication foundation.
- [x] Secure MongoDB production connection.
- [x] Authentication API foundation.
- [x] Unified content model foundation.
- [x] Authenticated content CRUD foundation.
- [x] Draft/publish status support.
- [ ] Images.
- [x] Categories/tags fields.
- [x] Related service field.
- [x] Per-content SEO fields.
- [ ] Migrate six existing tips.
- [ ] DB-driven public content pages.
- [x] Slug normalization/uniqueness foundation.
- [ ] Drafts hidden from public API.
- [x] Public site preserved.
- [ ] Production build/deployment independently verified.
- [ ] Owner can publish without code.

## 17. Change Log
### 2026-09-14 — Stage 2 authentication integration
- Replaced the mock client-only admin login with server-backed session authentication.
- Added first-time admin setup using the one-time setup token.
- Added login, session-check, logout, loading and generic error states to `/admin`.
- Kept the dashboard as a shell until CMS stages are implemented.
- Kept Stage 2 open because production acceptance, rate limiting and password change are not yet complete.

### 2026-09-14 — Fix authentication module import path
- Corrected the MongoDB helper import in `api/_lib/auth.js` from an invalid relative path to `./mongodb.js`.
- This removes a serverless module-resolution failure that could prevent authentication endpoints from loading in production.
- Stage 2 remains in progress pending direct `/admin` routing and production acceptance.

### 2026-09-14 — Fix admin setup module import path
- Corrected the MongoDB helper import in `api/admin/setup.js` from an invalid relative path to `../_lib/mongodb.js`.
- This removes the corresponding setup-endpoint module-resolution failure.
- Stage 2 remains in progress pending direct `/admin` routing and production acceptance.

### 2026-09-14 — Add direct `/admin` frontend routing
- Updated `src/App.tsx` to recognize the browser pathname `/admin` in addition to the existing hash-based public routing.
- The admin route now renders `AdminPage` directly and excludes the public header, footer and cookie-consent UI.
- Stage 2 remains in progress until Vercel's server-side request routing is corrected/verified and production acceptance passes.

### 2026-09-14 — Add Vercel `/admin` SPA rewrite
- Added a Vercel rewrite from `/admin` to `/` so a direct browser request is served by the Vite SPA instead of Vercel returning `404: NOT_FOUND`.
- The browser pathname remains `/admin`, allowing the frontend route added above to render.
- Stage 2 remains in progress until the new deployment is live and end-to-end authentication acceptance is verified.

### 2026-09-14 — Add durable login abuse protection
- Added MongoDB-backed login attempt tracking keyed by a SHA-256 hash of client IP and normalized username.
- Five failures within a 15-minute window trigger a 30-minute lockout; blocked responses include `Retry-After`.
- Successful login clears the failure record.
- Stage 2 remains in progress pending password change and production acceptance.

### 2026-09-14 — Add admin account password settings
- Added authenticated `/api/admin/password` endpoint with current-password verification, 12-character minimum replacement password, confirmation, salted hashing and session clearing after a successful change.
- Added Settings → Admin Account UI with a password-change form.
- Stage 2 remains in progress pending production verification of the password-change/session flow.

### 2026-09-14 — Create unified content data foundation
- Added shared content helpers for `blog | tip | news`, required-field validation, slug/tag normalization, basic server-side body sanitization and safe serialization.
- Added MongoDB index definitions for unique type/slug, published feeds, category feeds and update ordering.
- Stage 3 is now in progress; content API endpoints are the next implementation item.

### 2026-09-14 — Add authenticated content CRUD API
- Added `/api/admin/content` with server-side session protection.
- Added create/read/update/delete, type/status/category/search filters, pagination and duplicate-to-draft behavior.
- Added publish/unpublish support through the content status field and duplicate slug generation.
- Stage 3 remains in progress pending the public published-only API and production verification.

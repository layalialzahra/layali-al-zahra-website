# Layali Al Zahra Website — Admin CMS / Content Management BRD

**Project:** Layali Al Zahra Beauty Lounge website  
**Repository:** `layalialzahra/layali-al-zahra-website`  
**Primary admin URL:** `https://layalialzahra.com/admin`  
**Status:** 🟡 Implementation in progress  

> **Project change-control rule:** Keep this BRD synchronized with implementation. Every repository/code/configuration change must update the BRD status/checklist in the same change.
>
> **Implementation fidelity rule:** The detailed requirements in this document are binding project requirements, not optional suggestions. A stage is not complete because a simplified version works. Every applicable checklist item, acceptance criterion, data field, workflow, security requirement, and UX requirement must be implemented and verified before the stage is marked complete.

## 1. Purpose

Convert the hard-coded salon website into a professional, manageable CMS while preserving the existing public website design unless a redesign is explicitly requested.

The CMS must allow a non-technical salon owner/admin to manage content without GitHub, source-code edits, Vercel, or developer assistance.

### Primary priority

1. Secure `/admin` authentication.
2. MongoDB-backed CMS foundation.
3. Unified content management for:
   - Beauty Tips
   - Blog Posts
   - Salon News
4. Admin editor with drafts, publishing, images, categories, tags, related services and SEO fields.
5. Database-driven public content pages and individual article URLs.

### Later priorities

6. Offers.
7. Services & Packages.
8. Gallery & Testimonials.
9. Sitewide SEO, analytics and content-performance tooling.

## 2. Target Architecture

```text
PUBLIC WEBSITE
    │
    ├── /beauty-tips
    ├── /beauty-tips/:slug
    ├── /blog
    ├── /blog/:slug
    ├── /news
    └── /news/:slug
            │
            ↓
       Backend API
            │
            ↓
       MongoDB Atlas

ADMIN
    │
    └── /admin
          │
          ↓
      Secure Login
          │
          ↓
     Admin Dashboard
          │
          ↓
      Authenticated API
          │
          ↓
      MongoDB Atlas
```

## 3. Audit Findings

- Vite + React 18 + TypeScript.
- Hash-based navigation is currently used.
- `src/components/AdminPage.tsx` is a client-only login prototype accepting any non-empty credentials.
- `src/pages/TipsPage.tsx` contains six hard-coded tips.
- `mongodb` dependency already exists.
- `api/test.js` previously created a Mongo client per request and exposed raw errors.
- `vercel.json` exists with SPA fallback/security configuration.
- `.gitignore` exists and excludes environment secrets while retaining `.env.example`.
- No MongoDB secret was found in the repository audit.
- Reliable production build/deployment verification remains open as an independent Stage 0 check.

## 4. Master Status

| Stage | Status | Current state |
|---|---|---|
| 0 — Baseline & Safety | 🟡 In progress | Audit complete; live deployment/API verified, but independent build verification and rollback checkpoint remain |
| 1 — MongoDB Production Connection | 🟢 Complete | Atlas + Vercel configured; live health check confirms database `layalialzahra` |
| 2 — Secure Admin Authentication | 🟡 In progress | Secure auth backend foundation deployed; admin UI integration now in progress |
| 3 — CMS Foundation | ⬜ Not started | Depends on secure authenticated API foundation |
| 4 — Admin Content Editor | ⬜ Not started | Depends on Stage 3 |
| 5 — Public Tips/Blog/News | ⬜ Not started | Depends on Stages 3–4 |
| 6 — Offers | ⬜ Not started | Deferred until core content CMS works |
| 7 — Services & Packages | ⬜ Not started | Deferred |
| 8 — Gallery & Testimonials | ⬜ Not started | Deferred |
| 9 — SEO & Analytics | ⬜ Not started | Deferred until content system is stable |

## 5. Stage 0 — Baseline & Safety

### Completed

- [x] Inspect current production code and routes/pages.
- [x] Identify API/database experiments.
- [x] Record current admin/CMS limitations.
- [x] Preserve public design as default constraint.
- [x] Establish BRD as project source of truth.

### Still open — deliberately not marked complete

- [ ] **Confirm current Vercel deployment/build works.** The live health endpoint proves a deployment is serving the API, but the project's production build command has not yet been independently recorded/verified in this BRD.
- [ ] **Establish/verify rollback checkpoint.** A known-good commit/deployment must be identified so implementation can be safely rolled back if required.

**Why these are separate:** A successful API health response verifies the deployed MongoDB connection. It does not by itself constitute a documented build test or a verified rollback procedure.

## 6. Stage 1 — MongoDB Production Connection

### Code foundation

- [x] Reusable cached MongoDB connection helper.
- [x] Server-side-only database URI usage.
- [x] Production-safe DB health endpoint.
- [x] Shared helper and safe errors in test endpoint.
- [x] `.gitignore` and `.env.example` added without secrets.

### Atlas / Vercel configuration

- [x] Create MongoDB Atlas project and Free cluster.
- [x] Create database user.
- [x] Rotate database-user password after accidental screenshot exposure.
- [x] Configure Atlas IP Access List for Vercel using `0.0.0.0/0`; entry is Active.
- [x] Remove old Vercel MongoDB environment variable/configuration.
- [x] Add new production `MONGODB_URI` pointing to the new Atlas cluster.
- [x] Add production `MONGODB_DB_NAME=layalialzahra`.
- [x] Redeploy Vercel after environment-variable changes.
- [x] Verify `/api/health/db` successfully reaches the new Atlas cluster.

### Intentionally deferred to CMS stages

- [ ] Create CMS collections/models.
- [ ] Create content indexes and unique slug constraints.
- [ ] Create authenticated CRUD APIs.

**Stage 1 completion condition:** Production can securely connect to the new Atlas cluster. Confirmed by the live response `{success:true, database:"layalialzahra"}` on 14 September 2026.

## 7. Stage 2 — Secure Admin Authentication

### Admin access

- [x] `/admin` remains a direct private admin URL.
- [x] No Admin button/link is required in public navigation.
- [x] Public navigation/design remains unchanged.
- [x] Admin login remains branded for Layali Al Zahra with a clean simple form.
- [x] Login fields: admin email/username and password.
- [x] Login/setup actions include loading and error states.

### Authentication architecture

- [x] Replace the current client-only `isLoggedIn` authentication completely.
- [x] Credentials are validated server-side.
- [x] Admin password is never stored in frontend source or exposed to the browser.
- [x] Password is stored only as a secure scrypt hash.
- [x] Use a signed server-side session mechanism.
- [x] Session uses an HttpOnly cookie and appropriate Secure/SameSite protections in production.
- [x] Authentication helper is available for independently protecting APIs.
- [x] Logout invalidates the session cookie.
- [x] Sessions have controlled 8-hour expiry.
- [x] Invalid credentials return a generic, non-sensitive error.
- [x] Authentication failures do not expose database/server details.
- [ ] Basic abuse protection/rate limiting or equivalent login-attempt protection is included where practical for the serverless architecture.

### Admin account management

- [x] Initial admin credential can be provisioned securely without putting the password in GitHub, using the server-side setup token.
- [ ] Admin credentials can later be changed from Settings → Admin Account.
- [ ] Password-change flow requires current authentication and secure password handling.

### Current implementation checkpoint

- [x] Secure authentication backend foundation deployed in commit `7373c0ff49924c146183d343f2770d52586b0b86`.
- [x] Production `ADMIN_SESSION_SECRET` configured in Vercel.
- [x] Production `ADMIN_SETUP_TOKEN` configured in Vercel.
- [ ] Verify the live auth endpoints after the latest environment-variable redeploy.
- [ ] Complete and verify the `/admin` UI against the live session endpoints.

**Stage 2 acceptance:** An unauthenticated visitor can see the login screen but cannot access the dashboard or protected content APIs. A correct credential creates a secure session; logout removes access; directly calling protected APIs without a valid session fails.

## 8. Stage 3 — CMS / Database Foundation

### 3.1 Unified content model

Do **not** build three unrelated CMS implementations. Build one reusable Content system with a content type:

```text
CONTENT
  ○ Blog
  ○ Beauty Tip
  ○ Salon News
```

The same underlying editor/API architecture should power all three, with type-specific presentation/fields where necessary.

### 3.2 Content fields

Every content record should support, as applicable:

- [ ] `type`: `blog | tip | news`.
- [ ] Title.
- [ ] URL slug.
- [ ] Short description / excerpt.
- [ ] Main article/body content.
- [ ] Featured image.
- [ ] Featured image alt text.
- [ ] Category.
- [ ] Tags.
- [ ] Author/byline where appropriate.
- [ ] Related service.
- [ ] SEO title.
- [ ] Meta description.
- [ ] Social/Open Graph image.
- [ ] Draft/published status.
- [ ] Publish date/time.
- [ ] Created timestamp.
- [ ] Updated timestamp.
- [ ] Stable database identifier.

### 3.3 Categories / taxonomy

Create a reusable category/taxonomy structure suitable for salon content, including the requirements identified in the original plan:

**Hair**
- Hair Care
- Hair Treatments
- Hair Colour
- Hair Extensions

**Beauty**
- Skincare
- Nails
- Brows & Lashes
- Waxing

**Lifestyle**
- Dubai Beauty
- UAE Beauty
- Seasonal
- Events

**Salon**
- News
- Offers
- Announcements

The architecture must allow additional categories later without code changes.

### 3.4 Database rules

- [ ] MongoDB Atlas is the production data store.
- [ ] Slugs are unique within the relevant content namespace/type.
- [ ] Required fields are validated server-side.
- [ ] Published records have valid publication state/date data.
- [ ] Draft records are never returned by public listing/detail APIs unless explicitly intended.
- [ ] API input is validated and normalized.
- [ ] Database errors are logged server-side without exposing sensitive internals to users.
- [ ] Appropriate indexes exist for type, status, slug, publication date and common filters.
- [ ] API responses do not expose credentials/secrets/internal connection details.

### 3.5 CRUD API

Authenticated admin APIs must support:

- [ ] Create.
- [ ] Read/list.
- [ ] Update.
- [ ] Delete with server authorization.
- [ ] Publish.
- [ ] Unpublish.
- [ ] Draft retrieval.
- [ ] Search/filter.
- [ ] Duplicate content where useful.

Public APIs must support published content retrieval by type, listing/filtering and individual slug.

**Stage 3 acceptance:** MongoDB contains the reusable content foundation and authenticated APIs can safely create/edit/delete/publish content while public APIs expose only intended published content.

## 9. Stage 4 — Admin Content Editor & Dashboard

### 4.1 Dashboard structure

The admin should evolve from the current mock page into a usable CMS dashboard:

```text
ADMIN
────────────────────────────────────
Dashboard

CONTENT
  ├── Blog Posts
  ├── Beauty Tips
  ├── Salon News
  ├── Offers
  └── Announcements

WEBSITE
  ├── Services
  ├── Packages
  ├── Gallery
  └── Testimonials

SETTINGS
  ├── SEO
  ├── Contact Details
  └── Admin Account
```

Not every later section must be functional before its stage, but the dashboard architecture must accommodate them without requiring a rewrite.

### 4.2 Content list screens

For Blog Posts, Beauty Tips and Salon News:

- [ ] Clear section title.
- [ ] Search input.
- [ ] Filter by status.
- [ ] Filter by category/type where applicable.
- [ ] Content cards/table showing title, category and publication status/date.
- [ ] Edit action.
- [ ] Duplicate action.
- [ ] Publish/unpublish action.
- [ ] Delete action with confirmation.
- [ ] Add New action.
- [ ] Useful empty/loading/error states.

### 4.3 Blog editor

`Blog Posts → Add New` must provide:

**Content**
- [ ] Title.
- [ ] URL slug.
- [ ] Category selector.
- [ ] Featured image upload.
- [ ] Short description/excerpt.
- [ ] Rich article/body editor with normal formatting, headings, lists, links and images as appropriate.
- [ ] Tags.
- [ ] Related service.

**SEO**
- [ ] SEO title.
- [ ] Meta description.
- [ ] Keywords/tags where retained by the design.
- [ ] Social/Open Graph image.
- [ ] Slug control.

**Publishing**
- [ ] Save Draft.
- [ ] Publish.
- [ ] Publish immediately option.
- [ ] Publish date/time handling.
- [ ] Clear published/draft state.

The editor must not require touching code, GitHub or Vercel.

### 4.4 Beauty Tip editor

Beauty Tips must support the existing six-tip content structure while becoming database records:

- [ ] Title.
- [ ] Description.
- [ ] Featured image.
- [ ] Tip 1.
- [ ] Tip 2.
- [ ] Tip 3.
- [ ] Tip 4.
- [ ] Tip 5.
- [ ] Related service.
- [ ] Category/tags.
- [ ] SEO fields.
- [ ] Draft/published state.
- [ ] Save Changes.

The editor should support adding/removing/editing tips without source-code changes.

### 4.5 Salon News editor

News is a separate content type, not forced into Beauty Tips.

It must support announcements such as:

- New service launched.
- New staff member.
- New equipment.
- Holiday opening hours.
- Eid announcement.
- Ramadan timings.
- Salon renovation.
- Special event.
- New product line.

Each news item must support image, title, text/content, category/status and publication date.

### 4.6 Image handling

- [ ] Admin can upload/select images from the editor.
- [ ] Images are stored through an appropriate image/object-storage solution rather than putting large binary files directly in MongoDB.
- [ ] Stored image URL/reference is persisted with the content record.
- [ ] Featured image alt text is supported.
- [ ] Failed uploads show a usable error and do not create broken content records.
- [ ] Existing public design is preserved while images become dynamic.

**Stage 4 acceptance:** A non-technical admin can log in, create a Blog/Tip/News item, upload its image, save a draft, edit it, publish it, unpublish it and delete it without touching code.

## 10. Stage 5 — Public Tips / Blog / News Content System

### 5.1 Database-driven public pages

Replace hard-coded content with API/database content.

- [ ] Existing Beauty Tips page no longer depends on six hard-coded objects in `TipsPage.tsx`.
- [ ] Existing six tips are migrated accurately into the CMS.
- [ ] Public page loads published content dynamically.
- [ ] Draft content is not publicly visible.
- [ ] Loading/error/empty states are handled.
- [ ] Existing website visual language is preserved unless redesign is explicitly requested.

### 5.2 Beauty Journal / Tips listing

Upgrade the existing Tips page into a proper editorial page while preserving brand/design quality:

```text
BEAUTY JOURNAL
Beauty advice for the Dubai lifestyle

[ All ] [ Hair ] [ Skin ] [ Nails ] [ Dubai ]

Featured article
  Image
  Category
  Title
  Description
  Read Article →

Latest Beauty Tips
  Article cards with image/title/category/summary
```

Requirements:

- [ ] Featured content area.
- [ ] Latest content listing.
- [ ] Category/filter controls.
- [ ] Article cards link to individual pages.
- [ ] Pagination/load-more strategy if content volume requires it.
- [ ] Search/filter behavior is usable on desktop and mobile.

### 5.3 Individual content URLs

Implement real indexable routes such as:

```text
/beauty-tips
/beauty-tips/dubai-hard-water-hair
/beauty-tips/protect-hair-dubai-summer

/blog
/blog/how-to-prepare-for-eid
/blog/keratin-vs-protein-treatment

/news
/news/ramadan-opening-hours
/news/new-services-at-layali-al-zahra
```

Requirements:

- [ ] Each published item has a stable slug URL.
- [ ] Individual article page displays full content.
- [ ] Correct H1/title hierarchy.
- [ ] Featured image and alt text.
- [ ] Publication information where appropriate.
- [ ] Category/tags where appropriate.
- [ ] Related service/internal links.
- [ ] 404 handling for missing/unpublished slugs.
- [ ] No accidental exposure of drafts.

### 5.4 Content-to-service strategy

Educational content must be capable of leading readers toward relevant salon services rather than becoming disconnected generic articles.

- [ ] Each applicable content item can specify a Related Service.
- [ ] Public article page can show a relevant service CTA/link.
- [ ] Internal links can connect related content and service pages.
- [ ] The implementation must avoid hard-coded service relationships where the CMS can manage them.

### 5.5 SEO per content item

Each individual content page must support:

- [ ] `<title>` / SEO title.
- [ ] Meta description.
- [ ] Canonical URL.
- [ ] Open Graph/social image.
- [ ] H1.
- [ ] Structured article content.
- [ ] Featured image alt text.
- [ ] Internal links.
- [ ] Appropriate indexability behavior.

**Stage 5 acceptance:** The six existing tips are migrated; the public Tips/Blog/News pages load from MongoDB; published content appears without code deployment; each article has its own indexable URL and metadata; drafts remain private.

## 11. Stage 6 — Offers

Build Offers as a CMS-managed website section after the core content system is proven.

### Offer editor fields

- [ ] Offer title.
- [ ] Short/full description.
- [ ] Services included.
- [ ] Offer price.
- [ ] Original price where applicable.
- [ ] Start date.
- [ ] End date.
- [ ] Featured image.
- [ ] Category/tag.
- [ ] Published/unpublished state.
- [ ] Optional CTA/booking link.

### Example

```text
Eid Beauty Package — AED 299

Services included: ...
Original price: AED ...
Start date: ...
End date: ...
Image: ...
Published: Yes
```

### Public behavior

- [ ] Existing Offers page becomes database-driven.
- [ ] Active/current offers are displayed correctly.
- [ ] Expired offers can automatically stop appearing or be clearly marked according to final UX.
- [ ] Admin can publish/unpublish without code.

**Stage 6 acceptance:** Admin can create, edit, schedule, publish/unpublish and remove an offer and the public Offers page reflects the change without a code deployment.

## 12. Stage 7 — Services & Packages

### Services

Replace hard-coded service definitions with CMS-managed records.

- [ ] Service name.
- [ ] Description.
- [ ] Category.
- [ ] Image where applicable.
- [ ] Price or starting price where applicable.
- [ ] Duration where applicable.
- [ ] Published/active state.
- [ ] Display ordering.
- [ ] SEO fields where relevant.
- [ ] Related content/CTA relationships where useful.

The implementation must replace source-code arrays such as `const services = [...]` with database-driven content without breaking the existing design.

### Packages

- [ ] Package name.
- [ ] Description.
- [ ] Included services.
- [ ] Package price.
- [ ] Original/reference price where applicable.
- [ ] Image.
- [ ] Validity/availability information where applicable.
- [ ] Published/active state.
- [ ] Display ordering.

### Public behavior

- [ ] Existing Services page becomes database-driven.
- [ ] Existing Packages page becomes database-driven.
- [ ] Existing visual presentation remains intact unless explicitly redesigned.
- [ ] Admin changes reflect publicly without source edits.

**Stage 7 acceptance:** The salon can change services and packages from the dashboard and the website updates from the database without developer intervention.

## 13. Stage 8 — Gallery & Testimonials

### Gallery

Admin must be able to upload/manage salon images and categorize them.

Required categories include:

- [ ] Hair.
- [ ] Nails.
- [ ] Makeup.
- [ ] Bridal.
- [ ] Salon.

Gallery requirements:

- [ ] Image upload.
- [ ] Image title/caption where useful.
- [ ] Alt text.
- [ ] Category.
- [ ] Display ordering.
- [ ] Published/visible state.
- [ ] Delete/replace.
- [ ] Public gallery loads from CMS/image storage.
- [ ] Existing gallery presentation is preserved unless redesigned.

### Testimonials

Admin must be able to manage:

- [ ] Client name.
- [ ] Review text.
- [ ] Rating.
- [ ] Date.
- [ ] Optional client photo.
- [ ] Published/unpublished state.
- [ ] Display ordering where useful.

Public requirements:

- [ ] Published testimonials appear dynamically.
- [ ] Unpublished testimonials remain private.
- [ ] Existing testimonial design is preserved unless redesigned.

**Stage 8 acceptance:** Admin can add/edit/publish gallery items and testimonials without code, and public sections update from CMS data.

## 14. Stage 9 — Sitewide SEO, Analytics & Content Performance

This stage is separate from the per-article SEO fields implemented in Stage 4/5. Stage 9 covers sitewide controls and measurement.

### SEO settings

- [ ] Global site title/default title.
- [ ] Default meta description.
- [ ] Default social/Open Graph image.
- [ ] Canonical-domain configuration.
- [ ] Robots/indexability controls where appropriate.
- [ ] XML sitemap strategy covering published dynamic content.
- [ ] Correct canonical URLs for dynamic pages.
- [ ] Structured data/schema where appropriate for the site/content types.

### Analytics / Search

- [ ] Google Analytics integration or equivalent analytics integration.
- [ ] Google Search Console readiness/verification support.
- [ ] Content performance tracking where technically appropriate.
- [ ] Most viewed articles metric where available.
- [ ] Published content count.
- [ ] Useful dashboard statistics.
- [ ] Search/filter controls for content performance data.

### Marketing/content insight

The dashboard should eventually make it possible to understand:

- Which articles are being viewed.
- Which content is published/draft.
- Which categories have the most content.
- Which content can be improved/updated.
- Which content should lead users toward relevant services.

**Stage 9 acceptance:** Sitewide SEO controls are manageable, dynamic content is indexable correctly, analytics/search integrations are functional, and the admin dashboard provides useful content-level statistics where data is available.

## 15. Cross-Stage Non-Negotiable Requirements

### Security

- Database credentials never committed to GitHub.
- Secrets remain in server-side environment variables.
- Admin authentication is server-side.
- Frontend state is never treated as authentication.
- Protected write APIs require a valid admin session.
- Sensitive database/auth errors are never returned to public users.
- Delete operations require deliberate admin action/confirmation.
- User-provided content is validated/sanitized appropriately before rendering.

### Usability

- Admin must be usable by a non-technical salon owner.
- No GitHub/code/Vercel steps are part of normal publishing.
- Forms need clear validation, loading, success and failure states.
- Destructive actions need confirmation.
- Empty states should explain what to do next.
- Mobile usability must be considered for the admin UI.

### Design preservation

- Existing public website remains the baseline.
- CMS implementation must not casually redesign unrelated public pages.
- Dynamic content should inherit the existing typography, spacing, colors, cards, navigation and responsive behavior unless a redesign is explicitly requested.

### Performance / reliability

- Avoid unnecessary database connections per request.
- Use appropriate indexes and pagination.
- Do not store large image binaries directly in MongoDB.
- Public pages should remain performant with increasing content volume.
- API failures must degrade gracefully.

## 16. Definition of Done — Core MVP

The core MVP is complete only when all of the following are true:

- [ ] Real private `/admin` authentication.
- [ ] Secure MongoDB Atlas production connection.
- [ ] Authenticated CMS APIs.
- [ ] Unified Blog/Tips/News content model.
- [ ] Blog/Tips/News CRUD.
- [ ] Draft/publish/unpublish workflows.
- [ ] Image upload/storage.
- [ ] Categories and tags.
- [ ] Related services.
- [ ] Per-content SEO fields.
- [ ] Six existing Beauty Tips migrated.
- [ ] Public Tips/Blog/News pages are database-driven.
- [ ] Individual slug URLs work.
- [ ] Drafts are not publicly visible.
- [ ] Existing public site remains intact.
- [ ] Production build/deployment verified.
- [ ] Owner can publish/update content without touching code.

## 17. Change-Control & Continuation Protocol

Before every implementation step:

1. Read this BRD.
2. Inspect the current GitHub repository state.
3. Identify the first incomplete stage/checklist item.
4. Implement the **full requirement**, not a simplified interpretation.
5. Test/verify the change.
6. Update the BRD status/checklist immediately.
7. Record important implementation decisions/constraints in the BRD.
8. Only then proceed to the next stage.

When the project is resumed in a later conversation, the BRD plus current GitHub state are the authoritative project context. Do not reconstruct requirements from memory or replace detailed requirements with a shorter summary.

## 18. Original Planning Reference

The detailed planning notes that established the intended scope explicitly require: a real server-side admin login; a proper dashboard; unified Blog/Tips/News content; a simple non-technical editor; migration of the six existing tips; separate Salon News; categories; individual slug URLs; per-page SEO; an upgraded Beauty Journal/Tips page; related-service linking; MongoDB/Vercel architecture; and later Offers, Services, Packages, Testimonials, Gallery and analytics. This BRD expands those requirements into implementation checklists so they are not lost between sessions.

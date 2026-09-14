# Layali Al Zahra Website — Admin CMS / Content Management BRD

**Project:** Layali Al Zahra Beauty Lounge website  
**Repository:** `layalialzahra/layali-al-zahra-website`  
**Primary admin URL:** `https://layalialzahra.com/admin`  
**Status:** 🟡 Implementation in progress

## Stage 4.1 Correction Status
The previous Stage 4.1 implementation was not accepted. The current correction pass is the source of truth for the next live verification.

- Public navigation maps Home, Services, Packages, Offers and Contact to explicit paths; Tips, Blog and News retain clean content paths.
- Vercel SPA rewrites now cover `/services`, `/packages`, `/offers`, `/contact` and `/home` as well as the existing admin/content routes, so direct navigation to the existing public pages reaches the SPA correctly.
- Blog/News listing cards no longer show hashtag-style tags.
- Listing and detail images use fixed aspect-ratio containers with `object-fit: cover`.
- Public content pages use explicit editorial typography, spacing and card geometry aligned to the existing Offers visual system.
- Admin login, Dashboard, Content Library, editor and Settings form one coherent responsive CMS workspace with desktop sidebar and mobile drawer.
- Content Library has structured filters, create actions, thumbnails, status badges and compact row actions.
- Editor has a primary content column plus dedicated media/publishing rail and fixed image preview crop.
- Existing authentication, MongoDB APIs, CRUD, publishing, duplication, deletion, image upload and password-change behavior are preserved.
- Protected demo seed provides two Blog items, two Beauty Tips and two News items; management has loaded the six records for review.

| Stage | Status |
|---|---|
| 0 — Baseline & Safety | 🟢 Complete |
| 1 — MongoDB Production Connection | 🟢 Complete |
| 2 — Secure Admin Authentication | 🟢 Complete |
| 3 — CMS Foundation | 🟢 Complete |
| 4 — Admin Content Editor | 🟢 Complete |
| 4.1 — Public Content Presentation & Admin UX | 🟡 In progress — live acceptance pending |
| 5 — Public Tips/Blog/News | 🔒 Blocked until Stage 4.1 passes |
| 6 — Offers | ⬜ Not started |
| 7 — Services & Packages | ⬜ Not started |
| 8 — Gallery & Testimonials | ⬜ Not started |
| 9 — SEO & Analytics | ⬜ Not started |

## Stage 4.1 Acceptance Gate
- [ ] Services, Packages, Offers and Contact open correctly from the public header on desktop/mobile.
- [ ] Tips, Blog and News match the Offers visual language on desktop/mobile.
- [ ] All six management sample records render correctly on public listing/detail pages.
- [ ] Homepage Tips/Blog/News showcases render correctly with sample records.
- [ ] Public image crops remain consistent at desktop/mobile widths.
- [ ] Admin login/setup is coherent and usable on desktop/mobile.
- [ ] Admin Dashboard, Content Library, editor and Settings form one coherent workspace.
- [ ] First-time admin can identify create/edit/publish/unpublish/duplicate/delete actions without developer assistance.
- [ ] Existing CMS CRUD, image upload, publishing and authentication behavior remain intact.
- [ ] No Stage 5 execution or production-domain cutover before this gate passes.

## Stage 5 Status
Stage 5 remains blocked. Existing route/API foundations are retained, but six-tip migration and final public acceptance do not begin until Stage 4.1 passes live review.

## Change Log — 2026-09-14 Stage 4.1 Correction Pass
- Reviewed the original repository structure and established Offers page instead of treating the previous Stage 4.1 implementation as the design baseline.
- Corrected public routing for Services, Packages, Offers and Contact and added the required Vercel SPA rewrites for those paths.
- Removed hashtag tags from Blog/News listing cards.
- Standardized public image crop geometry and detail-page editorial typography.
- Rebuilt the admin login, Dashboard, Content Library, editor and Settings into one visual system.
- Preserved existing CMS/security/API behavior.
- Kept six management sample records available for review.
- Stage 4.1 remains in progress until live desktop/mobile acceptance is completed.

Historical Stage 0–4 evidence remains in repository history. This current section supersedes any earlier Stage 4.1 claim that the experience had already been accepted.
